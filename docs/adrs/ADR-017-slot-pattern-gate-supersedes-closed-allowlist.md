# ADR-017 — Slot governance: a structural pattern gate supersedes the closed allowlist

**Status:** Accepted (2026-07-05)
**Date:** 2026-07-05
**Supersedes:** [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) §2 (closed allowlist for slot names) and its Phase C
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** ADR-008 (naming canon), #1137 (this work), #1080 (softened the false "CI-asserted" claim), ADR-009 (typegen — the sibling reversal for variant unions)

## Context

ADR-008 §2 decided that slot names (the BEM `__suffix`) would be governed by a **closed, enumerated allowlist** in `docs/SLOT-ALLOWLIST.md`: canon lists every allowed slot, and a lint (Phase C) rejects anything not on the list. Phases D–F would then consolidate blueprints and migrate consumers.

**Phase C never shipped.** The allowlist file was created and maintained by review, but no lint ever parsed its blocks — the real gates (`canonical-check.mjs`, `canonical-class-check.mjs`) read `dist/tokens.css` / `dist/styles.css`, not the allowlist. #1080 caught the file self-describing as CI-enforced when it wasn't, and marked it **advisory only**.

Wiring the *enforcing* lint as originally specified turned out to be blocked on an unpayable debt. Measured on `components/` + `content-system/blueprints/` on 2026-07-05:

- **396 distinct slot suffixes in use**; the allowlist enumerated **101 distinct bases** → **329 in-use slots were unlisted.** A naive allowlist lint would fail the build on shipped, correct code — the exact opposite of a useful gate.
- **77 slots are intentionally cross-block generic** — `__title` (22 blocks), `__label` (21), `__icon` (18), `__content` (17). Any "no cross-block reuse" rule would flood on the system's own design.

The enumerated model asks canon to keep a complete, hand-maintained registry of every slot in the system and to grow it by PR forever. That burden is what went unpaid for two months. The drift the allowlist was meant to stop is *shape* drift — camelCase, single underscores, stray uppercase, layout names baked into slots — not the existence of new well-formed nouns.

## Decision

**Govern slots by structural pattern, not by enumeration.** A `bds-*` class is canonical iff it matches the ADR-008 §4 grammar:

```
bds-<block>
bds-<block>--<modifier>
bds-<block>__<slot>
bds-<block>__<slot>--<modifier>
```

where `<block>`, `<slot>`, `<modifier>` are each kebab-case (`[a-z][a-z0-9]*(-[a-z0-9]+)*` for the block; `[a-z0-9]+(-[a-z0-9]+)*` for slot/modifier). No single underscores, no other separators, no doubled `__`/`--`.

- The gate is `scripts/slot-pattern-check.mjs` — a pure source scan (no build step), wired into `.husky/pre-commit` (staged) and `.github/workflows/slot-pattern-check.yml` (full-tree on PR + push to main).
- **New vocabulary requires no canon edit** — a well-formed new slot (`__preset-display-row-tag`) passes because it *is* well-formed. Only malformed names fail.
- Dynamic class construction (`` `bds-badge--${tone}` ``, `'bds-tag__' + slot`) is not judged — interpolation normalizes to a valid segment and trailing-separator prefixes are skipped, since the runtime tail is unknowable statically.

This inverts ADR-008 §2's burden the right way: the enumerated allowlist made the default *reject* and forced approval for every new word (unpayable at 396 slots); the pattern gate makes the default *accept any well-formed name* and rejects only genuinely off-pattern shapes (zero maintenance, no reconciliation debt).

## What stands from ADR-008

ADR-017 supersedes **only §2** (the closed enumerated allowlist and its Phase C). The rest of ADR-008 is unchanged and, in fact, is what the pattern gate now *enforces*:

- **§1 single `bds-` namespace** — still canon.
- **§3 structural-only modifiers** (no `--dark`/`--centered`/`--inverse`) — still canon; still enforced by `lint-blueprint-naming.mjs`'s banned-suffix list. The pattern gate checks *shape*, not the appearance/theme *semantics* of a modifier.
- **§4 BEM `__`/`--` separator grammar** — this is precisely what the pattern gate encodes.

## Consequences

- `docs/SLOT-ALLOWLIST.md` is repurposed from an enumeration to a short **pattern spec** (the grammar + examples), with #1080's advisory note removed — the file now accurately describes an enforced gate. The filename is kept to preserve inbound links.
- The `component-build` standard's "closed allowlist / verify every `__slot` is in SLOT-ALLOWLIST.md" language is updated to the pattern rule.
- ADR-008 §2 is annotated as superseded in place; its migration table's Phase C is marked closed-as-superseded.
- **Not done here** (out of scope, flagged for follow-up): ADR-009's prose references ADR-008's closed allowlist as historical precedent — left as-is (accepted-ADR history, not a live instruction). The `component-build` SKILL.md frontmatter still says "closed allowlist via ADR-008" — imprecise but not load-bearing; align on next touch.

## What this ADR refuses

- It refuses to enforce §3's appearance/theme-modifier ban inside the pattern gate. That is a semantic judgement (`--dark` is well-*shaped* but banned by meaning), owned by `lint-blueprint-naming.mjs`. Mixing the two would couple a cheap shape regex to a maintained banlist.
- It refuses to re-open the consumer-extension question ADR-008 left open. Consumers import the same shape rule; a well-formed consumer slot is fine by construction.
