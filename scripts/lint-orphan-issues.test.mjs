/**
 * Self-test for the orphan-issue ratchet (brikdesigns#1528; ported by brik-bds#2792).
 *
 * The gate guards a silent failure — an unparented issue throws nothing, builds
 * nothing, and looks identical to a parented one on the board; it is simply
 * never picked up again. So the only thing that makes it worth having is that
 * it FIRES, on the two directions a ratchet has to cover (new debt; paid debt
 * the baseline still claims) and on the two exclusions that must not fire
 * (meta:project, and a reasoned opt-out).
 *
 * The rule functions take already-fetched nodes, so every case runs offline.
 * There is deliberately no live-repo case here: it would need a token inside
 * the vitest run. The real gate runs against the live repo as its own step of
 * the required `contracts` job (contracts-gate.yml), on every PR.
 */
import { describe, expect, it } from "vitest";
import {
  findOrphans,
  declaredCrossRepoParent,
  diffAgainstBaseline,
  hasReasonedOptOut,
  isProject,
  readBaseline,
  BASELINE_PATH,
} from "./lint-orphan-issues.mjs";

/** Minimal shape of one GraphQL issue node. */
const node = (
  number,
  { parent = null, labels = [], body = "", title = "t" } = {},
) => ({
  number,
  title,
  body,
  parent: parent === null ? null : { number: parent },
  labels: { nodes: labels.map((name) => ({ name })) },
});

const numbers = (xs) => xs.map((o) => o.number);

describe("findOrphans", () => {
  it("an unparented issue is an orphan", () => {
    expect(findOrphans([node(10)])).toEqual([{ number: 10, title: "t" }]);
  });

  it("a parented issue is not an orphan", () => {
    expect(findOrphans([node(10, { parent: 5 })])).toEqual([]);
  });

  it("an orphan WITHOUT meta:agent-discovered still counts — #1612 widened the scan", () => {
    // findOrphans keys on parent + the two exclusions, never a label, so any
    // labelled-but-unparented issue is caught.
    expect(
      findOrphans([
        node(10, { labels: ["area:components", "priority:p2-month"] }),
      ]),
    ).toEqual([{ number: 10, title: "t" }]);
  });

  it("meta:project is never an orphan — a Project is top-level by design", () => {
    expect(
      findOrphans([node(10, { labels: ["meta:project", "size:l"] })]),
    ).toEqual([]);
  });

  it("orphans come back sorted, so the failure output is stable", () => {
    expect(numbers(findOrphans([node(30), node(10), node(20)]))).toEqual([
      10, 20, 30,
    ]);
  });

  it("isProject reads the label list, not the issue shape", () => {
    expect(isProject(["area:tooling", "meta:project"])).toBe(true);
    expect(isProject(["area:tooling"])).toBe(false);
  });
});

// The gate's CI token is scoped to this repository, so GraphQL returns
// `parent: null` when the parent lives in a repo the token cannot read (brik-llm
// and brik-client-portal are private), and the issue then reads as unparented.
// That is a scope artefact, not debt — a declared `Parent: owner/repo#N` is the
// escape hatch.
describe("cross-repo parents", () => {
  it("a declared cross-repo parent is a home, not an orphan", () => {
    const body =
      "Some why.\n\n## References\n- Parent: `brikdesigns/brik-llm#3406`\n";
    expect(declaredCrossRepoParent(body)).toBe("brikdesigns/brik-llm#3406");
    expect(findOrphans([node(10, { body })])).toEqual([]);
  });

  it("the declaration is recognised unbackticked, bolded, and unbulleted", () => {
    for (const line of [
      "Parent: brikdesigns/brik-bds#2026",
      "- Parent: `brikdesigns/brik-bds#2026`",
      "**Parent**: brikdesigns/brik-bds#2026",
      "  * parent: `brikdesigns/brik-bds#2026`",
    ]) {
      expect(declaredCrossRepoParent(line), line).toBe(
        "brikdesigns/brik-bds#2026",
      );
    }
  });

  it("prose merely mentioning a parent issue does NOT exempt", () => {
    // If this matched, any issue quoting another ticket would exempt itself and
    // the gate would be decorative.
    for (const body of [
      "Split out of the parent brikdesigns/brik-llm#3406 because it lives here.",
      "See parent work in brikdesigns/brik-llm#3406.",
      "Parent: #3406", // same-repo — a real parent link is required, not a claim
      "Parent: brik-llm#3406", // no owner — ambiguous, so not accepted
    ]) {
      expect(declaredCrossRepoParent(body), body).toBeNull();
    }
    expect(findOrphans([node(10, { body: "Parent: #3406" })])).toEqual([
      { number: 10, title: "t" },
    ]);
  });

  it("an issue with a REAL parent is unaffected by the cross-repo path", () => {
    expect(
      findOrphans([node(10, { parent: 5, body: "Parent: `x/y#1`" })]),
    ).toEqual([]);
  });
});

describe("orphan-ok opt-out", () => {
  it("a reasoned marker exempts", () => {
    const body =
      "why\n<!-- orphan-ok: cross-repo, its umbrella lives in brik-bds -->\n";
    expect(findOrphans([node(10, { body })])).toEqual([]);
  });

  it("a reason containing > (an arrow) still exempts — #1612", () => {
    const body =
      "<!-- orphan-ok: service->back-office shim cleanup; no epic owns it -->";
    expect(hasReasonedOptOut(body)).toBe(true);
    expect(findOrphans([node(10, { body })])).toEqual([]);
  });

  it("a BARE marker does NOT exempt — the reason is the point", () => {
    expect(hasReasonedOptOut("<!-- orphan-ok: -->")).toBe(false);
    expect(findOrphans([node(10, { body: "<!-- orphan-ok: -->" })])).toEqual([
      { number: 10, title: "t" },
    ]);
  });
});

describe("the ratchet, both directions", () => {
  it("a NEW orphan fails — it is not in the baseline", () => {
    const { added, stale } = diffAgainstBaseline(
      [{ number: 99, title: "new" }],
      [],
    );
    expect(numbers(added)).toEqual([99]);
    expect(stale).toEqual([]);
  });

  it("a grandfathered orphan passes while it is still an orphan", () => {
    const { added, stale } = diffAgainstBaseline(
      [{ number: 42, title: "old" }],
      [42],
    );
    expect(added).toEqual([]);
    expect(stale).toEqual([]);
  });

  it("paying debt WITHOUT lowering the baseline fails — it would overstate the debt", () => {
    const { added, stale } = diffAgainstBaseline([], [42]);
    expect(added).toEqual([]);
    expect(stale).toEqual([42]);
  });

  it("a new orphan is not absorbed by a paid-down allowance", () => {
    // A count-based shape would net these to zero and pass.
    const { added, stale } = diffAgainstBaseline(
      [{ number: 99, title: "new" }],
      [42],
    );
    expect(numbers(added)).toEqual([99]);
    expect(stale).toEqual([42]);
  });

  it("the shipped baseline is a duplicate-free list of issue numbers", () => {
    // brik-bds ships a seeded baseline (the 2026-10-26 backfill's knowing
    // remainder, #2792), not an empty one — so what is asserted is its shape.
    const baseline = readBaseline(BASELINE_PATH);
    expect(baseline.every((n) => Number.isInteger(n) && n > 0)).toBe(true);
    expect(new Set(baseline).size).toBe(baseline.length);
  });
});
