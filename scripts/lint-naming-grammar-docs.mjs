#!/usr/bin/env node
/**
 * lint-naming-grammar-docs — token-anatomy.mdx must print the formula strings
 * tokens/naming-grammar.json declares, verbatim (brik-bds#2669 AC #5).
 *
 * The expected strings are DERIVED from the grammar's tiers, not restated, so
 * editing a tier body in the grammar without editing the page fails here.
 *
 * Exit 0 = every formula present, 1 = one is missing, 2 = the check broke.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The formula strings the docs page must contain. */
export function expectedFormulas(grammar) {
  return [
    grammar.shape,
    `--${grammar.tiers.semantic.formula}`,
    `--${grammar.tiers.primitive.color.body}`,
    `--${grammar.tiers.primitive.scale.body}`,
    `--${grammar.ids.componentId}-${grammar.tiers.component.body}`,
  ];
}

/** Formulas the grammar declares that the page does not contain. */
export function missingFormulas(grammar, mdx) {
  return expectedFormulas(grammar).filter((f) => !mdx.includes(f));
}

/**
 * `##` headings that appear more than once. A stale merge once pasted a whole
 * section block twice with two disagreeing tables (#2689); a repeated `##` is
 * the cheap, reliable tell. Fenced code blocks are skipped.
 */
export function repeatedHeadings(mdx) {
  const seen = new Map();
  let fenced = false;
  for (const line of mdx.split('\n')) {
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
  }
  return [...seen].filter(([, n]) => n > 1).map(([h]) => h);
}

function main() {
  const grammar = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'naming-grammar.json'), 'utf8'));
  const page = path.join(ROOT, grammar.docs.page);
  if (!fs.existsSync(page)) {
    console.error(`lint-naming-grammar-docs: ${grammar.docs.page} does not exist`);
    process.exit(2);
  }
  const missing = missingFormulas(grammar, fs.readFileSync(page, 'utf8'));
  if (missing.length > 0) {
    console.error(`lint-naming-grammar-docs: ${grammar.docs.page} differs from tokens/naming-grammar.json`);
    for (const f of missing) console.error(`  missing formula: ${f}`);
    process.exit(1);
  }
  const repeated = repeatedHeadings(fs.readFileSync(page, 'utf8'));
  if (repeated.length > 0) {
    console.error(`lint-naming-grammar-docs: ${grammar.docs.page} repeats a \`##\` heading`);
    for (const h of repeated) console.error(`  repeated heading: ## ${h}`);
    process.exit(1);
  }
  console.log(`lint-naming-grammar-docs: clean — ${expectedFormulas(grammar).length} formula(s) match`);
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '')) main();
