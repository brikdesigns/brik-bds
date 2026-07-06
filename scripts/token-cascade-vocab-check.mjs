#!/usr/bin/env node
/**
 * token-cascade-vocab-check — retired token-cascade vocabulary gate for docs-site MDX.
 *
 * Fails when retired token-cascade layering terms reappear in docs-site content
 * MDX prose. PR #736 locked the six-concept token vocabulary (Anatomy / Tier /
 * Library / Layer / Mode / Tenet) and swept the retired terms out; this gate
 * prevents them from drifting back in.
 *
 * Sister of #534 (bcs-vocab-check): same canonical-name-drift class of bug on a
 * different vocabulary. #534 validates BCS values against locked enums; this gate
 * bans retired cascade terms. See brik-bds#748.
 *
 * ── What's retired vs canonical ───────────────────────────────────────────
 *
 *   Retired (banned)                    Canonical replacement
 *   ─────────────────────────────────   ──────────────────────────────────────
 *   "Tier 1/2/3/4" (CSS-cascade sense)  named CSS @layer: bds-tokens ·
 *                                        bds-components · client-theme ·
 *                                        client-overrides
 *   "Layer 1/2/3/4"                     named CSS @layer (layers are never
 *                                        numbered)
 *   "four layers"                       four Theming Dimensions (Tokens ·
 *                                        Atmospheres · Layout Archetypes ·
 *                                        Blueprints); the cascade has four
 *                                        *named* @layers
 *   "Tier/Layer N brand overrides"      "@layer client-theme overrides"
 *
 * The word "Tier" is still canonical for the four-tier abstraction stack
 * (Raw · Primitive · Semantic · Component) and "Layer" is canonical for the CSS
 * @layer. Those legitimate usages live in a handful of canonical docs and are
 * exempted via an inline allow-anchor (see below) — not by banning the words.
 *
 * ── Detection ────────────────────────────────────────────────────────────
 *
 *   - Scans prose lines only. Fenced code blocks (``` … ```) are skipped —
 *     ASCII diagrams and code examples are not prose vocabulary.
 *   - Each banned pattern is matched with word boundaries, so hyphenated forms
 *     ("Tier-1 leakage") and named forms ("Semantic tier") never match.
 *
 * ── Allow-anchors (for genuinely canonical usage) ──────────────────────────
 *
 *   Single line:  add `cascade-vocab-ok` in an MDX/HTML comment on the line:
 *       A Tier 4 token is component-scoped. {/* cascade-vocab-ok: anatomy stack *​/}
 *
 *   Region:       wrap a block whose numbered-Tier/Layer usage is a *different*
 *                 domain (e.g. the CLAUDE.md documentation-tier model):
 *       {/* cascade-vocab-ok:start — doc-tier model, not token cascade *​/}
 *       | Tier 1 — BDS CLAUDE.md | … |
 *       {/* cascade-vocab-ok:end *​/}
 *
 * ── Exit codes ───────────────────────────────────────────────────────────
 *   0  Clean — no retired token-cascade vocabulary in prose
 *   1  Violations found
 *   2  Bad invocation (missing/unreadable MDX directory)
 *
 * ── CLI ──────────────────────────────────────────────────────────────────
 *   token-cascade-vocab-check [mdx-dir]   Scan MDX dir (default: docs-site/content/docs)
 *   token-cascade-vocab-check --help      Show this message
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BDS_ROOT = resolve(__dirname, '..');

// ── Retired-term rules ─────────────────────────────────────────────────────
//
// Each rule: a word-boundary regex + the canonical replacement guidance printed
// on failure. Order matters only for which message a line reports first.

const RULES = [
  {
    re: /\b(?:Tier|Layer) [1-4] brand overrides\b/gi,
    fix: '"Tier/Layer N brand overrides" → "`@layer client-theme` overrides"',
  },
  {
    re: /\bTier [1-4]\b/g,
    fix: 'retired CSS-cascade tier term → a named CSS `@layer` (`bds-tokens` · `bds-components` · `client-theme` · `client-overrides`). If you mean the abstraction stack, name the tier (Raw · Primitive · Semantic · Component). See primitives/token-anatomy.mdx.',
  },
  {
    re: /\bLayer [1-4]\b/g,
    fix: 'canonical CSS layers are named, never numbered → `bds-tokens` · `bds-components` · `client-theme` · `client-overrides`. See getting-started/cascade.mdx.',
  },
  {
    re: /\bfour layers\b/gi,
    fix: 'retired → the four Theming Dimensions are Tokens · Atmospheres · Layout Archetypes · Blueprints; the cascade has four *named* `@layer`s. See getting-started/cascade.mdx.',
  },
];

// ── Allow-anchor markers ─────────────────────────────────────────────────────

const ANCHOR = 'cascade-vocab-ok';
const REGION_START = `${ANCHOR}:start`;
const REGION_END = `${ANCHOR}:end`;

// ── MDX file walking ─────────────────────────────────────────────────────────

function walkMdx(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkMdx(full, acc);
    } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
      acc.push(full);
    }
  }
  return acc;
}

// ── File scan ──────────────────────────────────────────────────────────────

/**
 * Scan a single MDX file and return an array of violation objects:
 *   { file, line, term, fix }
 * Skips fenced code blocks, region-anchored blocks, and single-line-anchored lines.
 */
