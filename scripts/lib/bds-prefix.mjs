/**
 * bds-prefix.mjs — the one source for the System ID prefix migration
 * (ADR-043, brik-bds#2670).
 *
 * Every Primitive and Semantic name BDS declares leads with the registered ID
 * `bds`: `--text-primary` -> `--bds-text-primary`. This module is shared by:
 *
 *   - sd.config.*.mjs            Style Dictionary emission (prefix + word-step retirement)
 *   - generate-modes-css.mjs     hand-rolled generator output
 *   - build-token-bridge.mjs     the generated old-name -> new-name bridge
 *   - codemod-bds-prefix.mjs     the one-shot source rewrite
 *   - verify-prefix-equivalence  the "no token values change" proof
 *   - lint-tokens.js             "component CSS reads an un-prefixed name"
 *
 * so the rename map the codemod applied and the alias set the bridge emits can
 * never disagree: both come from `buildRenameMap()`.
 *
 * Reserved words, the registered ID and the numeric colour steps are read from
 * tokens/naming-grammar.json. Nothing about them is re-derived here.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '..', '..');

export const GRAMMAR_PATH = path.join(REPO_ROOT, 'tokens', 'naming-grammar.json');
export const RENAMED_KNOBS_PATH = path.join(REPO_ROOT, 'tokens', 'compat', 'renamed-knobs.json');
export const LEGACY_PATH = path.join(REPO_ROOT, 'tokens', 'compat', 'legacy-token-names.json');

export function readGrammar() {
  return JSON.parse(fs.readFileSync(GRAMMAR_PATH, 'utf8'));
}

/** The ID every BDS Primitive / Semantic / Component name leads with. */
export const ID = readGrammar().ids.componentId;
/** Custom-property prefix, e.g. `--bds-`. */
export const PREFIX = `--${ID}-`;
/** Style Dictionary `prefix` option value (no leading dashes). */
export const SD_PREFIX = ID;

/** `--text-primary` -> `--bds-text-primary`. Idempotent for already-prefixed names. */
export function prefixName(name) {
  return name.startsWith(PREFIX) ? name : `--${ID}-${name.slice(2)}`;
}

/** `--bds-text-primary` -> `--text-primary` (the pre-ADR-043 spelling). */
export function unprefixName(name) {
  return name.startsWith(PREFIX) ? `--${name.slice(PREFIX.length)}` : name;
}

/** Custom-property identifier, maximal match, not preceded by a name character. */
export const CUSTOM_PROP_RE = /(?<![\w-])--[a-zA-Z0-9][a-zA-Z0-9_-]*/g;

// ─── Word-step retirement (ADR-043 section 4) ─────────────────────────────

/**
 * Is this token path a retired colour word step (`color.poppy.dark`)?
 * Driven by the grammar's family list, numeric step list and retired word list.
 * `color.grayscale.black` / `color.system.*` are not word steps and stay.
 *
 * @param {string[]} tokenPath
 */
export function isRetiredWordStep(tokenPath, grammar = readGrammar()) {
  const color = grammar.tiers.primitive.color;
  if (tokenPath.length !== 3 || tokenPath[0] !== 'color') return false;
  const [, family, step] = tokenPath;
  if (!color.families.includes(family)) return false;
  if (color.steps.includes(step)) return false;
  return color.retiredWordSteps.includes(step);
}

/** Same test on a CSS name `--color-poppy-dark` (pre-prefix spelling). */
export function isRetiredWordStepName(name, grammar = readGrammar()) {
  const m = /^--color-([a-z]+)-([a-z]+)$/.exec(unprefixName(name));
  return m ? isRetiredWordStep(['color', m[1], m[2]], grammar) : false;
}

// ─── Legacy snapshot (the frozen pre-migration surface) ───────────────────

/**
 * tokens/compat/legacy-token-names.json — the names the previous minor shipped
 * in dist/tokens.css, plus the word-step -> numeric-step aliases they carried.
 * Frozen: the bridge covers exactly what consumers could already read. A token
 * added after the migration needs no alias.
 *
 * @returns {{ base: string, names: string[], wordSteps: Record<string,string> }}
 */
