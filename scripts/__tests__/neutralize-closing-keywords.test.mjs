import { describe, it, expect } from "vitest";
import { neutralizeClosingKeywords } from "../lib/neutralize-closing-keywords.mjs";

/**
 * Regression guard for brik-llm#1240 / the #729 collision.
 *
 * propagate.sh pastes brik-bds commit subjects into the consumer PR body. Any
 * `closes #N` in those subjects references a brik-bds issue, but on merge
 * GitHub resolves the number against the *consumer* tracker and closes the
 * wrong issue. neutralizeClosingKeywords() must break every keyword-adjacent
 * reference while leaving innocent prose and bare PR-links untouched.
 */

const ZWSP = "​";
/** GitHub's own closing-keyword + reference grammar, for the "no longer
 *  matches" assertion. Kept independent of the implementation regex. */
const GH_AUTOCLOSE = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+#\d+/i;

describe("neutralizeClosingKeywords", () => {
  it("neutralizes the exact commit subjects that broke #729", () => {
    // From PR #729's pasted BDS changelog — these closed brik-llm #605/#607/#608.
    const line1 =
      "- feat(components): Banner ... (#587 Phase 2, closes #605, closes #608) (#610)";
    const line2 =
      "- docs(standards): @deprecated component retirement rule (closes #607) (#612)";

    const out1 = neutralizeClosingKeywords(line1);
    const out2 = neutralizeClosingKeywords(line2);

    // No residual auto-close pattern survives.
    expect(GH_AUTOCLOSE.test(out1)).toBe(false);
    expect(GH_AUTOCLOSE.test(out2)).toBe(false);
    // The break is a zero-width space right after the `#`.
    expect(out1).toContain(`closes #${ZWSP}605`);
    expect(out1).toContain(`closes #${ZWSP}608`);
    expect(out2).toContain(`closes #${ZWSP}607`);
  });

  it("renders identically once the zero-width space is stripped", () => {
    const input = "- fix(x): thing (closes #607) (#612)";
    expect(neutralizeClosingKeywords(input).replaceAll(ZWSP, "")).toBe(input);
  });

  it("covers every conjugation and casing", () => {
    for (const kw of [
      "close",
      "closes",
      "closed",
      "fix",
      "fixes",
      "fixed",
      "resolve",
      "resolves",
      "resolved",
      "Closes",
      "FIXES",
      "Resolved",
    ]) {
      const out = neutralizeClosingKeywords(`${kw} #42`);
      expect(GH_AUTOCLOSE.test(out), `${kw} not neutralized`).toBe(false);
    }
  });

  it("handles colon, no-space, owner/repo and GH- reference forms", () => {
    const cases = [
      "closes: #12",
      "fixes#34",
      "resolves brikdesigns/brik-bds#56",
      "Closes GH-78",
    ];
    for (const c of cases) {
      const out = neutralizeClosingKeywords(c);
      // A break was actually inserted (guards against a form the regex misses).
      expect(out, `not neutralized: ${c}`).toContain(ZWSP);
      // …and only a ZWSP — the reference digits survive verbatim.
      expect(out.replaceAll(ZWSP, "")).toBe(c);
    }
  });

  it("leaves bare PR-links and non-keyword references untouched", () => {
    // The trailing `(#610)` in a bump changelog is the BDS PR number, not a
    // close directive — #1240 scopes reference-noise as out of scope.
    const input = "- feat(x): thing (#610)";
    expect(neutralizeClosingKeywords(input)).toBe(input);
    expect(neutralizeClosingKeywords("See #99 for context.")).toBe(
      "See #99 for context.",
    );
  });

  it("does not match keywords embedded in larger words", () => {
    for (const s of [
      "prefixes #1",
      "foreclosed #2",
      "unresolved #3",
      "closed-form #4",
    ]) {
      expect(neutralizeClosingKeywords(s)).toBe(s);
    }
  });

  it("is idempotent", () => {
    const once = neutralizeClosingKeywords("closes #607");
    expect(neutralizeClosingKeywords(once)).toBe(once);
  });

  it("neutralizes multiple references across a multi-line changelog", () => {
    const changelog = [
      "### Features",
      "- feat: a (closes #1)",
      "### Fixes",
      "- fix: b (fixes #2) (#3)",
    ].join("\n");
    const out = neutralizeClosingKeywords(changelog);
    expect(GH_AUTOCLOSE.test(out)).toBe(false);
    // The standalone `(#3)` PR-link is preserved.
    expect(out).toContain("(#3)");
  });
});
