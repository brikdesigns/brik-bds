#!/usr/bin/env node
/**
 * Compile Brik's Brand Kit as a client theme, into `.theme-brand-brik`
 * (brik-bds#2910).
 *
 * `:root` ships Foundations alone (merge-tokens-studio.js, no --slug). Brik is
 * compiled through the same path a client theme takes — compileClientTheme,
 * scripts/compile-client-theme.mjs — and scoped to the class consumers already
 * set on <body>.
 *
 * Writes:
 *   tokens/theme-brand-brik.generated.css
 *     .theme-brand-brik { … }                              light
 *     :root[data-theme="dark"] .theme-brand-brik { … }     dark
 *
 * Only Brik's delta over Foundations is emitted, compared on RESOLVED values.
 * A raw-string compare would miss a semantic whose text is identical in both
 * (`var(--bds-color-grayscale-500)`) but whose primitive Brik re-declares:
 * `var()` resolves where the property is declared, so on <body> that semantic
 * would inherit `:root`'s Foundations value. Resolving both sides catches it.
 *
 * tokens/gap-fills.css is overlaid on both sides before the compare, since its
 * `:root` declarations resolve against Foundations too (#2910).
 *
 * The dark block also re-declares every light-block semantic. Otherwise the
 * light value on <body> beats the dark value `:root[data-theme="dark"]` sets on
 * <html>, because the body's own declaration wins over inheritance.
 *
 * The hand-written tokens/theme-brand-brik.css still loads AFTER this layer:
 * its overrides (#1689, BDS-22, #2337) are deliberate and not yet in the Brand
 * Kit. Folding them into brand-kits/brik.json is a Brand Kit Figma write.
 *
 * Usage:
 *   node scripts/build-brand-brik-theme.mjs           # write
 *   node scripts/build-brand-brik-theme.mjs --check   # exit 1 if the committed file is stale
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileClientTheme } from './compile-client-theme.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KIT = join(ROOT, 'design-tokens', 'brand-kits', 'brik.json');
const OUT = join(ROOT, 'tokens', 'theme-brand-brik.generated.css');
const GAP_FILLS = join(ROOT, 'tokens', 'gap-fills.css');

const LIGHT_SELECTOR = '.theme-brand-brik';
const DARK_SELECTOR = ':root[data-theme="dark"] .theme-brand-brik';

// The groups figma-tokens-dark.css emits (sd.config.dark.mjs SEMANTIC_GROUPS).
const SEMANTIC = /^--bds-(background|text|border|surface|page|interaction)-/;

const check = process.argv.includes('--check');

/** Declarations of a compiled sheet, in source order. */
function declarations(css) {
  return new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

/** Every `var(--x)` replaced by x's value from the same sheet, recursively. */
function resolver(decls) {
  const memo = new Map();
  const resolve = (name, depth = 0) => {
    if (memo.has(name)) return memo.get(name);
    const raw = decls.get(name);
    if (raw === undefined || depth > 20) return `var(${name})`;
    const value = raw.replace(/var\(\s*(--[\w-]+)\s*\)/g, (_, ref) => resolve(ref, depth + 1));
    memo.set(name, value);
    return value;
  };
  return resolve;
}

function block(selector, decls) {
  const lines = [...decls].map(([name, value]) => `  ${name}: ${value};`);
  return `${selector} {\n${lines.join('\n')}\n}\n`;
}

/** Declarations of one top-level block of a hand-written sheet, comments stripped. */
function blockDeclarations(css, selector) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const start = text.indexOf(`\n${selector} {`);
  if (start === -1) throw new Error(`build-brand-brik-theme: no "${selector} {" block in gap-fills.css`);
  return declarations(text.slice(start, text.indexOf('\n}', start)));
}

const kit = JSON.parse(readFileSync(KIT, 'utf8'));

// gap-fills.css sits on `:root` with the Foundations primitives, so a gap-fill
// that references a brand token (`--bds-border-focus: var(--bds-border-brand-primary)`)
// resolves to the Foundations value on <body> too. Overlay it on both sides
// so the diff below re-declares every such name under the Brik class.
const gapFills = readFileSync(GAP_FILLS, 'utf8');
const gapLight = blockDeclarations(gapFills, ':root');
const gapDark = blockDeclarations(gapFills, ':root[data-theme="dark"]');
const withGaps = (decls, ...layers) => new Map([...decls, ...layers.flatMap((layer) => [...layer])]);

const brikLight = withGaps(declarations(await compileClientTheme(kit)), gapLight);
const baseLight = withGaps(declarations(await compileClientTheme({})), gapLight);
const brikDark = withGaps(declarations(await compileClientTheme(kit, { modes: { color: 'dark' } })), gapLight, gapDark);
const baseDark = withGaps(declarations(await compileClientTheme({}, { modes: { color: 'dark' } })), gapLight, gapDark);

const rBrikLight = resolver(brikLight);
const rBaseLight = resolver(baseLight);
const rBrikDark = resolver(brikDark);
const rBaseDark = resolver(baseDark);

const light = new Map();
for (const [name, value] of brikLight) {
  if (!baseLight.has(name) || rBrikLight(name) !== rBaseLight(name)) light.set(name, value);
}

const dark = new Map();
for (const [name, value] of brikDark) {
  if (!SEMANTIC.test(name)) continue;
  if (light.has(name) || !baseDark.has(name) || rBrikDark(name) !== rBaseDark(name)) dark.set(name, value);
}

const output =
  `/**\n` +
  ` * Brik Brand Kit compiled as a client theme — GENERATED, do not edit.\n` +
  ` * Source: design-tokens/brand-kits/brik.json via compileClientTheme.\n` +
  ` * Regenerate: node scripts/build-brand-brik-theme.mjs (brik-bds#2910).\n` +
  ` *\n` +
  ` * Brik's delta over the Foundations \`:root\` only. Deliberate hand overrides\n` +
  ` * load after this, from tokens/theme-brand-brik.css.\n` +
  ` */\n\n` +
  block(LIGHT_SELECTOR, light) +
  '\n' +
  block(DARK_SELECTOR, dark);

if (check) {
  const committed = existsSync(OUT) ? readFileSync(OUT, 'utf8') : null;
  if (committed !== output) {
    console.error(
      '✗ tokens/theme-brand-brik.generated.css does not match a fresh compile of brand-kits/brik.json.\n' +
        '  It is GENERATED. Run: node scripts/build-brand-brik-theme.mjs',
    );
    process.exit(1);
  }
  console.log('✓ tokens/theme-brand-brik.generated.css is in sync with brand-kits/brik.json.');
  process.exit(0);
}

writeFileSync(OUT, output, 'utf8');
console.log(`✓ tokens/theme-brand-brik.generated.css (light ${light.size}, dark ${dark.size})`);
