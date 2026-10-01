/**
 * sd-bds.mjs — Style Dictionary hooks for the System ID prefix (ADR-043, #2670).
 *
 * The prefix is applied at CSS emission only (`prefix: 'bds'` on the css
 * platform, read by the `name/kebab` transform), so Figma variable names and
 * design-tokens/*.json stay untouched. JS and Swift platforms keep their names.
 *
 * Word-step retirement (ADR-043 section 4): the Figma source still carries the
 * 54 `--color-{family}-{lightest..darkest}` aliases. The `bds/retire-word-steps`
 * preprocessor re-points every `{color.family.word}` reference at the numeric
 * step that word token aliases, and `isCanonicalCssToken` drops the word tokens
 * from the CSS output. Both are driven by tokens/naming-grammar.json, so they
 * survive the next Figma pull.
 */

import { isRetiredWordStep, readGrammar, SD_PREFIX } from './bds-prefix.mjs';

const REF_RE = /\{(color\.[a-z]+\.[a-z0-9]+)\}/g;

function isTokenNode(node) {
  return node && typeof node === 'object' && ('$value' in node || 'value' in node);
}

/** Collect `color.family.word` -> its `{color.family.NNN}` target. */
function collectWordSteps(tree, grammar) {
  const targets = new Map();
  for (const [family, steps] of Object.entries(tree.color ?? {})) {
    if (!steps || typeof steps !== 'object') continue;
    for (const [step, node] of Object.entries(steps)) {
      if (!isTokenNode(node) || !isRetiredWordStep(['color', family, step], grammar)) continue;
      const value = node.$value ?? node.value;
      const m = typeof value === 'string' && /^\{(color\.[a-z]+\.[a-z0-9]+)\}$/.exec(value);
      if (!m) throw new Error(`bds/retire-word-steps: color.${family}.${step} is not a plain alias (${value})`);
      targets.set(`color.${family}.${step}`, m[1]);
    }
  }
  return targets;
}

function repoint(value, targets) {
  if (typeof value === 'string') {
    return value.replace(REF_RE, (whole, ref) => {
      let next = ref;
      // A word step may alias another word step; follow to the numeric end.
      for (let i = 0; i < 4 && targets.has(next); i += 1) next = targets.get(next);
      return `{${next}}`;
    });
  }
  if (Array.isArray(value)) return value.map((v) => repoint(v, targets));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, repoint(v, targets)]));
  }
  return value;
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return;
  if (isTokenNode(node)) {
    fn(node);
    return;
  }
  for (const child of Object.values(node)) walk(child, fn);
}

/** Register the preprocessor on a StyleDictionary class. */
export function registerBdsHooks(StyleDictionary) {
  const grammar = readGrammar();
  StyleDictionary.registerPreprocessor({
    name: 'bds/retire-word-steps',
    preprocessor: (dictionary) => {
      const targets = collectWordSteps(dictionary, grammar);
      walk(dictionary, (token) => {
        if ('$value' in token) token.$value = repoint(token.$value, targets);
        if ('value' in token) token.value = repoint(token.value, targets);
      });
      return dictionary;
    },
  });
}

/** CSS file filter: everything except the retired word steps. */
export function isCanonicalCssToken(token) {
  return !isRetiredWordStep(token.path);
}

export { SD_PREFIX };
