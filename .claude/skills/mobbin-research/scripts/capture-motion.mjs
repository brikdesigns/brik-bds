#!/usr/bin/env node
/**
 * capture-motion.mjs — read motion off a live page, map it onto BDS tokens.
 *
 * Mobbin returns still frames. It carries no timing data, so any duration or
 * easing "read" from a Mobbin screenshot is fabricated. This script is the
 * animation arm: point it at the real site behind a reference and it reads
 * computed transition/animation values straight off the DOM.
 *
 * The mapping is one-way and deliberate: observed timing -> nearest EXISTING
 * token from dist/tokens.css. A value with no near match prints NO MATCH with
 * its raw value. This script never writes a token, and never touches tokens/
 * or dist/ — widening the motion scale is a human decision on a ticket.
 *
 *   node capture-motion.mjs <url> [--video] [--no-scroll] [--out <dir>]
 *                                 [--json] [--timeout <ms>]
 */

import { chromium } from "playwright";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "../../../..");
const TOKENS_CSS = join(REPO_ROOT, "dist/tokens.css");

/* Match tolerance. Outside these, a value reports NO MATCH rather than being
   rounded into a token it isn't — a silent round is how a foreign scale gets
   laundered into BDS vocabulary. */
const DURATION_TOLERANCE_MS = 30;
const DURATION_TOLERANCE_PCT = 0.15;
const EASE_TOLERANCE = 0.25;

/* CSS keyword easings, normalised to control points so keyword and explicit
   cubic-bezier declarations compare on the same footing. */
const KEYWORD_EASINGS = {
  ease: [0.25, 0.1, 0.25, 1],
  linear: [0, 0, 1, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
};

// ─── args ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { video: false, scroll: true, json: false, timeout: 30000 };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--video") args.video = true;
    else if (a === "--no-scroll") args.scroll = false;
    else if (a === "--json") args.json = true;
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--timeout") args.timeout = Number(argv[++i]);
    else if (a.startsWith("-")) throw new Error(`Unknown flag: ${a}`);
    else rest.push(a);
  }
  args.url = rest[0];
  return args;
}

// ─── token registry ──────────────────────────────────────────────────────────

/**
 * Read the duration + ease scale from dist/tokens.css. Parsed at runtime on
 * purpose — a hardcoded copy here would silently drift from the registry the
 * moment the scale changes, and this script would start reporting matches
 * against tokens that no longer exist.
 */
async function loadTokens() {
  let css;
  try {
    css = await readFile(TOKENS_CSS, "utf8");
  } catch {
    throw new Error(
      `Cannot read ${TOKENS_CSS}. dist/ is gitignored, so a fresh worktree ` +
        `has no registry to map onto — run \`npm run build:dist-tokens\` first.`,
    );
  }

  const raw = new Map();
  for (const [, name, value] of css.matchAll(
    /(--(?:duration|ease)[a-z0-9-]*)\s*:\s*([^;]+);/gi,
  )) {
    if (!raw.has(name)) raw.set(name, value.trim());
  }

  // Resolve var() aliases — --duration-fast is defined as var(--duration-100).
  const resolveValue = (value, depth = 0) => {
    const ref = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(value);
    if (!ref || depth > 10) return value;
    const target = raw.get(ref[1]);
    return target ? resolveValue(target, depth + 1) : value;
  };

  const durations = [];
  const easings = [];

  for (const [name, rawValue] of raw) {
    const value = resolveValue(rawValue)
      .replace(/\/\*.*?\*\//gs, "")
      .trim();
    if (name.startsWith("--duration")) {
      const ms = toMs(value);
      if (ms !== null) durations.push({ name, ms, value });
    } else {
      const points = toControlPoints(value);
      if (points) easings.push({ name, points, value });
    }
  }

  if (!durations.length || !easings.length) {
    throw new Error(`No duration/ease tokens parsed from ${TOKENS_CSS}.`);
  }
  return { durations, easings };
}

// ─── value normalisation ─────────────────────────────────────────────────────

function toMs(value) {
  const m = /^(-?[\d.]+)(ms|s)$/i.exec(value.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n)
    ? m[2].toLowerCase() === "s"
      ? n * 1000
      : n
    : null;
}

function toControlPoints(value) {
  const v = value.trim().toLowerCase();
  if (KEYWORD_EASINGS[v]) return KEYWORD_EASINGS[v];
  const m = /^cubic-bezier\(([^)]+)\)$/.exec(v);
  if (!m) return null; // steps(), linear(), spring() — intentionally unmatched
  const nums = m[1].split(",").map((n) => Number(n.trim()));
  return nums.length === 4 && nums.every(Number.isFinite) ? nums : null;
}

