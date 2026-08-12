#!/usr/bin/env node
/**
 * gen-widget-tokens.mjs — keep the DevBar widgets' inlined color primitives in
 * sync with `tokens/figma-tokens.css`.
 *
 * The BrikDevBar widgets (inspect / feedback / events / shell) are standalone
 * zero-dependency IIFEs injected into mockup and product pages. They build their
 * chrome CSS from a `const T = {…}` block at module init — synchronously, before
 * the optional `/bds-manifest.json` fetch resolves — so the values cannot be read
 * from a token file at runtime. They are inlined, and each one carries the token
 * it mirrors as a trailing comment:
 *
 *     colorGrayscaleLight: '#828282', // --color-grayscale-500
 *
 * That hand-maintained table drifted. Five of the six grayscale entries were a
 * rung lighter than the token they named — the ladder was written against an
 * older 6-step ramp and never re-synced after #1737 minted the 11-step scale
 * (brik-bds#1750). Nothing caught it, because a comment is not a reference.
 *
 * This script makes the annotated entries generated output: it resolves each
 * commented token name against the committed token source and rewrites the
 * literal in place. `--check` is the CI gate.
 *
 * Scope — COLOR PRIMITIVES ONLY (`--color-*`). Deliberately not the semantic
 * tokens (`--text-*`, `--background-*`, `--border-*`, `--interaction-*`) or the
 * mode-scoped scales (`--font-size-*`, `--space-*`, `--border-radius-*`): those
 * are redeclared per theme and per mode across figma-tokens-dark.css,
 * theme-brand-brik.css and modes-*.css, so "the" value is a cascade question
 * with no single answer a generator can pick. Color primitives are declared once,
 * in `:root`, and are mode-invariant. Annotated entries naming anything else are
 * left alone (and reported by --check as unmanaged, not as drift).
 *
 * Modes:
 *   node scripts/gen-widget-tokens.mjs           # rewrite the inlined values
 *   node scripts/gen-widget-tokens.mjs --check   # fail if any entry has drifted
 */

import fs from 'node:fs';
import path from 'node:path';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const TOKEN_SOURCE = path.join(REPO_ROOT, 'tokens', 'figma-tokens.css');
const WIDGETS_DIR = path.join(REPO_ROOT, 'components', 'ui', 'BrikDevBar', 'widgets');

// Only these are safe to resolve to a single value — see the scope note above.
const MANAGED_PREFIX = '--color-';

/**
 * `key: '#hex', // --token-name` inside a widget's T block.
 * Captured in four parts so everything but the literal is preserved verbatim —
 * the T blocks are column-aligned by hand and a rewrite must not disturb that.
 */
const ENTRY_RE =
  /^(\s*[A-Za-z_$][\w$]*\s*:\s*)'(#[0-9a-fA-F]{3,8})'(\s*,\s*\/\/\s*)(--[a-z0-9-]+)/gm;

/** Parse token CSS into name → raw declared value. */
export function parseTokenCss(css) {
  const declared = new Map();
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) {
    declared.set(m[1], m[2].trim());
  }
  return declared;
}

/**
 * Resolve a token to its literal value, following `var(--other)` indirection.
 * The 6-step names (`--color-grayscale-light`) are DEPRECATED aliases onto the
 * numeric stops (#1739), so a widget annotated with either spelling resolves —
 * which is what lets the alias layer be deleted (#1740 AC 6) without this gate
 * going red on a name it can still resolve.
 */
export function resolveToken(declared, name, seen = new Set()) {
  if (seen.has(name)) {
    throw new Error(`Cyclic token alias while resolving ${name}.`);
  }
  seen.add(name);
  const raw = declared.get(name);
  if (raw === undefined) return null;
  const alias = raw.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/);
  return alias ? resolveToken(declared, alias[1], seen) : raw;
}

function widgetFiles() {
  return fs
    .readdirSync(WIDGETS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort()
    .map((f) => path.join(WIDGETS_DIR, f));
}

/**
 * Rewrite one widget's annotated color entries.
 * @returns {{ next: string, drifted: Array, unresolved: Array }}
 */
export function reconcile(source, declared) {
  const drifted = [];
  const unresolved = [];

  const next = source.replace(ENTRY_RE, (match, head, literal, mid, token) => {
    if (!token.startsWith(MANAGED_PREFIX)) return match; // unmanaged — see scope note
    const real = resolveToken(declared, token);
    if (real === null) {
      unresolved.push({ token, literal });
      return match;
    }
    if (real.toLowerCase() === literal.toLowerCase()) return match;
    drifted.push({ token, was: literal, now: real });
    return `${head}'${real}'${mid}${token}`;
  });

  return { next, drifted, unresolved };
}

function main(argv) {
  const check = argv.includes('--check');
  const declared = parseTokenCss(fs.readFileSync(TOKEN_SOURCE, 'utf8'));

  let driftCount = 0;
  let unresolvedCount = 0;
  let writtenCount = 0;
  let managedCount = 0;

  for (const file of widgetFiles()) {
    const rel = path.relative(REPO_ROOT, file);
    const source = fs.readFileSync(file, 'utf8');
    const { next, drifted, unresolved } = reconcile(source, declared);

    managedCount += [...source.matchAll(ENTRY_RE)].filter((m) =>
      m[4].startsWith(MANAGED_PREFIX),
    ).length;

    for (const u of unresolved) {
      unresolvedCount += 1;
      console.error(
        `✗ ${rel}: ${u.token} is not declared in tokens/figma-tokens.css ` +
          `(inlined as ${u.literal}). Fix the comment or the token.`,
      );
    }
    for (const d of drifted) {
      driftCount += 1;
      console.error(`${check ? '✗' : '→'} ${rel}: ${d.token} ${d.was} → ${d.now}`);
    }

    if (!check && next !== source) {
      fs.writeFileSync(file, next);
      writtenCount += 1;
    }
  }

  if (unresolvedCount > 0) return 1;

  if (check) {
    if (driftCount > 0) {
      console.error(
        `\ngen-widget-tokens --check: ${driftCount} inlined value(s) drifted from ` +
          'tokens/figma-tokens.css. Run `npm run gen:widget-tokens` and commit the result.',
      );
      return 1;
    }
    console.log(
      `gen-widget-tokens --check: ${managedCount} inlined color primitive(s) match the token source.`,
    );
  } else {
    console.log(
      `gen-widget-tokens: ${managedCount} inlined color primitive(s) checked, ` +
        `${driftCount} rewritten across ${writtenCount} file(s).`,
    );
  }
  return 0;
}

// CLI entry when invoked directly (resolves symlinks so the npm bin path matches).
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  process.exit(main(process.argv.slice(2)));
}
