#!/usr/bin/env node
/**
 * check-widget-drift — verify a consumer's vendored copy of a BrikDevBar
 * vanilla widget matches the canonical source shipped in @brikdesigns/bds.
 *
 * The canonical widgets live in components/ui/BrikDevBar/widgets/ and are
 * published as package assets (see package.json `exports`). Consumers that
 * vendor a copy (served from public/, or a mockup pipeline like
 * brik-client-portal/scripts/mockup-shared/) run this in CI so the copy can't
 * silently drift from the design-system source — the failure mode that left
 * the portal pin widget ahead of BDS and shipped the C.ink bug (#1583).
 *
 * Usage (CLI):
 *   node check-widget-drift.mjs <widget-file> <consumer-copy-path>
 *   # exit 0 = in sync, 1 = drifted, 2 = usage / IO error
 *
 * Programmatic:
 *   import { checkWidgetDrift } from '@brikdesigns/bds/check-widget-drift';
 *   const { drifted } = checkWidgetDrift('feedback-widget.js', '/path/to/copy.js');
 */
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WIDGETS_DIR = new URL('../components/ui/BrikDevBar/widgets/', import.meta.url);

/**
 * Compare a consumer's vendored widget copy against the canonical package source.
 * @param {string} widgetFile  bare filename, e.g. "feedback-widget.js"
 * @param {string} consumerPath path to the consumer's vendored copy
 */
export function checkWidgetDrift(widgetFile, consumerPath) {
  const canonicalUrl = new URL(widgetFile, WIDGETS_DIR);
  const canonical = readFileSync(canonicalUrl, 'utf8');
  const consumer = readFileSync(consumerPath, 'utf8');
  return {
    drifted: canonical !== consumer,
    canonicalPath: fileURLToPath(canonicalUrl),
    consumerPath,
  };
}

function main(argv) {
  const [widgetFile, consumerPath] = argv;
  if (!widgetFile || !consumerPath) {
    console.error('Usage: check-widget-drift <widget-file> <consumer-copy-path>');
    return 2;
  }
  let result;
  try {
    result = checkWidgetDrift(widgetFile, consumerPath);
  } catch (err) {
    console.error(`check-widget-drift: ${err.message}`);
    return 2;
  }
  if (result.drifted) {
    console.error(
      `✗ ${consumerPath} has drifted from the canonical @brikdesigns/bds widget (${widgetFile}).\n` +
        `  Re-sync it from the installed package:\n` +
        `    cp "${result.canonicalPath}" "${consumerPath}"`,
    );
    return 1;
  }
  console.log(`✓ ${consumerPath} matches @brikdesigns/bds/${widgetFile}`);
  return 0;
}

// CLI entry when invoked directly (resolves symlinks so the npm bin path matches).
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  process.exit(main(process.argv.slice(2)));
}
