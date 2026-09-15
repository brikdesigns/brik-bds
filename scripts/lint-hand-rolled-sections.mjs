#!/usr/bin/env node

/**
 * lint-hand-rolled-sections — ADR-039 §Enforcement guardrail 2 (#2495).
 *
 * The operator constraint ADR-039 exists to hold: "we can't afford to have
 * agents hand-rolling components." A generated site section is meant to be a
 * blueprint composed through props (`<BlueprintDispatcher sections={…} />`, or a
 * blueprint invoked with its `align`/`media`/`reveal`/`contentMotion` axes) —
 * NOT a bespoke `.astro` carrying its own CSS. A look a blueprint does not offer
 * is a MISSING AXIS to add to the blueprint, never a `<style>` block bolted onto
 * the page. This gate fails the latter.
 *
 * Hand-rolling, per ADR-039, is any generated section carrying:
 *   1. a `<style>` block            — bespoke CSS instead of blueprint props
 *   2. an `@keyframes` rule         — hand-rolled motion instead of the axis
 *   3. an inline `transition:`/`animation:` (in a `style=` attribute)
 *   4. a raw hex / px / duration literal in a `style=` attribute — off-token
 *
 * Raw-value detection is scoped to inline `style=` attributes on purpose: a bare
 * `<style>` block is already a violation (rule 1), so the only place a raw
 * literal can otherwise hide in a composed page is an inline style attribute.
 * Scoping there keeps `href="#contact"` and an `id="fade"` from reading as a hex
 * colour.
 *
 * This is the reusable half. Two callers, mirroring #2496's coverage gate:
 *   - brik-bds runs it over `content-system/blueprints/astro/__examples__/`, the
 *     committed corpus of canonical generated pages, in `validate` + pre-commit.
 *   - each client site points `--root` at its own `src/pages/` (or built
 *     sections) in its CI, where the real hand-rolling happens (ADR-039 names
 *     `ServicesBento.astro`, `BeforeAfterGallery.astro` as the shape).
 *
 * Escape hatch: `bds-lint-ignore hand-rolled-section — <reason>` on the offending
 * line. A bare marker is rejected (#1469) — an ungated bypass of a gate is not a
 * gate.
 *
 * Usage:
 *   node scripts/lint-hand-rolled-sections.mjs                 # default corpus
 *   node scripts/lint-hand-rolled-sections.mjs --root <dir>    # fixture tree / client src
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import lintIgnore from './lib/bds-lint-ignore.cjs';

const { isBareLintIgnore, hasLintIgnore, BARE_IGNORE_MESSAGE } = lintIgnore;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

/** `--flag value` override, so the suite can point the gate at fixtures. */
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const SCAN_ROOT =
  argValue('--root') ?? join(ROOT, 'content-system', 'blueprints', 'astro', '__examples__');

/** The `bds-lint-ignore` keyword that exempts a line from this gate. */
const IGNORE_RULE = 'hand-rolled-section';

/** Every `.astro` file under `root`, recursive. */
function astroFiles(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true })
    .map((name) => join(root, name.toString()))
    .filter((path) => path.endsWith('.astro') && statSync(path).isFile());
}

/**
 * The rules. Each returns the matched literal (for the message) or null. Applied
 * per line so a `bds-lint-ignore` on that line can exempt exactly it.
 */
const RULES = [
  {
    id: 'style-block',
    label: 'hand-rolled <style> block',
    test: (line) => (/<style[\s>]/i.test(line) ? '<style>' : null),
  },
  {
    id: 'keyframes',
    label: '@keyframes (hand-rolled motion — use the contentMotion axis)',
    test: (line) => (/@keyframes\b/i.test(line) ? '@keyframes' : null),
  },
  {
    id: 'inline-motion',
    label: 'inline transition:/animation: (use the reveal / contentMotion axis)',
    test: (line) => {
      const style = inlineStyle(line);
      if (!style) return null;
      const m = /\b(transition|animation)\s*:/i.exec(style);
      return m ? m[0] : null;
    },
  },
  {
    id: 'raw-value',
    label: 'raw hex / px / duration in an inline style (use a token)',
    test: (line) => {
      const style = inlineStyle(line);
      if (!style) return null;
      const m =
        /#[0-9a-f]{3,8}\b/i.exec(style) ||
        /\b\d*\.?\d+px\b/i.exec(style) ||
        /\b\d*\.?\d+m?s\b/i.exec(style);
      return m ? m[0] : null;
    },
  },
];

/** The value of an inline `style="…"` / `style={`…`}` attribute on this line. */
function inlineStyle(line) {
  const m = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/i.exec(line);
  return m ? m[1] ?? m[2] ?? m[3] ?? '' : null;
}

/**
 * The markup half of an `.astro` file — everything after the frontmatter fence
 * — with the line offset that keeps reported line numbers file-accurate.
 * Hand-rolled CSS (`<style>`, inline `style=`, `@keyframes`) only ever lives in
 * the markup; the frontmatter is TS. Scanning markup-only is both correct and
 * what stops a doc comment that mentions `<style>` reading as one.
 */
function markup(source) {
  const lines = source.split('\n');
  if (lines[0]?.trim() === '---') {
    const close = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
    if (close !== -1) return { lines: lines.slice(close + 1), offset: close + 1 };
  }
  return { lines, offset: 0 };
}

/**
 * `bds-lint-ignore` in `.astro` markup rides in an HTML comment (`<!-- … -->`).
 * The shared reason parser terminates a block comment at its closing delimiter,
 * so map the HTML delimiters onto the JS block-comment form — otherwise the
 * `-->` and the markup trailing it read as the reason, and a bare marker never
 * reads as bare.
 */
const forIgnore = (line) => line.replace(/<!--/g, '/*').replace(/-->/g, '*/');

const files = astroFiles(SCAN_ROOT);
const violations = [];

for (const path of files) {
  const rel = relative(ROOT, path);
  const { lines, offset } = markup(readFileSync(path, 'utf8'));
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      const hit = rule.test(line);
      if (!hit) continue;
      const ignoreLine = forIgnore(line);
      if (hasLintIgnore(ignoreLine) && !isBareLintIgnore(ignoreLine)) continue;
      violations.push({
        file: rel,
        line: offset + i + 1,
        rule: rule.id,
        label: rule.label,
        detail: hit,
        bareIgnore: hasLintIgnore(ignoreLine) && isBareLintIgnore(ignoreLine),
      });
    }
  });
}

if (violations.length === 0) {
  console.log(
    `${GREEN}✓${NC} lint-hand-rolled-sections: ${files.length} section file(s) scanned, none hand-rolls style or motion.`,
  );
  process.exit(0);
}

console.log(`\n${RED}✗ lint-hand-rolled-sections: ${violations.length} violation(s)${NC}\n`);
for (const v of violations) {
  console.log(`  ${v.file}:${v.line}  ${RED}${v.rule}${NC}`);
  console.log(`      ${v.label} ${DIM}(${v.detail})${NC}`);
  if (v.bareIgnore) console.log(`      ${YELLOW}${BARE_IGNORE_MESSAGE}${NC}`);
}
console.log(
  `\n${YELLOW}  A generated section is a blueprint composed through props, not bespoke CSS.${NC}\n` +
    '  Use a blueprint + its align / media / reveal / contentMotion axes (ADR-039).\n' +
    '  A look no blueprint offers is a missing AXIS to add to the blueprint — not a\n' +
    `  <style> block here. Genuinely unavoidable? Add \`bds-lint-ignore ${IGNORE_RULE} — <reason>\`.\n`,
);
process.exit(1);
