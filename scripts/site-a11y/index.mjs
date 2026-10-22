/**
 * @brikdesigns/bds/site-a11y — the shared site a11y gate (brik-llm#5076).
 *
 * Needs `@playwright/test` and `@axe-core/playwright` in the consuming site
 * (optional peer dependencies). The pure halves — `baseline-match.mjs` and
 * `grade.mjs` — import neither.
 */
export * from './baseline-match.mjs';
export * from './grade.mjs';
export * from './goto-rendered.mjs';
export * from './audit.mjs';
