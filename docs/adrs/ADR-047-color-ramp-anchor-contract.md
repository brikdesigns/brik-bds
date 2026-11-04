# ADR-047 — The colour ramp's anchor contract: six pinned stops, five OKLCh midpoints, numeric authored

**Status:** **Accepted** 2026-11-03 (AGENT DECIDED, revisable — § Decision)
**Date:** 2026-11-03
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#2347](https://github.com/brikdesigns/brik-bds/issues/2347) (this ADR), [#1949](https://github.com/brikdesigns/brik-bds/issues/1949) (the step vocabulary; ADR-033 § Amendments), [#2337](https://github.com/brikdesigns/brik-bds/issues/2337) (broke on this contract while it was unwritten), [#1737](https://github.com/brikdesigns/brik-bds/issues/1737) (the generator), [#1739](https://github.com/brikdesigns/brik-bds/issues/1739) (the alias layer), [#2711](https://github.com/brikdesigns/brik-bds/issues/2711) (bridge retirement), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md), [ADR-043](./ADR-043-system-id-token-prefix.md) § 4

## Context

Every Brand Kit colour family is an 11-step ramp, `50`–`950`. `scripts/generate-color-ramps.mjs` builds it, and `compileClientTheme` runs the same code on a client kit (`scripts/compile-client-theme.mjs:63-67`).

The contract the generator holds was written down only in its own JSDoc and its test. #2337 broke on it: the Figma sync pruned the six word-step names from the Brik kit, and the generator threw because it read its anchors only from those names.

ADR-043 § 4 has since retired the word steps from canonical CSS (`docs/adrs/ADR-043-system-id-token-prefix.md:122-126`). That settled the vocabulary. It did not settle which way the generator runs. This ADR records that.

## Decision

AGENT DECIDED (revisable): record the contract as the code holds it today, with the generator **inverted** rather than retired — evidence: the Brik kit holds 99 numeric literals and 54 word-step aliases, 0 word-step literals (`design-tokens/brand-kits/brik.json`, counted 2026-11-03); `npm run gen:color-ramps:check` exits 0 — revert: mark this ADR Superseded and file the retire-the-generator alternative against #1949.

### 1. Six anchors at fixed stops

Each of the six old step names pins one numeric stop (`ANCHOR_STOPS`, `scripts/generate-color-ramps.mjs:89-96`):

| Name | Stop |
|---|---|
| `lightest` | 100 |
| `lighter` | 300 |
| `light` | 500 |
| `dark` | 700 |
| `darker` | 800 |
| `darkest` | 950 |

The mapping is ordinal, not by absolute lightness. Families do not share a lightness range: green's `light` sits at L 0.93, poppy's at L 0.63. A global ladder would put green's brand base at 100.

`light → 500` is load-bearing. 500 is the brand base (poppy 500 is annotated "Brand primary base" in the kit), and it leaves room for a 600 between `light` and `dark`.

### 2. Five generated stops, each the OKLCh midpoint of two anchors

`DERIVED_FROM`, `scripts/generate-color-ramps.mjs:107-113`:

| Stop | Midpoint of |
|---|---|
| 200 | 100, 300 |
| 400 | 300, 500 |
| 600 | 500, 700 |
| 900 | 800, 950 |
| 50 | 100, white |

A generated stop reads anchors only, never another generated stop, so a rounding error cannot compound down the ramp. No stop is hand-tuned per family.

`white` and `black` are endpoints shared by the whole system. They keep their names and stay out of the ramp.

### 3. Direction: numeric is authored, the names are derived

This is the disposition #2347 asked for: **invert**, not retire.

