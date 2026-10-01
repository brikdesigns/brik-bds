#!/usr/bin/env node
/**
 * snapshot-legacy-token-names.mjs — freeze the pre-migration token surface.
 *
 * One-shot (brik-bds#2670). Assembles the canonical dist/tokens.css exactly as
 * the previous minor shipped it, reading the token sources from a git ref, and
 * writes tokens/compat/legacy-token-names.json: every declared custom-property
 * name, plus the word-step -> numeric-step aliases (ADR-043 section 4).
 *
 * The prefix bridge (build-token-bridge.mjs) aliases exactly this set. It is
 * frozen on purpose: the bridge covers names consumers could already read, so a
 * token added after the migration needs no alias.
 *
 *   node scripts/snapshot-legacy-token-names.mjs <git-ref>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { assembleCanonical } from './lib/dist-assemble.mjs';
import { LEGACY_PATH, REPO_ROOT, declarationMap, isRetiredWordStepName } from './lib/bds-prefix.mjs';

const ref = process.argv[2];
if (!ref) {
  console.error('usage: snapshot-legacy-token-names.mjs <git-ref>');
  process.exit(2);
}

const sha = execFileSync('git', ['rev-parse', '--short', ref], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
const read = (rel) => {
  try {
    return execFileSync('git', ['show', `${ref}:${rel}`], { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    // `git show` exits 128 for a path absent at the ref (expected: the file did not exist yet).
    if (err.status === 128) return null;
    throw err;
  }
};

const css = assembleCanonical(read);
const names = new Set();
const wordSteps = {};
for (const [, decls] of declarationMap(css)) {
  for (const [name, value] of decls) {
    names.add(name);
    if (isRetiredWordStepName(name)) {
      const m = /^var\((--color-[a-z]+-\d+)\)$/.exec(value);
      if (!m) throw new Error(`${name} is not a plain alias of a numeric step: ${value}`);
      wordSteps[name] = m[1];
    }
  }
}

const out = {
  $comment:
    'Frozen by scripts/snapshot-legacy-token-names.mjs: the custom-property names the previous minor declared in dist/tokens.css. build-token-bridge.mjs aliases exactly this set; a token added later needs no alias. Do not edit.',
  base: sha,
  names: [...names].sort(),
  wordSteps: Object.fromEntries(Object.entries(wordSteps).sort(([a], [b]) => a.localeCompare(b))),
};
fs.mkdirSync(new URL('../tokens/compat/', import.meta.url), { recursive: true });
fs.writeFileSync(LEGACY_PATH, `${JSON.stringify(out, null, 2)}\n`);
console.log(`legacy-token-names.json: ${out.names.length} names, ${Object.keys(out.wordSteps).length} word steps (base ${sha})`);
