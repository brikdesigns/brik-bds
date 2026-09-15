/**
 * check-unknown-blueprint-keys.mjs — ADR-039 §Enforcement guardrail 3 (#2496).
 *
 * `BlueprintDispatcher` routes a `blueprintKey` that is not in
 * `BLUEPRINT_REGISTRY` to `<BlueprintFallback>`, which stamps a
 * `data-blueprint-unknown-key` attribute on its wrapper (a section the model
 * asked for but no blueprint renders). ADR-039 turns that marker from a warning
 * into a build failure: a missing blueprint must BLOCK a deploy, not silently
 * degrade it.
 *
 * This is the greppable half of the gate. It scans a directory of rendered HTML
 * and exits non-zero the moment one file carries the marker. Two callers:
 *
 *   1. brik-bds's own Astro verify path (`verify:astro-stories`) folds
 *      `containsUnknownKey()` in-process over the dispatcher rendered across
 *      every canonical section fixture — so a fixture key drifting out of the
 *      registry, or a registry entry removed, turns the gate red here.
 *   2. Each client site's CI points `--root` at its built `dist/`, so a page
 *      whose stored content references an unshipped key cannot publish. That is
 *      the marker's original home (BlueprintFallback.astro's hint says so).
 *
 *   node scripts/check-unknown-blueprint-keys.mjs --root <dir>
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The attribute BlueprintFallback stamps on an unrendered section. */
export const UNKNOWN_KEY_ATTR = 'data-blueprint-unknown-key';

/** True when a rendered HTML string carries an unknown-key fallback. */
export function containsUnknownKey(html) {
  return html.includes(UNKNOWN_KEY_ATTR);
}

/**
 * Every `.html` file under `root` (recursive) whose contents carry the marker.
 * A missing `root` returns `[]` — the absence of rendered output is not itself
 * a violation; the render/verify step that produces it owns that failure.
 */
export function findUnknownKeyFiles(root) {
  if (!existsSync(root) || !statSync(root).isDirectory()) return [];
  return readdirSync(root, { recursive: true })
    .map((name) => join(root, name.toString()))
    .filter((path) => path.endsWith('.html') && statSync(path).isFile())
    .filter((path) => containsUnknownKey(readFileSync(path, 'utf8')));
}

// ── CLI ──────────────────────────────────────────────────────────────────────
// Guarded so importing the helpers above never triggers the process exit.
if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  const rootFlag = process.argv.indexOf('--root');
  const root = rootFlag !== -1 ? process.argv[rootFlag + 1] : null;
  if (!root) {
    console.error('✗ usage: check-unknown-blueprint-keys.mjs --root <dir>');
    process.exit(2);
  }

  const offenders = findUnknownKeyFiles(root);
  if (offenders.length > 0) {
    console.error(`\x1b[0;31m✗ Unknown blueprint key(s) rendered — ${UNKNOWN_KEY_ATTR} found in:\x1b[0m`);
    for (const file of offenders) console.error(`    ${file}`);
    console.error(
      '\n  A section references a blueprintKey no blueprint renders, so it fell back.\n' +
        '  Ship the blueprint (BLUEPRINT_REGISTRY + WIRED_BLUEPRINT_KEYS) or remove the key.',
    );
    process.exit(1);
  }

  console.log(`\x1b[0;32m✓ No unknown blueprint keys in ${root}\x1b[0m`);
}
