/**
 * Neutralize GitHub closing-keywords in pasted changelog text.
 *
 * Single source of truth for the propagate.sh submodule track. Consumed by:
 *   - scripts/propagate.sh  (pipes the generated changelog through the CLI
 *     before embedding it in the consumer PR body)
 *   - scripts/__tests__/neutralize-closing-keywords.test.mjs
 *
 * Why: a submodule-bump PR pastes brik-bds commit subjects into the *consumer*
 * repo's PR body. Those subjects carry `closes #N` / `fixes #N` referencing
 * brik-bds issues, but on merge GitHub resolves the numbers against the
 * *consumer* tracker and silently closes the wrong issues (brik-llm #729 →
 * spuriously closed #607/#608/#533/#383/#384/#725). See brik-llm#1240.
 *
 * Fix: for any issue reference that directly follows a closing keyword, insert
 * a zero-width space (U+200B) after the `#` (or after `GH-`). The reference
 * renders identically to a human but is no longer a syntactically valid
 * `#<digits>` reference, so GitHub neither auto-closes nor cross-links it.
 * Idempotent — a second pass finds no bare `#<digit>` to break.
 *
 * Grammar reference: GitHub linked-issue keywords —
 * https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Zero-width space — invisible on render, breaks the reference token. */
const ZWSP = "​";

/**
 * Closing keywords (case-insensitive), every conjugation GitHub honors.
 * Word-boundary anchored so `prefixes` / `closed-form` never match.
 */
const KEYWORDS = "close[sd]?|fix(?:e[sd])?|resolve[sd]?";

/**
 * A reference GitHub would resolve against the tracker on merge:
 *   #123 · owner/repo#123 · GH-123
 */
const REF = "(?:[\\w.-]+/[\\w.-]+)?#\\d+|GH-\\d+";

/**
 * keyword · optional colon · optional whitespace · reference.
 * The separator is deliberately permissive (`:?\s*`) so `fixes: #1`,
 * `fixes #1`, and `fixes#1` are all neutralized — over-breaking a reference
 * is harmless; missing one closes an issue.
 */
const PATTERN = new RegExp(`\\b(${KEYWORDS})(:?\\s*)(${REF})`, "gi");

/** Break a single matched reference so it is no longer a valid GitHub ref. */
function breakRef(ref) {
  return ref.includes("#")
    ? ref.replace(/#(\d+)/, `#${ZWSP}$1`)
    : ref.replace(/^(GH-)(\d+)$/i, `$1${ZWSP}$2`);
}

/**
 * Return `text` with every closing-keyword-adjacent issue reference
 * neutralized. Non-keyword references (e.g. a bare `(#610)` PR link) and all
 * other prose are left untouched.
 */
export function neutralizeClosingKeywords(text) {
  return String(text).replace(
    PATTERN,
    (_m, kw, sep, ref) => `${kw}${sep}${breakRef(ref)}`,
  );
}

// ── CLI: stdin → stdout filter (how propagate.sh invokes it) ──
const invokedDirectly =
  process.argv[1] &&
  realpathSync(process.argv[1]) ===
    realpathSync(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  const chunks = [];
  process.stdin.on("data", (c) => chunks.push(c));
  process.stdin.on("end", () => {
    process.stdout.write(
      neutralizeClosingKeywords(Buffer.concat(chunks).toString("utf8")),
    );
  });
}