// ─── mapping ─────────────────────────────────────────────────────────────────

function matchDuration(observedMs, durations) {
  let best = null;
  for (const token of durations) {
    const delta = Math.abs(token.ms - observedMs);
    if (!best || delta < best.delta) best = { token, delta };
  }
  const tolerance = Math.max(
    DURATION_TOLERANCE_MS,
    observedMs * DURATION_TOLERANCE_PCT,
  );
  return best && best.delta <= tolerance
    ? { token: best.token.name, exact: best.delta === 0, delta: best.delta }
    : null;
}

function matchEasing(points, easings) {
  let best = null;
  for (const token of easings) {
    const dist = Math.hypot(...points.map((p, i) => p - token.points[i]));
    if (!best || dist < best.dist) best = { token, dist };
  }
  return best && best.dist <= EASE_TOLERANCE
    ? { token: best.token.name, exact: best.dist < 0.001, delta: best.dist }
    : null;
}

// ─── page sampling ───────────────────────────────────────────────────────────

/**
 * Walk every element and record declared transition + running animation values.
 *
 * Transitions sit in computed style at rest, so no interaction is needed to see
 * them. Animations only appear while running — scroll-triggered reveals are the
 * reason this gets re-sampled down the page.
 */
const SAMPLE = () => {
  const out = { transitions: [], animations: [] };
  const seen = new Set();

  /* Computed style returns parallel comma-separated lists, but the values
     themselves contain commas — cubic-bezier(0.25, 0.1, 0.25, 1) is ONE entry.
     A naive split shreds it into four. */
  const splitList = (value) => {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const ch of value) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else current += ch;
    }
    parts.push(current.trim());
    return parts.filter((p) => p.length);
  };

  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    const label =
      el.tagName.toLowerCase() +
      (el.className && typeof el.className === "string"
        ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
        : "");

    const tProps = splitList(cs.transitionProperty);
    const tDurs = splitList(cs.transitionDuration);
    const tEases = splitList(cs.transitionTimingFunction);
    for (let i = 0; i < tDurs.length; i++) {
      if (!tDurs[i] || tDurs[i] === "0s") continue;
      if (tProps[i % tProps.length] === "none") continue;
      const key = `t|${tDurs[i]}|${tEases[i % tEases.length]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.transitions.push({
        duration: tDurs[i],
        easing: tEases[i % tEases.length] || "ease",
        property: tProps[i % tProps.length],
        sample: label,
      });
    }

    if (cs.animationName && cs.animationName !== "none") {
      const aNames = splitList(cs.animationName);
      const aDurs = splitList(cs.animationDuration);
      const aEases = splitList(cs.animationTimingFunction);
      for (let i = 0; i < aNames.length; i++) {
        if (aNames[i] === "none") continue;
        const dur = aDurs[i % aDurs.length];
        const ease = aEases[i % aEases.length] || "ease";
        const key = `a|${aNames[i]}|${dur}|${ease}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.animations.push({
          name: aNames[i],
          duration: dur,
          easing: ease,
          sample: label,
        });
      }
    }
  }
  return out;
};

async function sampleThroughPage(page, scroll) {
  const merged = { transitions: [], animations: [] };
  const seen = new Set();

  const absorb = (batch) => {
    for (const kind of ["transitions", "animations"]) {
      for (const entry of batch[kind]) {
        const key = kind + JSON.stringify(entry);
        if (seen.has(key)) continue;
        seen.add(key);
        merged[kind].push(entry);
      }
    }
  };

  absorb(await page.evaluate(SAMPLE));

  if (scroll) {
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      await page.evaluate(
        (frac) => window.scrollTo(0, document.body.scrollHeight * frac),
        i / steps,
      );
      await page.waitForTimeout(600);
      absorb(await page.evaluate(SAMPLE));
    }
  }
  return merged;
}

