import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Feedback-payload schema-drift gate.
 *
 * The Storybook feedback widget writes to the shared Brik Backlog DB through two
 * standalone handlers — the dev-server middleware and the deployed Netlify
 * function. Both were left on the pre-OPE-29 property block (`Feedback Type` /
 * `Client` / `Status` / `Scope`) after the Backlog was restructured, so every
 * submission 400'd — "… is not a property that exists" — while the product
 * routes had already migrated to the @brikdesigns/feedback-contract shape
 * (brik-llm#802). The daily contract gates couldn't catch it: they validate the
 * live schema and write with the *contract* payload, never brik-bds's own.
 *
 * This gate is that missing coverage — a static assertion that both handlers
 * write only property names the live Backlog still has, and none of the four
 * removed selects. It fails the moment the stale block is reintroduced, without
 * needing a Notion token or network.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const HANDLERS = [
  ['.storybook/middleware.mjs', 'Storybook dev-server middleware'],
  ['netlify/functions/feedback.mjs', 'deployed Netlify function'],
];

// Property keys removed from the Backlog in the OPE-29 restructure. Any of these
// written by name 400s the whole create. Matched as they appear in a Notion
// properties object literal (`'Feedback Type': {` / `Client: {`).
const REMOVED_PROPERTIES = ['Feedback Type', 'Client', 'Status', 'Scope'];

// Canonical select properties the post-migration payload must write.
const REQUIRED_PROPERTIES = ['Type [legacy]', 'Triage Status'];

describe('feedback handlers — Backlog payload matches the live schema', () => {
  it.each(HANDLERS)('%s writes no removed Backlog properties', (relPath, label) => {
    const src = readFileSync(join(repoRoot, relPath), 'utf8');
    for (const prop of REMOVED_PROPERTIES) {
      // Match the property as a written key: `'Feedback Type': {` or `Status: {`.
      // The trailing `: {` avoids false positives (e.g. "Triage Status" contains
      // "Status" but never appears as a bare `Status: {` key).
      const asQuotedKey = new RegExp(`['"]${prop}['"]\\s*:\\s*\\{`);
      const asBareKey = new RegExp(`(?<![\\w[])${prop}\\s*:\\s*\\{`);
      expect(
        asQuotedKey.test(src) || asBareKey.test(src),
        `${label} still writes the removed "${prop}" property — the OPE-29 drift (brik-llm#802) is back.`,
      ).toBe(false);
    }
  });

  it.each(HANDLERS)('%s writes the canonical select properties', (relPath, label) => {
    const src = readFileSync(join(repoRoot, relPath), 'utf8');
    for (const prop of REQUIRED_PROPERTIES) {
      expect(
        src.includes(`'${prop}'`) || src.includes(`"${prop}"`),
        `${label} must write the canonical "${prop}" property.`,
      ).toBe(true);
    }
  });
});
