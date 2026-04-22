# ADR-001 — `bds-find`: Component Discoverability for Consumer Agents

**Status:** Proposed
**Date:** 2026-04-22
**Supersedes:** —
**Superseded by:** —

## Context

Agents in consumer repos (brik-client-portal, renew-pms, brikdesigns) frequently build custom UI in isolation — forms, toasts, feedback widgets, modals — when BDS already has primitives for the same purpose. Concrete example: the feedback widget currently lives in `brik-llm` and is planned to migrate to portal, *not* to BDS, despite being a candidate for multi-consumer reuse.

Today: 86 components in `components/ui/`, 83 Storybook stories, 642 tokens. No machine-readable manifest agents can query to answer "does BDS already have X?" Storybook is human-browsable but not agent-queryable. The result is drift: consumers reinvent primitives, tokens get hardcoded, graduation-worthy capabilities stay local.

## Naming note

The original proposal called this `bds-check`. That name collides with the existing `~/.claude/hooks/bds-check.sh` hook (token-hygiene PreToolUse check on CSS/HTML writes). Two things called `bds-check` will confuse both humans and agents. **Renamed to `bds-find`** — the verb matches the intent (finding a component to adopt).

## Decision

Ship a discoverability stack in three phases:

1. **MVP (next week):** extend `scripts/build-inspector-manifest.mjs` to emit semantic fields, write `scripts/bds-find.mjs` CLI, wire the rule into global CLAUDE.md and the `product-dev` subagent pre-flight.
2. **Phase 2 (4–6 weeks):** migrate semantic overrides inline into Storybook `parameters.bds`, add `.bds-gaps.log` aggregator, first quarterly graduation review.
3. **Phase 3 (3 months):** wrap the manifest as an MCP server for live-querying agents; consider a PreToolUse hook once false-negative patterns emerge from Phase 1 data.

Only Phase 1 is guaranteed ROI. Phases 2 and 3 are contingent on Phase 1's signal (how often agents use `bds-find`, how often the gaps log fills up).

## Philosophy

**"Form is custom, function is the same."** Theming (tokens, presentation) varies per consumer; behavior lives in BDS. The Adopt / Extend / Graduate cascade:

- **Adopt:** BDS has an exact match → use it, theme via tokens.
- **Extend:** BDS has a partial match → upstream a PR to BDS first, then adopt.
- **Graduate:** BDS has nothing → build in consumer, tag as graduation candidate, promote to BDS on 2nd reuse.

`bds-find` is the mechanical surface that routes agents into this cascade.

## Manifest schema

Single `dist/bds-manifest.json` file, extending the existing artifact `scripts/build-inspector-manifest.mjs` already produces for the DevBar inspect widget. Shape per entry:

```json
{
  "name": "Form",
  "import": "@brikdesigns/bds",
  "class": "bds-form",
  "category": "inputs",
  "tags": ["form", "submit", "validation", "contact"],
  "useCases": [
    "contact form",
    "feedback form",
    "multi-field input block with submit"
  ],
  "props": ["layout", "gap", "title", "description", "error", "success"],
  "slots": ["children"],
  "themingContract": {
    "themeable": ["colors", "spacing", "typography", "radius"],
    "fixed": ["validation-behavior", "error-display", "keyboard-nav"]
  },
  "composition": ["TextInput", "TextArea", "Select", "Button", "Field"],
  "status": "stable",
  "introducedIn": "0.18.0",
  "storybookUrl": "https://bds.brikdesigns.com/?path=/story/displays-form-form--playground",
  "reuse": { "portal": true, "renew-pms": false, "brikdesigns": true }
}
```

Key fields beyond what the inspector manifest already emits:

- `useCases` — semantic hook. Hand-authored, short. How agents fuzzy-match "I need a feedback form."
- `tags` — broad vocabulary, for filter-style queries.
- `themingContract` — encodes the form-vs-function rule. `fixed` is what consumers cannot safely override.
- `composition` — signals which primitives a component is built from.
- `reuse` — per-consumer adoption tracking; feeds the graduation review.

**COMPONENT-MAP.md reconciliation:** the 57-entry file at `brik-llm/websites/shared/COMPONENT-MAP.md` is a different lookup (marketing-section annotations → Webflow composite patterns, not BDS primitives). Leave it alone. Add a separate `blueprints` section to the manifest that mirrors `blueprints/blueprint-library.json` so `bds-find "hero with CTA"` returns both composites and primitives.

