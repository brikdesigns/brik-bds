#!/usr/bin/env node
/**
 * lint-mdx-headings — enforces the docs-site heading hard rule, so a cluttered
 * heading can't drift back in after the Wave 2 sweep.
 *
 * ── Why ──────────────────────────────────────────────────────────────────────
 * The docs-site audit (#1358) found ~85 compound headings — em-dash qualifiers,
 * backtick code spans, trailing parentheticals, slashes, arrows — that read as
 * sentences instead of scannable labels. Wave 2 (#1360) de-cluttered them and
 * added the hard rule to `.claude/standards/fumadocs-content.md`. Without a gate
 * the clutter re-accretes one PR at a time. This is a Wave 4 drift gate (#1362).
 *
 * ── The hard rule (from fumadocs-content.md → "Heading and title copy") ────────
 * A heading (`##`…`######`) or a frontmatter `title` may not contain any of:
 *   • em dash  (—)
 *   • backtick (`)
 *   • parenthetical  ( ( or ) )
 *   • slash    (/)
 *   • arrow    (→ ← ↔ ⇒ ⇐ ⇔, or ASCII -> => <-)
 * The qualifier that used to trail an em dash moves to the section's first
 * sentence. The ≤35-char / sentence-case / label-not-sentence guidance in the
 * standard is deliberately NOT enforced here — it's guidance, not a hard fail.
 *
 * ── The one carve-out ──────────────────────────────────────────────────────────
 * A single trailing self-closing badge component is allowed and stripped before
 * the check — `## Parallax <TierBadge tier="gsap" />` passes. Its `/>` does not
 * trip the slash rule. A SECOND badge (or any non-trailing JSX) leaves a stray
 * `/` that the slash rule then flags — that enforces "one trailing badge".
 *
 * ── Escape hatch ────────────────────────────────────────────────────────────────
 * A deliberate exception carries `lint-mdx-headings-ignore` on the heading line,
 * or sits inside a `{/* lint-mdx-headings-ignore-start *\/}` …
 * `{/* lint-mdx-headings-ignore-end *\/}` block. Same convention as
 * lint-mdx-tokens.
 *
 * ── Scope ────────────────────────────────────────────────────────────────────────
 * `docs-site/content/docs/**\/*.mdx` only — the corpus the fumadocs-content
 * standard governs. Component MDX (`components/ui/**`) follows the Storybook
 * recipe, not this rule. Headings inside fenced code blocks are ignored (they're
 * example markdown, not real headings).
 *
 * ── Exit codes ─────────────────────────────────────────────────────────────────
 *   0  Clean — every heading + title is a scannable label
 *   1  Cluttered heading(s) found
 *   2  Bad invocation
 *
 * ── CLI ────────────────────────────────────────────────────────────────────────
 *   lint-mdx-headings [--json] [--files <f1> <f2> …]
 *
 * `--files`  scan only the listed .mdx (else the whole content/docs corpus).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DOCS_DIR = join(REPO_ROOT, 'docs-site', 'content', 'docs');

// The five banned constructs. Order = report order.
const BANNED = [
  { label: 'em dash', re: /—/ },
  { label: 'backtick', re: /`/ },
  { label: 'parenthetical', re: /[()]/ },
  { label: 'slash', re: /\// },
  { label: 'arrow', re: /→|←|↔|⇒|⇐|⇔|->|=>|<-/ },
];

// One trailing self-closing badge component (`<TierBadge tier="gsap" />`) is
// allowed — strip it before checking. Only a single trailing badge is removed,
// so a second one leaves a stray slash that the slash rule flags.
const TRAILING_BADGE = /\s*<[A-Z][A-Za-z0-9]*(?:\s[^<>]*?)?\/>\s*$/;

// The standard scopes the heading-copy hard rule to `##`/`###` ("Headings
// (`##`/`###`)…"). `#` is the page title (checked via frontmatter) and `####`+
// is a separate depth rule the restructure owns — neither is this gate's job.
const ATX_HEADING = /^(#{2,3})\s+(.*?)\s*#*\s*$/;

const LINE_IGNORE = 'lint-mdx-headings-ignore';
const BLOCK_START = /lint-mdx-headings-ignore-start/;
const BLOCK_END = /lint-mdx-headings-ignore-end/;

// ── Checks ────────────────────────────────────────────────────────────────────

// Return the list of banned-construct labels present in a heading/title text,
// after stripping the one allowed trailing badge component.
function violatedRules(text) {
  const stripped = text.replace(TRAILING_BADGE, '');
  return BANNED.filter((b) => b.re.test(stripped)).map((b) => b.label);
}

// ── Corpus walk ───────────────────────────────────────────────────────────────

function walk(dir, pred, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, pred, acc);
    else if (pred(full)) acc.push(full);
  }
  return acc;
}

function relPosix(abs) {
  return relative(REPO_ROOT, abs).split(sep).join('/');
}

// ── Scan ────────────────────────────────────────────────────────────────────

function scanFile(file) {
  const rel = relPosix(file);
  const lines = readFileSync(file, 'utf8').split('\n');
  const violations = [];
  let inFence = false;
  let inIgnoreBlock = false;

  // Frontmatter title — a `---` fenced block at the very top of the file.
  let fmEnd = -1;
  if (lines[0] === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') { fmEnd = i; break; }
    }
    for (let i = 1; i < fmEnd; i++) {
      const m = /^title:\s*(.+?)\s*$/.exec(lines[i]);
      if (!m) continue;
      // Strip surrounding quotes Fumadocs frontmatter may carry.
      const title = m[1].replace(/^["']|["']$/g, '');
      const bad = violatedRules(title);
      if (bad.length) {
        violations.push({ file: rel, line: i + 1, kind: 'title', text: title, rules: bad });
      }
    }
  }

  for (let i = fmEnd + 1; i < lines.length; i++) {
    const line = lines[i];

    if (BLOCK_START.test(line)) inIgnoreBlock = true;
    if (BLOCK_END.test(line)) { inIgnoreBlock = false; continue; }

    // Fence toggle (``` or ~~~). Headings inside a fence are example markdown.
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;

    const m = ATX_HEADING.exec(line);
    if (!m) continue;
    if (inIgnoreBlock) continue;
    if (line.includes(LINE_IGNORE)) continue;

    const bad = violatedRules(m[2]);
    if (bad.length) {
      violations.push({
        file: rel, line: i + 1, kind: `h${m[1].length}`, text: m[2].trim(), rules: bad,
      });
    }
  }
  return violations;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const filesIdx = args.indexOf('--files');
  const explicit = filesIdx !== -1
    ? args.slice(filesIdx + 1).filter((f) => !f.startsWith('--'))
    : null;

  const files = explicit
    ? explicit.map((f) => resolve(f)).filter((f) => f.endsWith('.mdx') && existsSync(f))
    : walk(DOCS_DIR, (f) => f.endsWith('.mdx'));

  const violations = [];
  for (const f of files) violations.push(...scanFile(f));

  if (jsonMode) {
    console.log(JSON.stringify({ files: files.length, violations }, null, 2));
    process.exit(violations.length > 0 ? 1 : 0);
  }

  if (violations.length === 0) {
    console.log(`lint-mdx-headings: clean — ${files.length} MDX file(s), 0 cluttered heading(s)\n`);
    process.exit(0);
  }

  console.log(`\nlint-mdx-headings: ${violations.length} cluttered heading(s) in docs MDX\n`);
  const byFile = {};
  for (const v of violations) (byFile[v.file] ||= []).push(v);
  for (const [f, vs] of Object.entries(byFile)) {
    console.log(`  ${f}`);
    for (const v of vs.sort((a, b) => a.line - b.line)) {
      console.log(`    ${v.line}: \x1b[31m${v.text}\x1b[0m  — ${v.kind}, banned: ${v.rules.join(', ')}`);
    }
  }
  console.log(
    '\n  A heading or title is a scannable label — no em dash, backtick,\n' +
    '  parenthetical, slash, or arrow. Move the trailing qualifier into the\n' +
    "  section's first sentence. One trailing <Badge /> component is allowed.\n" +
    '  Deliberate exception: add lint-mdx-headings-ignore on the line, or wrap\n' +
    '  in {/* lint-mdx-headings-ignore-start *\/} … {/* lint-mdx-headings-ignore-end *\/}.\n',
  );
  process.exit(1);
}

main();
