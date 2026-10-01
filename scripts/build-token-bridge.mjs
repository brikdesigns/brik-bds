#!/usr/bin/env node
/**
 * build-token-bridge.mjs — regenerate tokens/compat/prefix-bridge.css, the
 * generated old-name -> `--bds-` alias layer (ADR-043, brik-bds#2670).
 *
 *   node scripts/build-token-bridge.mjs          # write tokens/compat/prefix-bridge.css
 *   node scripts/build-token-bridge.mjs --check  # fail if the committed file is stale
 *
 * build-dist-tokens.js calls the same code and appends the result to
 * dist/tokens.css in a delimited trailing section.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleCanonical } from './lib/dist-assemble.mjs';
import { REPO_ROOT } from './lib/bds-prefix.mjs';
import { generateBridge } from './lib/token-bridge.mjs';

export const BRIDGE_PATH = path.join(REPO_ROOT, 'tokens', 'compat', 'prefix-bridge.css');

export function buildBridgeFromWorkingTree() {
  const read = (rel) => {
    const p = path.join(REPO_ROOT, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  };
  const canonical = assembleCanonical(read);
  return { canonical, ...generateBridge(canonical) };
}

function main(argv) {
  const { css, aliasCount, blockCount, missing } = buildBridgeFromWorkingTree();
  if (missing.length) {
    console.error(`✗ ${missing.length} legacy name(s) have no declared --bds- target:\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }
  if (argv.includes('--check')) {
    const committed = fs.existsSync(BRIDGE_PATH) ? fs.readFileSync(BRIDGE_PATH, 'utf8') : '';
    if (committed !== css) {
      console.error('✗ tokens/compat/prefix-bridge.css is stale. Run: npm run build:token-bridge');
      process.exit(1);
    }
    console.log(`✓ prefix-bridge.css up to date (${aliasCount} aliases, ${blockCount} selector blocks)`);
    return;
  }
  fs.writeFileSync(BRIDGE_PATH, css);
  console.log(`✓ tokens/compat/prefix-bridge.css (${aliasCount} aliases, ${blockCount} selector blocks)`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