export function readLegacy() {
  return JSON.parse(fs.readFileSync(LEGACY_PATH, 'utf8'));
}

/**
 * Component knobs ADR-043 section 5 renames off a reserved stem. Old name -> new
 * name. They are read by components but not declared in dist/tokens.css, so they
 * are not in the legacy snapshot; the bridge still carries the old spelling.
 */
export const RENAMED_KNOBS = (() => {
  const { $comment, ...knobs } = JSON.parse(fs.readFileSync(RENAMED_KNOBS_PATH, 'utf8'));
  return knobs;
})();

/**
 * The one rename map: old name -> new name.
 *   - every legacy name that was not already `--bds-`  -> prefixed
 *   - every legacy word step                           -> the prefixed numeric step
 *   - every renamed component knob
 *
 * @returns {Map<string,string>}
 */
export function buildRenameMap(legacy = readLegacy()) {
  const map = new Map();
  for (const name of legacy.names) {
    if (name.startsWith(PREFIX)) continue; // already Component-tier `--bds-*`
    const numeric = legacy.wordSteps[name];
    map.set(name, prefixName(numeric ?? name));
  }
  for (const [oldName, newName] of Object.entries(RENAMED_KNOBS)) map.set(oldName, newName);
  return map;
}

// ─── Flat CSS rule parser ─────────────────────────────────────────────────

/** Strip block comments, preserving nothing (callers parse names/values only). */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Parse CSS into rule contexts and their custom-property declarations.
 * `context` is the selector, prefixed by any enclosing at-rules
 * (`@media (...) >> .foo`). Only rules that hold declarations are returned.
 *
 * @param {string} css
 * @returns {{ context: string, decls: { name: string, value: string }[] }[]}
 */
export function parseCustomProps(css) {
  const src = stripComments(css);
  const out = [];
  const stack = [];
  let buf = '';
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') {
      stack.push(buf.trim().replace(/\s+/g, ' '));
      buf = '';
    } else if (ch === '}') {
      flushDecls(buf, stack, out);
      stack.pop();
      buf = '';
    } else if (ch === ';') {
      flushDecls(`${buf};`, stack, out);
      buf = '';
    } else {
      buf += ch;
    }
  }
  return mergeContexts(out);
}

function flushDecls(chunk, stack, out) {
  const m = /^\s*(--[A-Za-z0-9_-]+)\s*:\s*([\s\S]*?);?\s*$/.exec(chunk);
  if (!m || !stack.length) return;
  out.push({ context: stack.join(' >> '), name: m[1], value: m[2].replace(/\s+/g, ' ').trim() });
}

function mergeContexts(flat) {
  const byContext = new Map();
  for (const { context, name, value } of flat) {
    if (!byContext.has(context)) byContext.set(context, []);
    byContext.get(context).push({ name, value });
  }
  return [...byContext].map(([context, decls]) => ({ context, decls }));
}

/**
 * Final cascade value per custom property, per context (a later declaration in
 * the same context wins — the gap-fills overrides rely on this).
 *
 * @returns {Map<string, Map<string,string>>} context -> name -> value
 */
export function declarationMap(css) {
  const result = new Map();
  for (const { context, decls } of parseCustomProps(css)) {
    if (!result.has(context)) result.set(context, new Map());
    const m = result.get(context);
    for (const { name, value } of decls) m.set(name, value);
  }
  return result;
}

// ─── dist/tokens.css section markers ──────────────────────────────────────

export const BRIDGE_BEGIN = '/* ===== BEGIN BDS PREFIX BRIDGE (generated from tokens/compat/prefix-bridge.css — do not edit) ===== */';
export const BRIDGE_END = '/* ===== END BDS PREFIX BRIDGE ===== */';

/** The canonical (pre-bridge) part of a built dist/tokens.css. */
export function canonicalPart(distCss) {
  const i = distCss.indexOf(BRIDGE_BEGIN);
  return i === -1 ? distCss : distCss.slice(0, i);
}
