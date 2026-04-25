# Storybook MCP audit — follow-ups

Picking up from a cold session? Read this first. The big-picture work is done.
This doc lists the items that were intentionally deferred so future agents (or
this one, weeks later) can resume without context.

## What's already landed

Six merged BDS PRs (#261, #262, #263, #264, #265, #266) plus four consumer-repo
CLAUDE.md updates. Net effect:

- `experimentalComponentsManifest: true` enabled in [.storybook/main.ts](../.storybook/main.ts).
- Stable Chromatic permalink — `https://main--69b8918cac3056b39424d5d3.chromatic.com/` —
  serves `/mcp`, `/index.json`, `/manifests/components.json`. Per-build URLs
  (`<appid>-<random>.chromatic.com`) freeze on the build that produced them and
  must not be committed; see the warning in [`CLAUDE.md`](../CLAUDE.md) →
  "Chromatic (visual testing + hosted MCP)".
- Surface taxonomy on every story (`surface-web` / `surface-product` /
  `surface-shared`). Defined in [`STORYBOOK-WRITING-GUIDE.md`](./STORYBOOK-WRITING-GUIDE.md)
  → "Surface taxonomy".
- Consumer-repo CLAUDE.md files (brik-client-portal, renew-pms,
  freedom-client-portal, brikdesigns) point at the stable Chromatic MCP and
  carry the surface-filter rule appropriate to the consumer.
- 100% prop-level JSDoc on every component with a Props interface, 96%
  `@summary` on component main exports (3 misses are the Track D
  non-conforming components — see below), 100% `@summary` on story exports.
- Regression guard at [`scripts/lint-jsdoc.js`](../scripts/lint-jsdoc.js),
  wired into pre-commit + `npm run validate`. Enforces all four metadata rules.

## Outstanding work (priority order)

### 1. End-to-end MCP validation (medium ROI, ~30–60 min)

**Status:** Not started. The plumbing is in place; nobody has yet confirmed it
delivers value in a live consumer session.

**Goal:** Demonstrate that a Claude Code session in a consumer repo (most useful
target: `brik-client-portal`) actually queries the BDS Storybook MCP, applies
the surface filter, and uses an authored `@summary` instead of falling back to
source-file reads.

**How to run:**

1. Open a fresh Claude Code session in `~/Documents/GitHub/product/brik-client-portal`
   on `staging`. The autostart hook should launch BDS Storybook on `:6006`
   on first `.tsx` edit.
2. Prompt: *"Build a small Settings card UI showing 'Notifications' and
   'Privacy' as a list — use BDS components."* (Or any prompt where multiple
   BDS components could fit.)
3. Watch the tool calls. Expected:
   - The agent calls `mcp__storybook-mcp__list-all-documentation` (or the
     Chromatic-hosted equivalent at `https://main--<appid>.chromatic.com/mcp`).
   - The agent's reasoning references surface filtering — it should pick from
     `surface-product` + `surface-shared` and avoid `surface-web` components
     (Footer, NavBar, PricingCard, etc.).
   - The agent calls `get-documentation` for at least one BDS component and
     uses an authored `@summary` rather than narrating "reading the source."
4. If the surface filter isn't being applied: check that the consumer's
   CLAUDE.md still contains the section; if it does and the agent ignores it,
   the rule may need to be tightened from "filter to" to "ALWAYS filter to."
5. If localhost MCP is reached but Chromatic isn't, document the gap. Both
   paths are supposed to work.

**Success looks like:** A short report (in chat or appended to this doc) noting
which BDS components the agent picked, that surface filtering happened,
whether `@summary` was used, and any gap that surfaced.

**Why this matters:** All of the above documentation work is wasted if the
consumer agent doesn't actually use it. This is the integration test.

---

### 2. Story exemplar audit — closed 2026-04-25 (no action needed)

**Status:** Audit complete. **Zero hard failures.** The hypothesized "components
have only synthetic axis stories" failure mode does not exist in the codebase.
The `Patterns` story slot is consistently used as the realistic-context
exemplar (Banner, Accordion, Tooltip, Field, FieldGrid, Counter, Breadcrumb,
ButtonGroup, Skeleton, Spinner, Checkbox, Chip, Popover, BulletList, NavBar,
PasswordInput, FilterButton, etc. — every Patterns story sampled rendered the
component inside named UX scenarios with believable data, not axis sweeps).