## Generation strategy

Three options considered:

| Option | Freshness | Semantic quality | Maintenance |
|---|---|---|---|
| Hand-authored JSON | Drifts | High | High |
| Auto-generated from Storybook meta + JSDoc | Always fresh | Low without conventions | Low once conventions exist |
| Hybrid: auto for mechanical, overrides file for semantic | Fresh mechanical | High semantic | Medium |

**Hybrid.** Auto-generate `name`, `class`, `props`, `composition`, `storybookUrl`, `introducedIn` by walking `components/ui/*/*.stories.tsx` (the existing builder already does most of this). Hand-author `useCases`, `tags`, `themingContract`, `status` in `scripts/manifest-overrides.json` — same pattern as the existing `scripts/inspector-overrides.json`.

For Storybook meta to carry semantic hints without a separate overrides file, add a `parameters.bds` block:

```ts
const meta: Meta<typeof Form> = {
  title: 'Displays/Form/form',
  component: Form,
  parameters: {
    layout: 'centered',
    bds: {
      useCases: ['contact form', 'feedback form', 'field group with submit'],
      tags: ['form', 'submit', 'validation'],
      status: 'stable',
      themeable: ['colors', 'spacing', 'typography'],
      fixed: ['validation-behavior', 'keyboard-nav'],
    },
  },
};
```

**Tradeoff:** inline meta couples manifest quality to story-author discipline. The overrides file is the pragmatic fallback for the first six months; migrate inline as conventions solidify.

## CLI spec

```
bds-find <query>                      Fuzzy search use-cases, tags, names
bds-find --tag form                   Filter by tag
bds-find --list                       Dump all entries (JSON)
bds-find --exact <name>               Lookup by component name
bds-find --format=json|md             Output format (default: md for TTY, json for pipes)
bds-find --consumer <slug>            Highlight what's already adopted/not in this consumer
```

**Exit codes** map directly to Adopt / Extend / Graduate:
- `0` — exact or high-confidence match (Adopt)
- `1` — partial match (Extend — closest candidates shown)
- `2` — no match (Graduate — agent prompted to log to `.bds-gaps.log`)
- `3` — internal error

**Output (Markdown, default for humans):**

```
MATCH (0.92) — Form
  import { Form } from '@brikdesigns/bds';
  class: bds-form                 status: stable
  use-cases: contact form, feedback form
  composes: TextInput, TextArea, Select, Button
  storybook: https://bds.brikdesigns.com/?path=/story/displays-form-form--playground
  theme-via: colors, spacing, typography
  fixed:     validation-behavior, keyboard-nav

PARTIAL (0.61) — DevFeedbackWidget
  Different: this is a floating inline-feedback capture tool for
  dev/staging, not a general contact form. Use Form for user-facing.
```

JSON output is the same data, flat. Agents pipe `bds-find "feedback form" --format=json` and branch on `confidence` and `status`.

Fuzzy match: small library (`fuse.js`) or hand-rolled Levenshtein-over-useCases. Don't overbuild.

## Agent integration

| Mechanism | Robustness | Friction | Effort |
|---|---|---|---|
| (a) Rule in subagent instructions | Low — relies on agent reading CLAUDE.md | None | Trivial |
| (b) PreToolUse hook on `*.tsx` writes in consumer repos | High — fires regardless of memory | Noisy if poorly scoped | Medium |
| (c) `product-dev` subagent internal pre-flight | Medium — covers one subagent | Low | Low |

**MVP = (a) + (c).** One-liner in global CLAUDE.md under "BDS + BCS Ecosystem Rules": *"Before writing a `*.tsx` in portal, renew-pms, or brikdesigns, run `bds-find <intent>`."* Plus a pre-flight in the `product-dev` subagent that automatically runs `bds-find` with the feature description on spawn.

**Defer (b).** Hooks are stronger enforcement but risky for three reasons:

1. The existing `bds-check.sh` hook already warns on CSS hygiene — a second hook in the same namespace risks noise fatigue (the 2026-04 anti-slop rollout specifically kept warnings info-only for Phase 1 for this reason; see `reference-anti-slop-hook.md`).
2. Heuristics for "this `.tsx` is a form/dialog" are hard to get right without false positives on internal dashboard code.
3. Hooks run on every write; the agent is already past the decision point where `bds-find` is useful.

Revisit (b) in Phase 2 once the manifest is proven and a concrete miss pattern emerges.

## Graduation pattern

