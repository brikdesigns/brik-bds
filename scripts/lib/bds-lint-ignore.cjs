'use strict';

/**
 * Shared `bds-lint-ignore` marker semantics for the BDS lint gates
 * (lint-tokens, token-coverage, slot-pattern-check, canonical-class-check).
 *
 * `bds-lint-ignore` is the escape hatch for the token / inline-var / slot /
 * canonical-class lints — it suppresses the check on its line. But a
 * suppression with no justification is a Class-5 ungated escape hatch: a real
 * gate whose bypass is itself ungated (brikdesigns/brik-bds#1469). So the
 * marker is valid ONLY when it carries a reason; a bare marker is a hard-fail.
 *
 *   Valid:  color: rgba(0,0,0,.5); // bds-lint-ignore — runtime overlay, not a token
 *           width: 24px;           /* bds-lint-ignore token-family *​/
 *   Bare:   height: 8px;           /* bds-lint-ignore *​/   ← rejected (no reason)
 *           fontSize: '13px',      // bds-lint-ignore      ← rejected (no reason)
 *
 * Authored as `.cjs` (not `.mjs`) so both the CommonJS gates (lint-tokens.js,
 * token-coverage.js) can `require()` it and the ESM gates
 * (slot-pattern-check.mjs, canonical-class-check.mjs) can `import` it — ESM can
 * import a CJS module, but CJS cannot synchronously require an ESM one.
 */

const LINT_IGNORE_MARKER = 'bds-lint-ignore';

/** True when the line carries a `bds-lint-ignore` marker (bare OR reasoned). */
function hasLintIgnore(line) {
  return line.includes(LINT_IGNORE_MARKER);
}

/**
 * The reason trailing a `bds-lint-ignore` marker.
 *   - `null`  → the marker is absent
 *   - `''`    → the marker is present but bare (no reason)
 *   - string  → the trimmed reason text
 * A leading separator (em-dash, colon, hyphen) is treated as punctuation, not
 * a reason; a bare rule keyword (e.g. `token-family`) counts as a reason.
 */
function lintIgnoreReason(line) {
  const idx = line.indexOf(LINT_IGNORE_MARKER);
  if (idx === -1) return null;
  let after = line.slice(idx + LINT_IGNORE_MARKER.length);
  // In a block comment the reason ends at the first `*/`; cut there so trailing
  // code (`/* bds-lint-ignore */ }`) is not mistaken for a reason. A line
  // comment has no `*/`, so the reason runs to end-of-line.
  const close = after.indexOf('*/');
  if (close !== -1) after = after.slice(0, close);
  after = after.trim();
  // A leading separator is punctuation between marker and reason, not a reason.
  after = after.replace(/^[—:-]+\s*/, '').trim();
  return after;
}

/** True when the line carries a `bds-lint-ignore` marker with no reason. */
function isBareLintIgnore(line) {
  const reason = lintIgnoreReason(line);
  return reason !== null && reason.length === 0;
}

const BARE_IGNORE_RULE = 'bare-lint-ignore';
const BARE_IGNORE_MESSAGE =
  'Bare `bds-lint-ignore` — a suppression must state why the line is exempt';
const BARE_IGNORE_FIX =
  'Append a reason: `bds-lint-ignore — <why this line is exempt>` (or a rule keyword). See brikdesigns/brik-bds#1469.';

module.exports = {
  LINT_IGNORE_MARKER,
  hasLintIgnore,
  lintIgnoreReason,
  isBareLintIgnore,
  BARE_IGNORE_RULE,
  BARE_IGNORE_MESSAGE,
  BARE_IGNORE_FIX,
};