- **Authored:** the numeric anchor stops (100, 300, 500, 700, 800, 950), in Figma and the kit JSON. When a kit has no word names, `buildRamp` reads each anchor from its pinned stop (`scripts/generate-color-ramps.mjs:198-210`). This is what fixed #2337.
- **Derived:** the five midpoints, which the generator writes into the kit (`--apply`), and the six word names, which `applyRamp` re-emits as `{color.<family>.<stop>}` aliases marked `DEPRECATED` (`:353-363`).
- **Dropped from canonical CSS:** the word aliases. The `bds/retire-word-steps` preprocessor re-points any reference to them at the numeric stop, and `isCanonicalCssToken` filters them out (`scripts/lib/sd-bds.mjs:8-13`, `:122-124`). `dist/tokens.css` carries no word-step colour name.
- **Still resolving for consumers:** the 54 unprefixed legacy names, through `tokens/compat/prefix-bridge.css` (`--color-blue-lightest: var(--bds-color-blue-100)`). That keeps the operator's 2026-09-09 direction not to delete the aliases until the numeric transition has proven out (quoted in the [#1949 disposition comment](https://github.com/brikdesigns/brik-bds/issues/1949)). Their removal is #2711.

**Why the word aliases stay in the kit, though no CSS emits them:** `bds/retire-word-steps` throws on a word step that is not a plain alias (`scripts/lib/sd-bds.mjs:33`), and the Figma kit is where those aliases come from. They are build input, not canon.

**Why not retire the generator:** the five midpoints have no other source. Retiring it would mean hand-authoring 45 values per kit (five stops × nine families) and losing the check in § Enforcement that catches a midpoint edited by hand.

## Consequences

- **An anchor edit is a whole-ramp edit.** Changing poppy 500 in Figma moves 400 and 600 too. The kit then fails the kit-stop check until `npm run gen:color-ramps:apply` re-derives them. That is intended: a brand change re-generates its midpoints, or it does not ship.
- **A client kit gets the same ramp.** `compileClientTheme` calls `applyRamp` in memory, so a client's 11 stops come from this generator and from nothing else.
- **One copy is outside the contract.** The hard-coded six-name palettes in `tokens/index.ts:133-187` are public API of `@brikdesigns/bds`, and no assertion compares them to the kit. On 2026-11-03, 6 of 54 values differed from their pinned stop: `orange.darkest`, `purple.darkest`, and grayscale `light`, `dark`, `darker`, `darkest`. This ADR records the gap. It does not close it.
- **Out of scope:** writing the ramps back to Figma (#1738) and migrating consumers off the word names (#1740, #2711).

## Migration

None. This ADR records the code as it stands. `docs-site/lib/color-scales.ts` already reads `design-tokens/color-ramps.generated.json` and does not restate the mapping. Its header now points here.

## Enforcement

The `tokens-gate` workflow runs `npm run gen:color-ramps:check` and `scripts/__tests__/generate-color-ramps.test.mjs` on every token PR (`.github/workflows/tokens-gate.yml:298-308`, `:475-477`). `--check` runs `buildRamp` over every committed kit, so the three assertions in `buildRamp` hold on every PR:

| Assertion | Where | Catches | Control, 2026-11-03 |
|---|---|---|---|
| Missing anchor | `scripts/generate-color-ramps.mjs:212-221` | a family with neither the word name nor its numeric stop | test "still refuses a family missing BOTH the name and its numeric stop" |
| Kit stop vs generated | `:250-265` | a hand-edited midpoint, or an anchor moved without re-running `--apply` | tests under "the kit stops must match the ramp (ADR-047)": poppy `600` set to `#000001` throws; poppy `500` set to `#ff0000` throws at stop 400 |
| Round-trip | `:233-248` | — | **cannot fire** (below) |

**The round-trip assertion is vacuous as written.** Both of its sides come from `resolveAnchor(familyName, entries, name)` on the same input, and no later loop overwrites an anchor stop. Every mismatch planted against it on 2026-11-03 (`light` aliased to the wrong stop, `light` a literal that disagrees with 500) was thrown by the kit-stop check first. What it was written for, that a word name lands on its pinned stop, is held by two other things: the kit-stop check, and the test "round-trips all six named steps", which asserts each alias is exactly `{color.<family>.<stop>}`. The assertion is left in place. It costs nothing and documents intent.
