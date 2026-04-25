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

### 2. Story exemplar audit (medium ROI, ~half-day for full pass)

**Status:** Not started. Track A/B/C made every story discoverable; this
ensures the discoverable stories are good *examples*.

**Goal:** Identify components whose stories are all synthetic axis explorations
(`Playground`, `Variants`, `States`, `Sizes`, `Tones`) and lack at least one
"realistic context" story that shows how the component is actually used.
The MCP `get-documentation` tool returns story snippets verbatim — synthetic-
only stories teach the agent to write synthetic-only code.

**Audit-first approach:** write a script in `/tmp/story-exemplar-audit.mjs`
that, for each component:

1. Reads all stories in `<Name>.stories.tsx`.
2. Categorizes each as either:
   - **Synthetic** — name matches `/^(Playground|Variants|States|Sizes|Tones|Patterns|Density|Markers|Alignment|InteractionTest|Default|Empty|Disabled|Loading|Icons)$/`.
   - **Scenario** — anything else, OR any story whose body composes multiple
     components / uses a non-trivial `render` function.
3. Reports components whose stories are 100% synthetic.

Run the audit, share the output, then fix in chunks (probably split by
surface-tag, like Track A — product first since portal is closest).

**Pickup details:**

- Reference: existing audit pattern at `/tmp/jsdoc-audit.mjs` (the script that
  drove Tracks A–C). Same structure works here.
- Realistic-context examples already in the repo to model after: `Banner`'s
  `Patterns` story, `CardList`'s composition stories, anything with a
  multi-component `render`.
- For each component flagged, write one realistic story that shows the
  component in a believable consumer-app context (e.g. `EditCustomerSheet` for
  `Sheet`, `TaskListEntry` for `AddableEntryList`, etc.). Keep it short —
  exemplars need to be readable, not exhaustive.
- The CI guard at `scripts/lint-jsdoc.js` doesn't enforce this; consider
  adding a heuristic check (e.g. "every component has at least one story
  whose body is more than N lines / uses `render` / composes >1 BDS
  component") but be careful — false positives would block legitimate
  primitive-component PRs.

**Why this matters:** When `get-documentation` returns example JSX, the agent
copies that pattern. If every example is `<Button variant="primary">Action</Button>`
with no surrounding context, the agent generates UI that's syntactically valid
but compositionally awkward. Realistic stories compound the value of the rest
of the audit.

---

### 3. Track D — non-conforming components (low ROI)

**Status:** Not started. The three components listed below don't follow the
`<Name>/<Name>.tsx` shape, so [`scripts/lint-jsdoc.js`](../scripts/lint-jsdoc.js)
skips them automatically and the JSDoc audit script lists them as
"_missing file_".

**Components:**

| Component | Why it's non-conforming | Hint for the pass |
|---|---|---|
| `Calendar` | No top-level `Calendar.tsx`; rendering is split across sub-files. | Pick the canonical component to receive the `@summary` (probably the one re-exported from `index.ts`) and document. |
| `Icons` | Module of icon constants, not a single React component. | Audit doesn't really apply — consider exempting via an inline note in the linter's skip-list comment. |
| `SheetTypography` | Covers four sub-components (`SheetSectionTitle`, `SheetFieldLabel`, `SheetFieldValue`, `SheetHelperText`) — meta has no `component:` line. | Add `@summary` to each sub-component export. The story file already has a `surface-product` tag. |

**Pickup details:**

- Run `node /tmp/jsdoc-audit.mjs $(pwd)` to confirm these three are still
  the only "_missing_" rows.
- Decide for each: skip (Icons), document the canonical export (Calendar),
  document each sub-component (SheetTypography).
- Consider extending the linter's component-export detection to handle these
  shapes, then remove them from the implicit skip-list.
- This is purely cosmetic completionism — consumer agents don't typically pull
  these. Don't prioritize.

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