**Audit results (82 components, 363 stories):**

| Bucket | Count |
| --- | --- |
| Components with zero scenario stories | **0** |
| Components with mixed synthetic + scenario | 56 |
| Components with all scenario stories | 23 |
| Components with no story file | 2 |
| Stories classified as scenario | 269 / 363 (74%) |

**Two acknowledged exemptions** (no story file, intentional):

- `AnimatedIcon` — coverage lives under `Icon` stories.
- `DevFeedbackWidget` — internal dev tooling.

**The doc's original synthetic-name regex was stale** — it included `Patterns`,
which made the naive audit flag 24 components. After spot-checking those
(Accordion FAQ section, Tooltip icon-button toolbar, Breadcrumb page-header
context, ButtonGroup dialog actions, Counter notification counts, etc.), the
team's convention is clear: `Patterns` IS the realistic-context slot.
Removing it from the regex collapses the failure list to zero.

**Methodology refinements** baked into the audit script:

1. **Structural helpers excluded** from "composes other components" count —
   `Stack`, `Row`, `Grid`, `Box`, `Flex`, `SectionLabel`, `Spacer`, `Container`,
   `Icon`, `AnimatedIcon`, `Fragment`, `Suspense`. A Variants grid using
   `<Stack>` + `<SectionLabel>` is still synthetic, not scenario.
2. **`Patterns` removed from synthetic name regex** — the codebase convention
   has overridden the doc's original list.
3. **Realistic copy density signal** — count distinct multi-word strings >20
   chars with lowercase content; ≥3 promotes a synthetic-named story to
   scenario. Catches the few cases where a story uses a synthetic name
   (e.g. `States`, `Variants`) but renders realistic UX content.

**Script location:** `/tmp/story-exemplar-audit.mjs` (one-off, not committed —
matches the precedent set by `/tmp/jsdoc-audit.mjs` for Tracks A–C). Re-run
with: `node /tmp/story-exemplar-audit.mjs $(pwd)`.

**Why no CI guard:** the heuristic is too soft to gate PRs. The realistic-copy
density rule has tunable thresholds and would false-positive on legitimate
primitive-component stories where short labels are accurate. The convention
(every component has a `Patterns` story) is socially enforced via story-file
templates, not lint rules.

---

### 3. Track D — non-conforming components — closed 2026-04-25

**Status:** Done. The three components are now handled explicitly by
[`scripts/lint-jsdoc.js`](../scripts/lint-jsdoc.js) instead of being
silently skipped via the missing-file path:

- `Calendar` — `EXEMPT_COMPONENTS` entry. `index.ts` documents it as
  "placeholder, component not yet implemented" — no React export to summarize.
- `Icons` — `EXEMPT_COMPONENTS` entry. `index.ts` documents it as
  "reference page only, no exported component" — Storybook docs only.
- `SheetTypography` — `MULTI_EXPORT` entry listing the four sub-components
  (`SheetSectionTitle`, `SheetFieldLabel`, `SheetFieldValue`, `SheetHelperText`).
  The linter scans each sub-component file individually for rules 1 + 2,
  and an `@summary` line was added to each.

**Behavior change:** the linter no longer silently skips when `<Name>.tsx`
is missing — it errors with "expected component file not found (not in
EXEMPT_COMPONENTS or MULTI_EXPORT)". Adding a new non-conforming component
now requires an explicit decision about which set it belongs in.

---

## Appendix — useful commands

```bash
# Re-run the JSDoc coverage audit on the current tree
node /tmp/jsdoc-audit.mjs $(pwd)

# Run the regression linter
npm run lint-jsdoc

# Full validation suite (token lint + JSDoc lint + grid + theme + blueprints + typecheck + Storybook build)
npm run validate

# Probe the live Chromatic MCP endpoint
curl -s --max-time 8 -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  https://main--69b8918cac3056b39424d5d3.chromatic.com/mcp | head -c 500
```
