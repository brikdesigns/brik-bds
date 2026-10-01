#!/usr/bin/env node
/**
 * codemod-bds-prefix.mjs — rewrite every pre-ADR-043 token name to its `--bds-`
 * name (brik-bds#2670).
 *
 * The rename map is buildRenameMap() from scripts/lib/bds-prefix.mjs: the same
 * source the generated bridge aliases, so a name rewritten here always has a
 * bridge entry and vice versa. Only names in the map are touched — a custom
 * property that is not a BDS token (component-local `--_foo`, `--bds-button-*`
 * knobs) is left alone, as are fragments (`--text-`) that are not whole names.
 *
 *   node scripts/codemod-bds-prefix.mjs --dry [paths...]   # report only
 *   node scripts/codemod-bds-prefix.mjs [paths...]         # rewrite in place
 *
 * Default paths: components content-system stories tokens .storybook css blueprints.
 * Skipped always: generated SD output (regenerate via npm run build:all-tokens),
 * the bridge + legacy snapshot (they hold the OLD names by design), the grammar
 * file, and node_modules/dist.
 *
 * Consumers can reuse it: it rewrites any file tree against the same map.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUSTOM_PROP_RE, REPO_ROOT, buildRenameMap } from './lib/bds-prefix.mjs';

const DEFAULT_PATHS = ['components', 'content-system', 'stories', 'tokens', '.storybook', 'css', 'blueprints'];
const EXT = /\.(css|ts|tsx|js|mjs|cjs|json|mdx|md|html|astro)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'storybook-static', '.source']);
const SKIP_FILES = new Set([
  'tokens/figma-tokens.css',
  'tokens/figma-tokens-dark.css',
  'tokens/modes-borderradius.css',
  'tokens/modes-elevation.css',
  'tokens/modes-spacing.css',
  'tokens/modes-typography.css',
  'tokens/layout-fluid.css',
  'tokens/compat/prefix-bridge.css',
  'tokens/compat/legacy-token-names.json',
  'tokens/naming-grammar.json',
  // Frozen: keyed by the ORIGINAL word-step names so it proves the bridge preserves them.
  'tokens/color-alias-baseline.json',
  'tokens/compat/renamed-knobs.json',
]);

export function rewrite(source, map) {
  let count = 0;
  const next = source.replace(CUSTOM_PROP_RE, (name) => {
    const to = map.get(name);
    if (!to) return name;
    count += 1;
    return to;
  });
  return { next, count };
}

function* files(target) {
  const abs = path.resolve(REPO_ROOT, target);
  if (!fs.existsSync(abs)) return;
  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    yield abs;
    return;
  }
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    yield* files(path.join(abs, entry.name));
  }
}

function main(argv) {
  const dry = argv.includes('--dry');
  const targets = argv.filter((a) => !a.startsWith('--'));
  const map = buildRenameMap();
  let changedFiles = 0;
  let total = 0;
  for (const target of targets.length ? targets : DEFAULT_PATHS) {
    for (const file of files(target)) {
      const rel = path.relative(REPO_ROOT, file);
      if (!EXT.test(file) || SKIP_FILES.has(rel)) continue;
      const source = fs.readFileSync(file, 'utf8');
      const { next, count } = rewrite(source, map);
      if (!count) continue;
      changedFiles += 1;
      total += count;
      if (!dry) fs.writeFileSync(file, next);
    }
  }
  console.log(`${dry ? 'would rewrite' : 'rewrote'} ${total} token name(s) in ${changedFiles} file(s)`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