// ─── reporting ───────────────────────────────────────────────────────────────

function tally(entries, key) {
  const counts = new Map();
  for (const e of entries) counts.set(e[key], (counts.get(e[key]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function buildReport(observed, tokens) {
  const all = [...observed.transitions, ...observed.animations];

  const durations = tally(all, "duration").map(([value, count]) => {
    const ms = toMs(value);
    const match = ms === null ? null : matchDuration(ms, tokens.durations);
    return { value, ms, count, match };
  });

  const easings = tally(all, "easing").map(([value, count]) => {
    const points = toControlPoints(value);
    const match = points ? matchEasing(points, tokens.easings) : null;
    return { value, count, match };
  });

  return { durations, easings };
}

function printReport(url, observed, report) {
  const line = (label, m) =>
    !m
      ? `NO MATCH        ${label}`
      : m.exact
        ? `${m.token.padEnd(16)}exact`
        : `${m.token.padEnd(16)}~${label}`;

  console.log(`\nMotion read from ${url}`);
  console.log(
    `${observed.transitions.length} distinct transitions, ` +
      `${observed.animations.length} running animations\n`,
  );

  console.log("DURATIONS");
  if (!report.durations.length) console.log("  (none observed)");
  for (const d of report.durations) {
    const delta =
      d.match && !d.match.exact ? `off by ${Math.round(d.match.delta)}ms` : "";
    console.log(
      `  ${String(d.value).padEnd(10)} x${String(d.count).padEnd(4)} -> ` +
        `${line(delta || d.value, d.match)}`,
    );
  }

  console.log("\nEASINGS");
  if (!report.easings.length) console.log("  (none observed)");
  for (const e of report.easings) {
    const delta =
      e.match && !e.match.exact ? `dist ${e.match.delta.toFixed(3)}` : "";
    console.log(
      `  ${e.value.padEnd(42)} x${String(e.count).padEnd(4)} -> ` +
        `${line(delta || e.value, e.match)}`,
    );
  }

  const unmatched = [
    ...report.durations.filter((d) => !d.match),
    ...report.easings.filter((e) => !e.match),
  ];
  if (unmatched.length) {
    console.log(
      `\n${unmatched.length} value(s) have no BDS equivalent. That is a ` +
        `finding, not a licence to add tokens — file it and let a human ` +
        `decide whether the scale should widen.`,
    );
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url) {
    console.error(
      "Usage: node capture-motion.mjs <url> [--video] [--no-scroll] " +
        "[--out <dir>] [--json] [--timeout <ms>]",
    );
    process.exit(1);
  }

  // Default output lives outside the repo so a capture can never dirty the
  // working tree or land in a commit.
  const outDir = args.out ?? join(tmpdir(), "bds-motion-capture");
  await mkdir(outDir, { recursive: true });

  const tokens = await loadTokens();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(args.video
      ? { recordVideo: { dir: outDir, size: { width: 1440, height: 900 } } }
      : {}),
  });
  const page = await context.newPage();

  let observed;
  try {
    await page.goto(args.url, { waitUntil: "load", timeout: args.timeout });
    await page.waitForTimeout(1200); // let entrance animations start
    observed = await sampleThroughPage(page, args.scroll);
  } finally {
    await context.close(); // flushes the video file
    await browser.close();
  }

  const report = buildReport(observed, tokens);

  if (args.json) {
    console.log(JSON.stringify({ url: args.url, observed, report }, null, 2));
  } else {
    printReport(args.url, observed, report);
  }

  const reportPath = join(outDir, "motion-report.json");
  await writeFile(
    reportPath,
    JSON.stringify({ url: args.url, observed, report }, null, 2),
  );
  if (!args.json) console.log(`\nReport: ${reportPath}`);
  if (args.video && !args.json) console.log(`Video:  ${outDir}`);
}

main().catch((err) => {
  console.error(`capture-motion: ${err.message}`);
  process.exit(1);
});