CLI output maps directly to cascade tiers:

- **Confidence ≥ 0.85 and `status: stable`** → Adopt. Prints import line + Storybook URL; exits 0.
- **Confidence 0.5–0.85, or `status: beta`** → Extend. Prints partial match + suggested BDS PR template; exits 1. Agent opens issue on BDS, does NOT fork in consumer.
- **Confidence < 0.5** → Graduate. Appends entry to `<consumer-repo>/.bds-gaps.log` (JSONL) and exits 2:

```json
{ "date": "2026-04-22", "query": "inline rating widget", "consumer": "portal", "feature": "client-feedback", "path": "src/components/RatingWidget.tsx" }
```

The gaps log is the single source of truth for graduation candidates. Quarterly review (aligned with existing BCS industry pack cadence) runs `scripts/aggregate-gap-logs.sh` across the three consumer repos, groups by query similarity, promotes any 2+ hit patterns to BDS tickets. No dashboards, no Notion sync — bash script + monthly triage.

## Precedents

- **Shopify Polaris** shipped an MCP server in late 2025 that exposes `list_components`, `get_component_schema`, `get_component_docs` — filterable by category, returns properties/events/slots + documentation URL. The `bds-find` manifest is a strict subset of Polaris's, which validates the schema shape. [Polaris MCP docs](https://shopify.dev/docs/api/polaris/using-mcp) · [changelog](https://shopify.dev/changelog/the-shopifydev-mcp-server-now-supports-polaris-web-components).
- **Material & Carbon** both ship JSON component indexes for their documentation sites, but neither exposes an LLM-first interface. Their formats are HTML-biased. Skip.

**Lesson from Polaris:** they split into four focused MCP servers rather than one monolith. For us, keep `bds-find` a plain CLI + one manifest file for the MVP; promote to MCP only if we see agents wanting live-query instead of file-write-time check.

## MVP scope (Phase 1)

| Item | File |
|---|---|
| Extend manifest builder to emit `useCases`, `tags`, `status`, `themingContract` | `scripts/build-inspector-manifest.mjs` |
| Hand-authored semantic overrides | `scripts/manifest-overrides.json` (new) |
| CLI | `scripts/bds-find.mjs` (new, ~200 lines) |
| Global rule | `~/Documents/GitHub/CLAUDE.md` under "BDS + BCS Ecosystem Rules" |
| Product-dev subagent pre-flight | `~/.claude/agents/product-dev.md` |
| Npm script | `package.json` → `"bds:find": "node scripts/bds-find.mjs"` |

**Effort:** ~1 focused day. Ships in BDS v0.32.0.

**Success metric (6-week checkpoint):** does the `.bds-gaps.log` fill up across the three consumers? If yes, Phase 2 (inline meta + aggregator) is obvious. If no, the fix is integration (hook or stronger subagent coupling), not more manifest.

## Alternatives considered

**Alternative: no CLI, rely on subagent prompting alone.** Rejected — agents forget. Without a concrete tool to run, the rule degrades to "try to remember BDS." The signal from `.bds-gaps.log` is also lost.

**Alternative: full MCP server from day 1.** Rejected — Polaris's own split suggests MCP is premature when the manifest itself is unproven. The CLI can graduate to MCP later when the manifest format is stable.

**Alternative: auto-generate manifest from TypeScript AST only (no Storybook meta).** Rejected — TypeScript gives you props and types, not semantic `useCases`. Without human-curated semantic hints, fuzzy matching on "feedback form" would miss `<Form>` because the TS surface doesn't say "feedback."

## Open questions

1. Should `bds-find` be distributed via the npm package (consumers get it automatically when they `npm install @brikdesigns/bds`) or installed globally via a separate CLI package? Trade-off: package distribution means consumers always have it; global install means it works in non-npm consumers (brik-llm, brikdesigns submodule). **Recommendation:** ship it as a `bin` in `@brikdesigns/bds` (npm consumers get `npx bds-find`) AND as an executable in the submodule (`./brik-bds/scripts/bds-find.mjs`). One source, two distribution paths.
2. What's the ownership model for `manifest-overrides.json`? If every component needs a semantic-overrides entry, and the component author is a subagent, do we need a lint rule blocking PRs that add a component without updating overrides? **Recommendation:** defer. Treat missing overrides as "low confidence in manifest entry" rather than a blocker. Nudge in PR reviews, not CI.

## Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-22 | ADR drafted by architect subagent | |