function scanFile(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const lines = src.split('\n');
  const violations = [];

  let inFence = false;
  let inAllowRegion = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block toggle (``` or ~~~, optionally with a language).
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Region allow-anchor toggles.
    if (line.includes(REGION_START)) { inAllowRegion = true; continue; }
    if (line.includes(REGION_END)) { inAllowRegion = false; continue; }
    if (inAllowRegion) continue;

    // Single-line allow-anchor (but not the region markers, handled above).
    if (line.includes(ANCHOR)) continue;

    // Rules are ordered specific → generic; report the first (most-specific)
    // match per line so "Tier 2 brand overrides" reports once, not twice.
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(line);
      if (m) {
        violations.push({ file: filePath, line: lineNo, term: m[0], fix: rule.fix });
        break;
      }
    }
  }

  return violations;
}

// ── Reporter ─────────────────────────────────────────────────────────────────

function renderViolations(allViolations, scannedCount, cwd) {
  if (allViolations.length === 0) {
    return `token-cascade-vocab-check: clean — ${scannedCount} MDX file(s) scanned, 0 retired token-cascade terms\n`;
  }

  const out = [
    `token-cascade-vocab-check: ${allViolations.length} retired token-cascade term(s) — parallel-taxonomy drift`,
    `  Canonical vocabulary: docs-site/content/docs/primitives/token-anatomy.mdx (locked in PR #736)`,
    `  Scanned ${scannedCount} MDX files`,
    ``,
  ];

  for (const v of allViolations) {
    const rel = relative(cwd, v.file).split(sep).join('/');
    out.push(`  ${rel}:${v.line}  "${v.term}"`);
    out.push(`      ↳ ${v.fix}`);
  }

  out.push('');
  out.push('  If this usage is genuinely canonical (the abstraction Tier stack, or a');
  out.push(`  different-domain tier model), add an inline \`${ANCHOR}\` allow-anchor —`);
  out.push('  see the header of scripts/token-cascade-vocab-check.mjs. Do not rename the vocab per-doc.');
  return out.join('\n') + '\n';
}

// ── Main ─────────────────────────────────────────────────────────────────────

const USAGE = `token-cascade-vocab-check — retired token-cascade vocabulary gate for docs-site MDX

Usage:
  token-cascade-vocab-check [mdx-dir]    Scan MDX directory (default: docs-site/content/docs)
  token-cascade-vocab-check --help       Show this message

Exit codes:
  0  Clean — no retired token-cascade vocabulary in prose
  1  Violations found
  2  Bad invocation

Canonical vocabulary: docs-site/content/docs/primitives/token-anatomy.mdx (PR #736)
Issue: brik-bds#748
`;

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  const mdxDir = args[0] ?? resolve(BDS_ROOT, 'docs-site', 'content', 'docs');

  if (!existsSync(mdxDir)) {
    process.stderr.write(`token-cascade-vocab-check: MDX directory not found: ${mdxDir}\n`);
    process.exit(2);
  }

  const files = walkMdx(mdxDir);
  if (files.length === 0) {
    process.stderr.write(`token-cascade-vocab-check: no MDX files found in ${mdxDir}\n`);
    process.exit(2);
  }

  const allViolations = [];
  for (const file of files) {
    allViolations.push(...scanFile(file));
  }

  process.stdout.write(renderViolations(allViolations, files.length, process.cwd()));
  process.exit(allViolations.length > 0 ? 1 : 0);
}

main();
