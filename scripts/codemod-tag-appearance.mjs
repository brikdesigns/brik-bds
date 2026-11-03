#!/usr/bin/env node
/**
 * codemod-tag-appearance.mjs — migrate `<Tag appearance>` to the one indicator
 * vocabulary shared with Badge and Avatar (brik-bds#2943).
 *
 *   appearance="subtle"  (transparent + border)  →  appearance="outline"
 *   appearance="muted"   (quiet neutral fill)    →  appearance="subtle"
 *
 * Both swaps happen in ONE pass over each opening tag, so a Tag that was
 * `muted` becomes `subtle` and is never visited again as an old `subtle`. A
 * two-step find/replace would turn every `muted` Tag into `outline`.
 *
 * Only `<Tag …>` elements are touched. `<Badge appearance="subtle">` keeps its
 * meaning (a pale fill) and so do `<TagGroup>`, `<ServiceTag>` and every other
 * component. Only attributes of the Tag itself are rewritten, never a nested
 * element inside an attribute value (`icon={<Badge appearance="subtle" />}`).
 *
 *   node scripts/codemod-tag-appearance.mjs --dry-run [paths...]   # report only
 *   node scripts/codemod-tag-appearance.mjs [paths...]             # rewrite in place
 *
 * Paths are files or directories, resolved from the current directory; with
 * none given the script walks `.`. It reads .tsx .jsx .mdx .md .astro and skips
 * node_modules, dist, .git, .next and storybook-static. Self-contained, so a
 * consumer can run it straight from the installed package:
 *
 *   node node_modules/@brikdesigns/bds/scripts/codemod-tag-appearance.mjs src
 *
 * Run it ONCE per codebase. It cannot tell an old `subtle` from a migrated one,
 * so a second run turns every migrated `muted` (now `subtle`) into `outline`.
 * Commit, or `--dry-run` first, and do not re-run on an already-migrated tree.
 *
 * A Tag whose `appearance` is not a plain string (`appearance={size > 1 ? … }`,
 * `appearance={variable}`) cannot be rewritten safely. It is left alone and
 * listed as `needs review` with its file:line.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT = /\.(tsx|jsx|mdx|md|astro)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.next', 'storybook-static', '.source']);

/** Old Tag appearance → new Tag appearance. Looked up once per attribute. */
const SWAP = { subtle: 'outline', muted: 'subtle' };

/** `appearance="x"`, `appearance='x'`, `appearance={"x"}`, `appearance={'x'}`. */
const LITERAL = /appearance=(?:"([^"]*)"|'([^']*)'|\{\s*(["'])([^"']*)\3\s*\})/y;
/** `appearance={ … }` whose body is anything but a lone string literal. */
const EXPRESSION = /appearance=\{/y;

/**
 * Index just past the `>` that closes the opening tag starting at `from`
 * (the position right after `<Tag`), or -1 if it never closes. Tracks string
 * quotes and `{}` depth so a `=>` or a `>` inside an attribute value does not
 * end the tag early.
 */
function openingTagEnd(source, from) {
  let depth = 0;
  let quote = null;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
    else if (ch === '>' && depth === 0) return i + 1;
  }
  return -1;
}

/** Start offsets of every `<Tag` element (not `<TagGroup`, `<Tag.Foo`, `<Tags`). */
function* tagOpenings(source) {
  const re = /<Tag(?=[\s/>])/g;
  let m;
  while ((m = re.exec(source))) yield m.index + m[0].length;
}

/**
 * Rewrite `source`. Returns the new text, how many attributes changed, and the
 * 1-based line of every Tag whose `appearance` is dynamic and was left alone.
 */
export function rewrite(source) {
  const edits = [];
  const review = [];

  for (const from of tagOpenings(source)) {
    const end = openingTagEnd(source, from);
    if (end === -1) continue;

    let depth = 0;
    let quote = null;
    for (let i = from; i < end; i += 1) {
      const ch = source[i];
      if (quote) {
        if (ch === '\\') i += 1;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch;
        continue;
      }
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      // Attributes of the Tag itself sit at brace depth 0, after whitespace.
      if (depth !== 0 || !/\s/.test(source[i - 1] ?? '') || source[i] !== 'a') continue;

      LITERAL.lastIndex = i;
      const hit = LITERAL.exec(source);
      if (hit) {
        const value = hit[1] ?? hit[2] ?? hit[4];
        if (Object.hasOwn(SWAP, value)) {
          const replacement = hit[0].replace(value, SWAP[value]);
          edits.push({ at: i, length: hit[0].length, replacement });
        }
        i += hit[0].length - 1;
        continue;
      }
      EXPRESSION.lastIndex = i;
      if (EXPRESSION.test(source)) review.push(source.slice(0, i).split('\n').length);
    }
  }

  let next = source;
  for (const { at, length, replacement } of edits.sort((a, b) => b.at - a.at)) {
    next = next.slice(0, at) + replacement + next.slice(at + length);
  }
  return { next, count: edits.length, review };
}

function* files(target) {
  const abs = path.resolve(process.cwd(), target);
  if (!fs.existsSync(abs)) return;
  if (fs.statSync(abs).isFile()) {
    yield abs;
    return;
  }
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    yield* files(path.join(abs, entry.name));
  }
}

function main(argv) {
  const dry = argv.includes('--dry-run');
  const targets = argv.filter((a) => !a.startsWith('--'));
  let changedFiles = 0;
  let total = 0;
  for (const target of targets.length ? targets : ['.']) {
    for (const file of files(target)) {
      if (!EXT.test(file)) continue;
      const { next, count, review } = rewrite(fs.readFileSync(file, 'utf8'));
      const rel = path.relative(process.cwd(), file);
      for (const line of review) console.log(`needs review: ${rel}:${line} — <Tag appearance={…}> is not a plain string`);
      if (!count) continue;
      changedFiles += 1;
      total += count;
      if (!dry) fs.writeFileSync(file, next);
    }
  }
  console.log(`${dry ? 'would rewrite' : 'rewrote'} ${total} Tag appearance value(s) in ${changedFiles} file(s)`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
