import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Devbar-widget canonical-vs-mirror drift gate.
 *
 * `components/ui/BrikDevBar/widgets/*.js` is the single source of truth for the
 * vanilla devbar widgets (brik-bds#466). `scripts/sync-devbar-widgets.sh`
 * byte-copies each to its consumers — including the Storybook iframe copies in
 * `.storybook/public/`, which are committed to this repo.
 *
 * The failure this gate closes (brik-bds#985): a consumer mirror silently led
 * canonical. Portal authored the pin-completion feature (#1611) and the
 * structured-revision tags (#1381) directly in its `scripts/mockup-shared`
 * mirror; canonical never moved. Any run of the sync then overwrote the newer
 * mirror with the *older* canonical, regressing shipped client behaviour. The
 * fix back-ports the mirror into canonical; this gate keeps canonical the
 * most-advanced copy by failing the moment a committed in-repo mirror diverges.
 *
 * Cross-repo mirrors (portal `scripts/mockup-shared/`, brik-llm cache) live in
 * other repos and are gated in their own CI; this test covers the mirrors this
 * repo commits (the `.storybook/public/` iframe copies). Fix on failure: run
 * `bash scripts/sync-devbar-widgets.sh` and commit the result.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const CANONICAL_DIR = join(repoRoot, 'components/ui/BrikDevBar/widgets');
const STORYBOOK_DIR = join(repoRoot, '.storybook/public');

// canonical filename → committed Storybook mirror filename (sync-devbar-widgets.sh)
const MIRRORS = [
  ['devbar.js', 'brik-devbar.js'],
  ['inspect-widget.js', 'brik-inspect.js'],
  ['feedback-widget.js', 'brik-feedback-widget.js'],
  ['events-widget.js', 'brik-events-widget.js'],
];

describe('devbar widgets — Storybook mirror matches canonical', () => {
  it.each(MIRRORS)('%s is byte-identical to its Storybook copy (%s)', (canonical, mirror) => {
    const canonicalBytes = readFileSync(join(CANONICAL_DIR, canonical), 'utf8');
    const mirrorBytes = readFileSync(join(STORYBOOK_DIR, mirror), 'utf8');
    expect(mirrorBytes).toBe(canonicalBytes);
  });
});
