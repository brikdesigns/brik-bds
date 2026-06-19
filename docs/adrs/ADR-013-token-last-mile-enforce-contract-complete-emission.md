# ADR-013 — Token last mile: enforce the cascade contract, complete mode emission

**Status:** Proposed
**Date:** 2026-06-19
**Supersedes:** —
**Superseded by:** —
**Related:** [#340](https://github.com/brikdesigns/brik-bds/issues/340) (wire data-mode overrides for non-color tokens), [#920](https://github.com/brikdesigns/brik-bds/issues/920) (typography modes), [PR #483](https://github.com/brikdesigns/brik-bds/pull/483) (spacing modes — paradigm precedent), [cascade.mdx](../../docs-site/content/docs/getting-started/cascade.mdx) (the consumer contract this ADR enforces), [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) (closed-allowlist precedent for stopping drift at the source), [ADR-011](./ADR-011-service-line-token-value-model.md) (Figma-is-SoT value model)
**Owner:** Nick Stanerson

## Context

Consumer sessions keep rediscovering the same class of token failure — a needed token isn't in `dist/tokens.css`, so the consumer hand-rolls a local value, and the divergence is found months later. Recent instances:

- **Typography modes dormant** ([#920](https://github.com/brikdesigns/brik-bds/issues/920)) — the `typography/{compact,comfortable,spacious}` slices exist in `tokens-studio.json` but only `default` is emitted; no `[data-mode-typography]`.
- **brikdesigns heading remap** — `src/app/globals.css` redefines `--heading-lg`/`--heading-xl`/`--heading-huge` to a scale matching *no* BDS mode. Git-blamed to the scaffold commit (`0cd28bd`, 2026-03-19); load-bearing and invisible for ~3 months.
- **Display floor gap** — smallest display token (72.8px) sits far above the largest heading in any mode (45.5px); the 46–72px band has no named token, so interior marketing heroes can't reach ~57px.
- Earlier: dark service-token lightening, CardGrid hardcoded `<h2>`, `spacing.mdx` documenting a `.body`-class spacing mode that was never wired ([#340](https://github.com/brikdesigns/brik-bds/issues/340)).

These read as scattered bugs but share **one root cause**: the token system is richly modeled at the source (`tokens-studio.json`: a single `font-size-100…1800` math scale, 9 modal collections, client theming via Brand Kit) but the **last mile is incomplete in two specific places** — not in the design.

1. **Emission is partial.** Of 7 non-color mode collections, only `spacing` and `borderwidth` reach consumable CSS. The other 5 (`typography`, `border-radius`, `elevation`, `breakpoint`, `icon`) are dormant. [cascade.mdx](../../docs-site/content/docs/getting-started/cascade.mdx) honestly marks them `⏳ #340`, but a consumer needing one has no on-contract option and hand-rolls.
2. **The contract is documented but unenforced.** cascade.mdx already *is* the consumer contract — `@layer` order, the `<html>` attribute switchboard, "every consumer follows the same path." But nothing fails a consumer that violates it. `scripts/lint-tokens` (consumer-side) catches *invented* token names, service-family, and property pairing — but a *redefinition* of a real BDS token (`--heading-lg: var(--font-size-700)`) is neither invented nor mispaired, so it passes silently. Documentation without a gate is a suggestion; the scaffold remap proves consumers drift off it.

The design is sound and ~80% built. The recurring pain is the unbuilt 20%: finish emission, and enforce the contract that already exists.

## Decision

Treat the token "last mile" as one initiative with three mechanisms. We do **not** redesign the scale, the mode model, or the cascade — those are correct (see Alternatives).

**1. Complete mode emission (the `#340` half).** Run [#340](https://github.com/brikdesigns/brik-bds/issues/340) as a near-term project, not a someday-umbrella: one sequenced sub-issue per dormant collection ([#920](https://github.com/brikdesigns/brik-bds/issues/920) is the typography slice), each extending the existing `scripts/generate-modes-css.mjs` `COLLECTIONS` registry — the mechanism [PR #483](https://github.com/brikdesigns/brik-bds/pull/483) shipped for spacing. (#340's original flatten + per-mode-SD-config sketch predates #483 and is stale.) Add a **source↔emitted CI diff**: a check that fails when a collection/mode exists in `tokens-studio.json` but is absent from `dist/tokens.css`, so dormant tokens self-report instead of being discovered by hand.

**2. Enforce the cascade contract — a BDS-owned shared gate.** Author a **redefinition rule** in a lint that **BDS owns and consumers import** (not per-repo copies that drift): a consumer `:root`/theme block may not *redefine* a BDS-owned scale/semantic token (`--heading-*`, `--display-*`, `--surface-*`, `--font-size-*`, etc.). Brand-color overrides remain the one allowed exception (per CLAUDE.md). Pair it with the missing typography family↔size check (font-family family must match font-size family within a rule). brikdesigns is the first *importer* — it wires the shared rule into its existing `lint-tokens` run; portal and renew adopt the same export. This converts "silent drift found months later" into "PR fails immediately" — the ADR-008 move (stop drift at the source) applied to token *values* instead of names, and owned in one place so the gate itself can't fork.

**3. Make cascade.mdx the single canonical adoption contract, and verify adoption per consumer.** cascade.mdx is the contract of record; `installation.mdx` links to it as the one setup path. Each consumer repo (brikdesigns first, then portal, renew) gets a one-time adoption audit: declares the layer order, sets `data-theme`/`data-mode-*` on `:root`, imports `tokens.css`, and holds **zero** token redefinitions. brikdesigns is the live test case — adopting `data-mode-typography` and deleting its remap is the proof the loop closes.

## Consequences

- **brik-bds** — #340 becomes a sequenced project; new `generate-modes-css.mjs` collection entries per slice; a source↔emitted manifest check in CI; the redefinition + typography-family lint rules ship as a **BDS-owned export** consumers import; cascade.mdx promoted to "the adoption contract" with installation.mdx pointing at it.
- **Consumers (brikdesigns first)** — import the shared BDS gate into their existing `lint-tokens` run (pre-commit + CI). brikdesigns deletes the `globals.css` heading remap once `data-mode-typography` is emitted and adopts a mode (`comfortable`/`spacious`). portal/renew import the same gate; shadow-token copies (the rolled-back #512/#553 anti-pattern) fail it.
- **Agents** — the working model becomes cut-and-dry: set the attributes, use allowlisted tokens, and the gate stops you if you drift. Token gaps announce themselves in CI instead of in a future session.
- **Cost** — the redefinition gate may flag pre-existing consumer drift on first run; allowlist transitionally (as the invented-token rule already does) and burn down.

## Alternatives considered

- **Realign brikdesigns to BDS canon px (delete the remap, adopt default-mode values).** Rejected: shrinks every marketing heading one step, undoes shipped work (#535), and removes the 57.5px size interior heroes need — BDS's *default* heading scale doesn't reach marketing sizes. The mode system exists precisely so marketing selects a larger scale; the fix is to emit the modes, not to flatten the site to the product scale.
- **Documentation-only (write/expand the contract, no gate).** Rejected: the contract already exists in cascade.mdx and was still violated for 3 months. Docs without enforcement is the status quo that produced this ADR.
- **Per-consumer local scales (let each repo define its own).** Rejected: this *is* the parallel-taxonomy failure mode that rolled back portal #512/#553 and produced the brikdesigns remap. One root scale + modes + Brand Kit theming is the decision; local scales are the thing the gate exists to stop.
- **Redesign the scale/mode model.** Rejected: the model is correct and ~80% built. The work is completeness and enforcement, not redesign.
