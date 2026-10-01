#!/usr/bin/env node
/**
 * verify-prefix-equivalence.mjs — the mechanical proof that the System ID
 * migration changed NAMES, never VALUES (ADR-043 "No token values change",
 * brik-bds#2670), ahead of the visual gate.
 *
 * It assembles dist/tokens.css from the token sources at a base git ref (the
 * commit before the migration) and compares it to the working tree:
 *
 *   1. Per selector block, after stripping `--bds-` from names and var() refs
 *      on both sides and mapping each retired word step to the numeric step it
 *      aliased, the canonical declarations are IDENTICAL (same names, same
 *      values).
 *   2. No retired word step survives in the canonical part.
 *   3. Every old name has a bridge alias, `--old: var(--bds-new)`, in EVERY
 *      selector block where it was declared before.
 *
 *   node scripts/verify-prefix-equivalence.mjs [--base <git-ref>]
 *
 * Reads dist/tokens.css (run `npm run build:dist-tokens` first). The default base
 * is the pre-migration commit; it is a migration gate, so advance or retire it
 * with the bridge (the bridge-completeness check in the vitest stays permanent).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleCanonical } from './lib/dist-assemble.mjs';
import {
  BRIDGE_BEGIN,
  PREFIX,
  REPO_ROOT,
  canonicalPart,
  declarationMap,
  isRetiredWordStepName,
  prefixName,
  readLegacy,
  unprefixName,
} from './lib/bds-prefix.mjs';

/** The commit immediately before the prefix migration landed. */
export const MIGRATION_BASE = 'd83ef148';

const stripValue = (value) => value.replace(/var\(\s*--bds-/g, 'var(--');

/**
 * Normalise the BASE (pre-migration) side: drop the retired word-step
 * declarations (they moved to the bridge) and point var() refs at their numeric
 * step. Returns context -> name -> value, plus the word-step names it dropped.
 */
export function normaliseBase(baseCss, legacy = readLegacy()) {
  const out = new Map();
  const wordDecls = []; // { context, name }
  for (const [context, names] of declarationMap(baseCss)) {
    const m = new Map();
    for (const [name, value] of names) {
      if (isRetiredWordStepName(name)) {
        wordDecls.push({ context, name });
        continue;
      }
      let v = value;
      for (const [word, numeric] of Object.entries(legacy.wordSteps)) v = v.split(`var(${word})`).join(`var(${numeric})`);
      m.set(unprefixName(name), stripValue(v));
    }
    out.set(context, m);
  }
  return { normalised: out, wordDecls };
}

/** Normalise the HEAD canonical side: strip `--bds-` everywhere. */
export function normaliseHead(headCanonicalCss) {
  const out = new Map();
  for (const [context, names] of declarationMap(headCanonicalCss)) {
    const m = new Map();
    for (const [name, value] of names) m.set(unprefixName(name), stripValue(value));
    out.set(context, m);
  }
  return out;
}

/**
 * @returns {string[]} human-readable failures; empty when equivalent
 */
export function compareDist({ baseCss, headDistCss, legacy = readLegacy() }) {
  const failures = [];
  const headCanonical = canonicalPart(headDistCss);
  const headBridge = headDistCss.slice(headCanonical.length);

  // 1. canonical declarations identical per selector block
  const { normalised: base, wordDecls } = normaliseBase(baseCss, legacy);
  const head = normaliseHead(headCanonical);
  for (const [context, baseNames] of base) {
    const headNames = head.get(context);
    if (!headNames) {
      failures.push(`selector block missing in head: ${context}`);
      continue;
    }
    for (const [name, value] of baseNames) {
      if (!headNames.has(name)) failures.push(`${context}: ${name} not declared in head`);
      else if (headNames.get(name) !== value) {
        failures.push(`${context}: ${name} value changed\n      base: ${value}\n      head: ${headNames.get(name)}`);
      }
    }
    for (const name of headNames.keys()) {
      if (!baseNames.has(name)) failures.push(`${context}: ${name} declared in head but not in base`);
    }
  }
  for (const context of head.keys()) {
    if (!base.has(context)) failures.push(`selector block only in head: ${context}`);
  }

  // 2. no retired word step in the canonical part
  for (const [, names] of declarationMap(headCanonical)) {
    for (const name of names.keys()) if (isRetiredWordStepName(name)) failures.push(`retired word step still canonical: ${name}`);
  }

  // 3. every old name aliased in every block where it was declared before
  const bridge = declarationMap(headBridge);
  const baseDeclared = declarationMap(baseCss);
  for (const [context, names] of baseDeclared) {
    for (const oldName of names.keys()) {
      if (oldName.startsWith(PREFIX)) continue; // Component-tier `--bds-*`: same name, no alias
      const target = prefixName(legacy.wordSteps[oldName] ?? oldName);
      const alias = bridge.get(context)?.get(oldName);
      if (alias === undefined) failures.push(`bridge: ${oldName} has no alias in ${context}`);
      else if (alias !== `var(${target})`) failures.push(`bridge: ${oldName} in ${context} is ${alias}, expected var(${target})`);
    }
  }
  return failures;
}

function gitReader(ref) {
  return (rel) => {
    try {
      return execFileSync('git', ['show', `${ref}:${rel}`], { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
    } catch (err) {
      // `git show` exits 128 for a path absent at the ref (expected: the file did not exist yet).
      if (err.status === 128) return null;
      throw err;
    }
  };
}

export function baseAvailable(ref) {
  try {
    execFileSync('git', ['cat-file', '-e', `${ref}^{commit}`], { cwd: REPO_ROOT, stdio: 'ignore' });
    return true;
  } catch (err) {
    // `git cat-file -e` exits 1 when the commit is not in this clone.
    if (err.status === 1 || err.status === 128) return false;
    throw err;
  }
}

export function compareAgainstRef(ref) {
  const distPath = path.join(REPO_ROOT, 'dist', 'tokens.css');
  if (!fs.existsSync(distPath)) throw new Error('dist/tokens.css missing — run `npm run build:dist-tokens` first');
  const headDistCss = fs.readFileSync(distPath, 'utf8');
  if (!headDistCss.includes(BRIDGE_BEGIN)) throw new Error('dist/tokens.css has no bridge section — rebuild with `npm run build:dist-tokens`');
  return compareDist({ baseCss: assembleCanonical(gitReader(ref)), headDistCss });
}

function main(argv) {
  const i = argv.indexOf('--base');
  const ref = i === -1 ? MIGRATION_BASE : argv[i + 1];
  if (!baseAvailable(ref)) {
    console.error(`✗ base ref ${ref} is not available (shallow clone?). Fetch full history.`);
    process.exit(2);
  }
  const failures = compareAgainstRef(ref);
  if (failures.length) {
    console.error(`✗ prefix equivalence vs ${ref}: ${failures.length} difference(s)`);
    for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
    if (failures.length > 40) console.error(`  … and ${failures.length - 40} more`);
    process.exit(1);
  }
  console.log(`✓ prefix equivalence vs ${ref}: canonical values identical per selector block; every old name bridged per block`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
