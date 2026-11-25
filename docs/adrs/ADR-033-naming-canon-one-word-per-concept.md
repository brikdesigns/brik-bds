# ADR-033 — Naming canon: one word per concept, one prop name per axis, one step vocabulary per tier

**Status:** Accepted
**Date:** 2026-08-20
**Accepted:** 2026-08-21 — § Enforcement's gate shipped as [`lint-naming-canon`](../../scripts/lint-naming-canon.mjs) ([#1936](https://github.com/brikdesigns/brik-bds/issues/1936)), all rules demonstrated failing on planted violations.
**Supersedes:** —
**Superseded by:** —
**Owner:** Nick Stanerson
**Related:** [#1910](https://github.com/brikdesigns/brik-bds/issues/1910) (the audit this ADR is Deliverable 2 of), [#1909](https://github.com/brikdesigns/brik-bds/issues/1909) (status-token deprecation — sequenced behind this ADR), [ADR-008](./ADR-008-naming-canon-closed-allowlist.md) §3/§4 (BEM grammar + structural-only *blueprint* modifiers), [ADR-017](./ADR-017-slot-pattern-gate-supersedes-closed-allowlist.md) (slot pattern gate), [ADR-014](./ADR-014-component-token-hook-namespace.md) (`--bds-` component tier), [ADR-011](./ADR-011-service-line-token-value-model.md) (service-line scoped intent), [token-anatomy.mdx](../../docs-site/content/docs/foundation/token-anatomy.mdx) (the Anatomy this ADR supplies vocabulary for), [brikdesigns#987](https://github.com/brikdesigns/brikdesigns/issues/987) (the consumer defect that started the audit)

## Context

ADR-008/017/030 govern the **shape** of a name — the `bds-` namespace, the BEM `__`/`--` grammar, the slot pattern gate. [token-anatomy.mdx](../../docs-site/content/docs/foundation/token-anatomy.mdx) governs the **structure** of a token name — which slots exist and in what order. Nothing governs the **words**. So every component and every token has been free to pick its own synonym for a concept the system already had a word for, and the gates pass because the shape is correct.

The cost is not cosmetic. In one brikdesigns session, ambiguous naming produced two wrong conclusions from correct searches — the answer depended on which synonym was guessed. `brikdesigns#987` is the consumer version of the same failure: `blocks.ts:163` mapped Banner tone `success` → `information` on the strength of a comment asserting BDS had no success tone. It does.

The seven-axis discovery pass on #1910 is complete. Every number below was measured against `@brikdesigns/bds@0.165.0` with `dist/tokens.css` rebuilt (`npm run build:dist-tokens`); the full inventories are on [#1910](https://github.com/brikdesigns/brik-bds/issues/1910) (axis 3 in [#1911's comment](https://github.com/brikdesigns/brik-bds/issues/1910#issuecomment-5358711683), axes 6–7 in [this one](https://github.com/brikdesigns/brik-bds/issues/1910#issuecomment-5359345838)).

### The negative concept has four spellings; the info concept has three

Measured across the shipped prop unions:

| Concept | Spellings in use | Where |
|---|---|---|
| negative | `error`, `negative`, `danger`, `destructive` | `error` — [Badge.tsx:6](../../components/ui/Badge/Badge.tsx), [Banner.tsx:9](../../components/ui/Banner/Banner.tsx), [Counter.tsx:5](../../components/ui/Counter/Counter.tsx), [Dot.tsx:5](../../components/ui/Dot/Dot.tsx), [Meter.tsx:8](../../components/ui/Meter/Meter.tsx), [Toast.tsx:9](../../components/ui/Toast/Toast.tsx), [Field.tsx:7](../../components/ui/Field/Field.tsx) · `negative` — [ProgressCircle.tsx:6](../../components/ui/ProgressCircle/ProgressCircle.tsx) · `danger` **and** `destructive` — both in one union, [Button.tsx:32-43](../../components/ui/Button/Button.tsx) |
| positive | `positive`, `success` | `positive` — Badge, Dot, Meter, ProgressCircle, Button · `success` — Banner, Counter, Toast |
| info | `info`, `information`, `progress` | `info` — Badge, Dot, Toast · `information` — Banner · `progress` — Badge, Counter, and [Counter.css:31](../../components/ui/Counter/Counter.css) proves it is the same blue signal (`--background-status-info`) |

The token layer has **already decided this axis**, and decided it the other way from the prop majority. `dist/tokens.css:1333-1334`:

```css
/* ── Backward-compat aliases (old --*-status-* → canonical Figma names) ──
   ⚠️ DEPRECATED: migrate consuming projects to canonical names, then remove. */
--background-status-error:   var(--background-negative);
--background-status-success: var(--background-positive);
```

So `error`/`success` are the **deprecated** spellings at the token layer and `negative`/`positive` are canonical — while `error`/`success` are the **majority** spelling at the prop layer. That is the whole problem in one line: two layers of one system migrating in opposite directions, neither aware of the other.

### Three words are each doing duty for two or three different axes

The audit's § A framed this as "one axis, three prop names." Measured, it is worse and more specific: five distinct axes share three words, so no single rename fixes it.

| Word | Axes it currently names | Evidence |
|---|---|---|
| `status` | **severity** (Badge, Counter, Dot, Meter, ProgressCircle) · **presence** ([Avatar.tsx:6](../../components/ui/Avatar/Avatar.tsx) `online\|offline\|busy\|away`, re-exported by [Card.tsx:70](../../components/ui/Card/Card.tsx) + [Table.tsx:408](../../components/ui/Table/Table.tsx)) · **lifecycle** ([TaskConsole.tsx:14](../../components/ui/TaskConsole/TaskConsole.tsx) `pending\|in_progress\|completed\|failed`) |
| `tone` | **severity** ([Banner.tsx:25](../../components/ui/Banner/Banner.tsx), [Field.tsx:36](../../components/ui/Field/Field.tsx) `helperTone`) · **hue source** ([TextLink.tsx:13](../../components/ui/TextLink/TextLink.tsx) `brand\|neutral`, [SocialIcon.tsx:26](../../components/ui/SocialIcon/SocialIcon.tsx) `grayscale\|brand\|accent`, [ContactIcon.tsx:27](../../components/ui/ContactIcon/ContactIcon.tsx) `grayscale\|accent`) |
| `variant` | **form** (Card, TabBar, Skeleton, Sheet, ServiceTag, Testimonial, Footer, ToggleSwitch, ProgressStepper — 9 unions, no severity value between them) · **severity, mixed into form** (Button `destructive`/`positive`/`danger`, Toast `success`/`error`/`warning`/`info`) |

`variant` is therefore **not** a competing spelling of the severity axis in general. It is correct on nine components and wrong on exactly two, which are also the two that mix a valence value into a form union. Badge's own union mixes three axes in seven members: `positive|warning|error|info` (severity) + `progress` (a third info spelling) + `brand` (hue source) + `neutral`.

### One token name, two concepts — twice, and both fail silently

`--box-shadow-md` is defined twice with incompatible types:

```css
dist/tokens.css:329    --box-shadow-md: 8px;                                   /* a blur length */
dist/tokens.css:1408   --box-shadow-md: var(--shadow-md); /* bds-lint-ignore — load-bearing override */
```

A consumer reading line 329 concludes it is a length and is wrong; the second declaration wins by cascade order. `--box-shadow-none` at `:1327` is the family's odd member — a length (`0px`) that is never re-declared, so it is the one name in the family that really is a length, and `box-shadow: 0px` is invalid CSS, meaning the seven `var(--box-shadow-none)` sites drop their declaration rather than resolve to "no shadow."

`info` is the second case, and `dist/tokens.css:1358-1360` documents the collision in its own comment:

```
Categorically distinct from --background-info / --text-info (static informational
status, neutral/gray) and --background-status-info (informational signal, blue).
```

Two concepts, one word, one segment apart. `--background-info` resolves to `--color-system-neutral` (`:484`); `--background-status-info` resolves to `--color-system-blue` (`:1366`).

### Nine token slots draw from more than one step vocabulary

From `npm run lint-token-purpose-slots -- --census`: `size` · `border-radius` · `border-width` · `aspect` · `duration` · `display` · `shadow` · `content-width` · `iteration`. Worst case is `--border-width-*`, which carries three vocabularies at once — numeric (`--border-width-100`, `:255`), t-shirt (`--border-width-md`, `:400`), and `thin`/`standard`/`bold` (`:1480-1482`) — where `--border-width-standard` is a mode-invariant 2px duplicate of `--border-width-md`, which the spacing modes vary between 1px and 3px (`:1043`, `:1051`).

A second class of split is subtler: `tiny` and `huge` are not synonyms of `xs` and `xl` but **out-of-vocabulary names for the rungs beyond them**. Measured, `--gap-tiny` is `--space-50` and `--gap-xs` is `--space-100` (`:419-420`); `--gap-huge` is `--space-800` and `--gap-xl` is `--space-600` (`:416-418`). `--icon-*` ships a **nine-rung** ramp of which two rungs are named out of vocabulary — `tiny` (`--font-size-50`) · `2xs` (12px) · `xs` (`--font-size-75`) · `sm` · `md` · `lg` · `xl` · `2xl` (24px) · `huge` (`--font-size-500`), at `:1306-1318`.

> **This retracts a claim in #1910's axis-3 comment**, which read "`--icon-*` spells the same step `tiny` in one place and `2xs` in another." It does not. `dist/tokens.css:1317`'s own comment places `--icon-2xs` *between* `--icon-tiny` and `--icon-xs`, and all three are defined at distinct values in the same block. They are three rungs, not one rung with two spellings — which changes the disposition from "delete a duplicate" to "rename a rung," and is why § 3 extends the t-shirt vocabulary rather than collapsing the family.

`ButtonSize` spells its smallest step `tiny` ([Button.tsx:46](../../components/ui/Button/Button.tsx)) where `AvatarSize`, `BadgeSize`, `CounterSize`, and `TagSize` all spell it `xs`.

### The same modifier value is spelled two ways, split by component

211 distinct BEM modifiers ship across `components/ui/**/*.css`. **38 carry an axis prefix; 173 are bare.** The prefix is not the inconsistency — the inconsistency is that the same value exists both ways:

| Axis | Prefixed values | Of those, bare twins also ship |
|---|---|---|
| `tone-` | 6 | **5** (`error`, `information`, `neutral`, `success`, `warning`) |
| `gap-` | 7 | **6** |
| `padding-` | 4 | **3** |
| `align-` | 6 | 2 |
| `density-` | 2 | 1 |
| `variant-` | 3 | 0 |
| `preset-` | 10 | 0 |

The valence axis splits cleanly along component lines — `--tone-{value}` on Banner ([Banner.css:67-83](../../components/ui/Banner/Banner.css)), bare `--{value}` on Badge, Dot, Counter, TaskConsole, BlockQuote, ServiceTag. This is the mechanism behind the audit's recurring gotcha: `.bds-banner--error` returns empty because Banner spells it `.bds-banner--tone-error`, while `.bds-badge--error` is correct for Badge. A grep against one spelling is a false absence for half the library, and nothing today can see the two as one concept — [`slot-pattern-check.mjs`](../../scripts/slot-pattern-check.mjs) judges modifier *shape* only ("by *shape*, not by … enumeration", its header at `:6-8`), and `lint-blueprint-naming.mjs` owns a banned-suffix list, not an axis rule.

The six `tone-` values are worse than one axis spelled two ways — they are **two axes under one prefix**. Five are Banner's valence values; the sixth is [TextLink.css:52](../../components/ui/TextLink/TextLink.css)'s `--tone-neutral`, which is the hue-source axis. So `--tone-neutral` means "unremarkable valence" on one component and "the neutral palette" on another, at the same class shape.

`variant-` and `preset-` are the counter-example: 13 prefixed values, zero bare twins. Those two axes are already internally consistent, so a rule mandating the prefix costs nothing there.

## Decision

Six rules. Each closes a list; the default for any word not on a list is **reject**.

### 1. The valence axis has five words, and they are the token layer's words

```
negative · positive · warning · info · neutral
```

The prop layer migrates to the token layer's vocabulary, not the reverse. `error`, `success`, `danger`, `destructive`, `information`, and `progress` are retired as valence words.

**Rationale.** The direction is not a coin flip — `dist/tokens.css:1333-1334` already marks `--*-status-error`/`-success` as deprecated aliases *of* `--*-negative`/`-positive`. Choosing `error`/`success` would un-decide a shipped, half-propagated migration and require re-deprecating the canonical names in the opposite direction. Beyond that, a token name is a bare string in six consumer repos where no compiler can find every use, while a prop is type-checked at every call site — so when the two layers must converge, the layer the compiler can migrate is the one that moves.

`neutral` is a valence value, not the absence of one: it means "this is a status display and its status is unremarkable." A component with no valence to communicate takes no valence prop.

### 2. One word per axis, and each word names exactly one axis

| Axis | Word | Closed value list | Correct today | Migrates |
|---|---|---|---|---|
| Valence — what this communicates about a state | `tone` | § 1's five words | Field (`helperTone`); Banner's prop *name* | Badge, Counter, Dot, Meter, ProgressCircle (`status` → `tone`); Toast, Button (valence members leave `variant`; reversed for Button by § Amendments, #3275); Banner (`announcement` leaves the union) |
| Presence / lifecycle — the state of a named subject | `status` | per-subject, scoped-intent token-backed | Avatar, Card, Table, TaskConsole | — |
| Form — mutually exclusive visual or structural shape, no valence | `variant` | per-component | Card, TabBar, Skeleton, Sheet, ServiceTag, Testimonial, Footer, ToggleSwitch, ProgressStepper | — |
| Hue source — which palette paints it | `emphasis` | `neutral` · `brand` · `accent` · `inverse` · `on-color` | TextLink, SocialIcon, ContactIcon (`tone` → `emphasis` landed, #1925) | Banner, Badge, Counter (brand member extracted, below); Button (`inverse`, `on-color` left `variant` — #1983; reversed by § Amendments, #3275) — `inverse` added by § Amendments (#2279), `on-color` by § Amendments (#1983) |
| Fill treatment intensity | `appearance` | `solid` · `subtle` · `outline` (amended by #2943; Tag's `subtle`→`outline`, `muted`→`subtle`) | Badge, Tag, Avatar (`solid` · `subtle` only) | — |
| Spacing compression | `density` | `comfortable` · `compact` | Tag, Sheet | — |
| Accent hue — which named hue paints it | `color` | `neutral` · `blue` · `green` · `orange` · `purple` · `yellow` · `red` | Tag (`--color-{hue}`) | Avatar (`--accent-{hue}` → `--color-{hue}`, with #1927) — added by § Amendments (#2943) |
| Orientation — mutually-exclusive layout direction, no valence | `orientation` | `horizontal` · `vertical` | ButtonGroup, Divider, CardList | Stack, Form (`direction`/`layout` → `orientation`); Field (`layout` → `orientation`; `stacked`/`inline` → `vertical`/`horizontal`) — added by § Amendments (#2001) |

**`tone` takes valence, not `status`.** `status` is the word English already uses for the state of a subject — `online`, `pending` — and BDS already backs that reading with scoped-intent tokens — `--background-presence-{online,offline,busy,away}` ship today and match `AvatarStatus` member-for-member, in the `--{purpose}-{scope}-{scope-value}` form token-anatomy documents. Forcing `status` to mean valence would require renaming Avatar's and TaskConsole's correct props to free the word, and orphaning the presence token family from the prop it backs. `tone` is the narrower word and is already the prop name on the two components that use it for valence.

**A union carries one axis.** Badge's seven-member `status` cannot become a seven-member `tone`: `progress` is § 1's `info` under a third name, and `brand` belongs to `emphasis`. Splitting mixed unions is part of the migration, not an exception to it.

Three components leak a brand-hued member into their valence union, each under a different word — and all three resolve to a brand token, which is what identifies them:

| Component | Member | What it resolves to |
|---|---|---|
| Banner | `announcement` | `--surface-brand-primary` ([Banner.css:68](../../components/ui/Banner/Banner.css)) |
| Counter | `brand` | `--background-brand-primary` ([Counter.css:32](../../components/ui/Counter/Counter.css)) |
| Badge | `brand` | `--background-brand-primary` / `-secondary` ([Badge.css:137,176](../../components/ui/Badge/Badge.css)) |

All three become `emphasis="brand"`, orthogonal to `tone`. A Banner can then be an announcement *and* carry a valence, which the current union makes unexpressible.

**`in_progress` is out of grammar.** Every other prop value in the library is a single lowercase word or kebab-case ([`snake_case` sweep](../../components/ui/TaskConsole/TaskConsole.tsx): `in_progress` at `:14`, `:58`, `:184` is the only one in a prop union). Values are lowercase kebab-case: `in-progress`.

### 3. Step vocabulary follows Tier: numeric at Primitive, t-shirt at Semantic

```
Primitive step:  numeric        --font-size-100, --space-400, --border-radius-200
Semantic step:   t-shirt        --gap-md, --heading-xl, --border-radius-lg
Reset (either):  none           --border-radius-none
```

The t-shirt vocabulary is `3xs · 2xs · xs · sm · md · lg · xl · 2xl · 3xl`. A family uses the contiguous span it needs and no more. `tiny`, `huge`, `standard`, `thin`, `bold`, `normal`, `fast`, `slow`, `default`, `narrow`, `wide` are retired as step words.

**Retiring a step word is a positional rename, not a merge.** `tiny` and `huge` name real rungs below `xs` and above `xl`, at values their neighbours do not hold — so the new name is whichever `n`-prefixed rung the value already occupies in that family's ramp, measured per family. The vocabulary extends to `3xs`/`3xl` precisely so those rungs have legal names; collapsing them into `2xs`/`2xl` would be a silent value change wherever a family already ships a distinct `2xs` or `2xl` rung (`--icon-*` ships both).

**A slot carrying both numeric and t-shirt steps is not drift** — it is the Primitive and Semantic halves of one family sharing a property name, which is exactly what the two formulas in [token-anatomy § Non-color anatomy](../../docs-site/content/docs/foundation/token-anatomy.mdx) describe. `--border-radius-100` (Primitive) and `--border-radius-lg` (Semantic) are both correct. Drift is a **third** vocabulary in the same slot. Per-slot disposition of the nine the census flags:

| Slot | Third vocabulary | Disposition |
|---|---|---|
| `border-width` | `thin` · `standard` · `bold` (`:1480-1482`) | **Delete, don't rename.** `--border-width-standard` (2px, mode-invariant) duplicates `--border-width-md` (1px–3px by spacing mode, `:1043`/`:1051`) while silently freezing what the modes vary — so there is no t-shirt rung it can safely become. |
| `content-width` | `narrow` · `default` · `wide` + one t-shirt `xl` (`:1424-1428`) | **Retire the word ladder** → `sm` · `md` · `lg` · `xl`. `full` (`100%`) is not a step; it survives as a named exception. |
| `duration` | `fast` · `normal` · `slow` | **Retire** → the numeric Primitives `--duration-100` · `-200` · `-300`. *Amended 2026-11-24 ([#3281](https://github.com/brikdesigns/brik-bds/issues/3281)): duration has no Semantic tier, so the `sm` · `md` · `lg` target is withdrawn — see § Amendments, "Duration has no Semantic tier".* |
| `icon` | `tiny` (`:1306`) and `huge` (`:1312`) on a nine-rung ramp that already ships `2xs` and `2xl` | **Retire** → `tiny` becomes `3xs`, `huge` becomes `3xl`. Values unchanged. |
| `shadow` · `display` | word members are the Semantic elevation / type-ramp sets over numeric Primitive parts | **No change** — two tiers, one slot, per the rule above. `--shadow-overlay` is a named exception (a role, not a step). |
| `size` · `border-radius` | `pill` · `circle` | **Named exception.** Shape constants with no position on a linear scale; a numeric step cannot express them. |
| `aspect` | `square` · `cinema` · `photo-landscape` · `photo-portrait` over `16-9` ratios | **Named exception.** Semantic aliases of ratio Primitives — the ratio *is* the step form for this slot. |
| `iteration` | `infinite` | **Named exception.** A CSS keyword, not a step. |

Component `*Size` unions draw from the same t-shirt list: `ButtonSize`'s `tiny` retires to `xs`.

### 4. A BEM modifier always carries its axis prefix

```
bds-{block}--{axis}-{value}          bds-badge--tone-negative
bds-{block}__{slot}--{axis}-{value}  bds-field__helper--tone-negative
```

The 173 bare modifiers migrate; the 38 prefixed ones are already correct.

**Rationale.** The prefix is what makes the class **mechanically derivable** from the prop — `tone="negative"` → `--tone-negative`, with no component-specific knowledge. That derivability is the only thing that makes § 6's gate possible and the only thing that makes a grep sound. A bare modifier is not derivable in either direction: `--md` does not say whether it came from `gap` or `padding`, and Card exposes both. The 38-vs-173 count argues for the cheaper migration, but cheapness is not the property under repair — `.bds-banner--tone-error` versus `.bds-badge--error` is the defect, and only one of the two spellings can be reached by a rule.

This does not touch ADR-008 §3, which governs **blueprint** modifiers and bans appearance/theme words there (`--dark`, `--centered`). §3's structural-only rule stands unchanged for blueprint families; this rule governs the axis-prefix grammar of **component** modifiers, which §3 does not address.

**The service-line axis is a named exception** ([#1982](https://github.com/brikdesigns/brik-bds/issues/1982)). A bare `--{service-line}` modifier — `brand`, `marketing`, `information`, `product`, `back-office`, `service`, per `ServiceLine` in [`service-config.ts`](../../components/ui/ServiceTag/service-config.ts) — is legal on a block that emits it from a `ServiceLine`-typed value, and the gate does not report it. Two reasons, and the second is why this is an exception rather than a migration:

1. **Derivability, the property § 4 exists to protect, already holds.** `category="information"` → `--information` is mechanically derivable in both directions. The prefix buys nothing that is not already there.
2. **`information` collides with a retired valence word, and the gate's migration target was actively wrong.** § 1 retires `information` as a spelling of `info`, so rule 4 read `.bds-service-tag--information` as valence and printed `--tone-info`. Following it renames the selector while `ServiceTag.tsx` keeps emitting `bds-service-tag--information`, and every Information ServiceTag silently loses its fill — an unmatched selector is not an error. The rename was made and reverted while working [#1957](https://github.com/brikdesigns/brik-bds/issues/1957); the gate's own advice produced it.

The exception is scoped to the **block**, not the value. `.bds-card--brand` (now `bds-card--variant-brand`) was a § 4 finding: Card imports `ServiceLine` and derives `CardServiceLine` from it, but paints that class from an unrelated `variant`, and emits its actual service surface as the prefixed `bds-card--service-line-${serviceLine}` (§ Amendments, `service-line` axis). An import-level or directory-level carve-out would have exempted it and hidden real drift, so the gate requires the block to interpolate a `ServiceLine`-annotated identifier. Removing this exception means renaming the CSS and the TSX template together, in one commit.

### 5. `info` means the blue signal; the gray one is `neutral`. `--shadow-*` is the elevation family

Two names, each currently carrying two concepts, dispositioned:

**`info`.** `--{purpose}-status-info` (blue, `--color-system-blue`) is the valence value § 1 names `info`, and migrates to the intent form `--{purpose}-info`. The gray family that holds that name today (`--background-info` → `--color-system-neutral`, `:484`) is not a distinct concept from `neutral` — it is `neutral` under the wrong word — and folds into `--{purpose}-neutral`. Only `--background-neutral` exists in the intent form today, so the fold mints `--text-neutral`, `--border-neutral`, `--surface-neutral` rather than merging into existing names. `--text-link` stays categorically separate from both, as its comment at `:1348-1360` already says.

**`--box-shadow-*` retires; `--shadow-*` is canonical for elevation.** This dispositions #1910 AC #3. The family is a duplicate of `--shadow-{sm,md,lg,xl,overlay}` under a second name, and the duplication is what produced the type collision: Style Dictionary emits `--box-shadow-{sm,md,lg,xl}` as blur *lengths* (`:328-331`) and the gap-fill layer overrides four of them with full shadow *lists* (`:1407-1410`, all four marked `bds-lint-ignore`). Retiring the family removes the collision, the four ignores, and `--box-shadow-none` in one move. Reference counts are even — 13 `var(--box-shadow-*)` against 13 `var(--shadow-{sm,md,lg,xl,overlay})` in `components/ui/**/*.css` — but 7 of the 13 are `--box-shadow-none`, which resolves to `0px` and drops the declaration, so live elevation usage of the retiring family is 6. Elevation reset is `box-shadow: none` in CSS; no token is minted for it. The blur Primitives keep their correct slot, `--shadow-blur-*`.

The general rule this instantiates: **when one name carries two concepts, the concept with the correct Anatomy keeps the name and the other is renamed** — never disambiguated by adding a segment, which is what produced `--background-info` versus `--background-status-info` in the first place.

### 6. A new word requires an amendment to this ADR

A name that is not on a closed list above is rejected. Admitting a new one requires, in one PR:

1. **A negative answer to "does an existing word name this axis?"** — with the search that came back empty. Per #1910's method note, one grep is not an absence claim on this codebase: enumerate the concept's known synonyms first, then search for all of them.
2. **An amendment to this ADR** — an `## Amendments` entry naming the word, its axis, and its closed value list.
3. **The gate's list updated in the same commit**, so the word is enforceable the moment it is legal.

Retiring a word takes the same route in reverse: the amendment moves it to § Retired vocabulary and the gate starts rejecting it.

## Retired vocabulary

The explicit retired-synonym list. Every row is rejected in new work; the Migrates-to column is what the remediation issues implement.

### Valence words

| Retired | Migrates to | Where it ships today |
|---|---|---|
| `error` | `negative` | Badge, Banner, Counter, Dot, Meter, Toast, Field props; `--*-status-error` tokens; `--tone-error` / `--error` BEM |
| `success` | `positive` | Banner, Counter, Toast props; `--*-status-success` tokens; `--tone-success` / `--success` BEM |
| `danger` | `negative` | `ButtonVariant` — `danger`, `danger-outline`, `danger-ghost` |
| `destructive` | `negative` | `ButtonVariant` (alongside `danger`, in the same union) |
| `information` | `info` | `BannerTone`; `--tone-information` / `--information` BEM |
| `progress` | `info` | `BadgeStatus`, `CounterStatus` — [Counter.css:31](../../components/ui/Counter/Counter.css) maps it to `--background-status-info` |

### Axis words

| Retired for this axis | Migrates to | Where |
|---|---|---|
| `status` for valence | `tone` | Badge, Counter, Dot, Meter, ProgressCircle |
| `tone` for hue source | `emphasis` | TextLink, SocialIcon, ContactIcon |
| `variant` for valence members | `tone` (split from the form union) | Button, Toast |
| `grayscale` | `emphasis="neutral"` | `SocialIconTone`, `ContactIconTone` |
| `announcement` | `emphasis="brand"` | `BannerTone`, `--tone-announcement` |
| `brand` as a valence member | `emphasis="brand"` | `BadgeStatus`, `CounterStatus` |
| `direction` for orientation | `orientation` | Stack (`StackDirection`) — § Amendments (#2001) |
| `layout` for orientation | `orientation` | Field (`FieldLayout`), Form (`FormLayout`) — § Amendments (#2001) |
| `stacked` (orientation value) | `orientation="vertical"` | Field — § Amendments (#2001) |
| `inline` (orientation value) | `orientation="horizontal"` | Field — § Amendments (#2001) |

### Step words

> **SUPERSEDED for the Foundations token rows — see § Amendments, "`tiny` · `xxl` · `huge` are rungs, not retired step words" (2026-09-26, [#2594](https://github.com/brikdesigns/brik-bds/issues/2594)).** The five struck rows below reverted; `ButtonSize` and the three non-Foundations ladders stand.

Every mapping below is positional and measured; values do not change.

| Retired | Family | Migrates to | Measured basis |
|---|---|---|---|
| ~~`tiny`~~ | ~~`--gap-*`~~ | ~~`2xs`~~ | **Reverted #2594** — ❖ Brik Foundations names this rung `gap/tiny` |
| ~~`huge`~~ | ~~`--gap-*`~~ | ~~`2xl`~~ | **Reverted #2594** — ❖ Brik Foundations names this rung `gap/huge` |
| ~~`tiny`~~ | ~~`--icon-*`~~ | ~~`3xs`~~ | **Reverted #2594** — the "`2xs` already taken" basis was `tokens/gap-fills.css`, a repo gap-fill, not a Figma rung |
| ~~`huge`~~ | ~~`--icon-*`~~ | ~~`3xl`~~ | **Reverted #2594** — same basis |
| ~~`huge`~~ | ~~`--border-width-*`~~ | ~~`2xl`~~ | **Reverted #2594** — ❖ Brik Foundations names this rung `border-width/huge` |
| `tiny` | `ButtonSize` | `xs` | The smallest rung, which `AvatarSize` / `BadgeSize` / `CounterSize` / `TagSize` already call `xs`. **Stands** — a component size union is not a Foundations variable; Storybook is its source of truth, not Figma. |
| `thin` · `standard` · `bold` | `--border-width-*` | *deleted, not renamed* | `:1480-1482` — 1px/2px/3px duplicates of `sm`/`md`/`lg` that freeze what the spacing modes vary (`:1042-1052`) |
| `fast` · `normal` · `slow` | `--duration-*` | `100` · `200` · `300` | 100/200/300ms — the numeric Primitives. Was `sm` · `md` · `lg` until the 2026-11-24 amendment ([#3281](https://github.com/brikdesigns/brik-bds/issues/3281)) |
| `narrow` · `default` · `wide` | `--content-width-*` | `sm` · `md` · `lg` | 640/800/1024px (`:1424-1426`), with `xl` = 1280px already correct |

### Token families

| Retired | Migrates to | Notes |
|---|---|---|
| `--box-shadow-*` | `--shadow-{sm,md,lg,xl}` | § 5. Removes the `--box-shadow-md` type collision, four `bds-lint-ignore`s, and `--box-shadow-none` |
| `--{purpose}-status-{value}` | `--{purpose}-{value}` | Already self-documented as deprecated at `:1333-1334`; #1909 is the propagation. **Deleted in [#1958](https://github.com/brikdesigns/brik-bds/issues/1958)** — all 20 declarations gone, § Enforcement rule 6 now rejects a reference. Three targets are not "drop the segment": the `-subtle` names fold into `surface` (§ D — the purpose already means the tint), `status-neutral` resolved to `--surface-neutral` and not the saturated `--background-neutral`, and a retired valence word routes through § 1 |
| `--background-status-{purple,orange}` | `--background-accent-{purple,orange}` | #1958. These are hue-source names, and § 6 turned out to owe **no amendment**: the `accent-{hue}` scope is already documented ([color § Accent](../../docs-site/content/docs/foundation/color.mdx)) and already Figma-sourced to the same `--color-system-{purple,orange}` primitives, so the two names retired into an existing family rather than minting a word |
| `--{purpose}-info` (gray) | `--{purpose}-neutral` | § 5. Frees `info` for the blue signal |
| `--easing-ease-*` | `--ease-*` | Already dispositioned in [token-anatomy § Named exceptions](../../docs-site/content/docs/foundation/token-anatomy.mdx) |
| `--tooltip-*` | `--bds-tooltip-*` | Already dispositioned there; ADR-014 form |

### Named exceptions — not retired

`--size-pill` · `--size-circle` · `--border-radius-pill` · `--border-radius-circle` (shape constants) · `--aspect-{square,cinema,photo-landscape,photo-portrait}` (semantic ratio aliases) · `--iteration-infinite` (CSS keyword) · `--content-width-full` (not a step) · `--shadow-overlay` (a role, not a step) · `--duration-marquee` · `--duration-autoplay` (periodic-motion roles — a loop period and an auto-advance dwell, not points on the fast/normal/slow ramp; [#2044](https://github.com/brikdesigns/brik-bds/issues/2044); Figma `motion` collection since [#3338](https://github.com/brikdesigns/brik-bds/issues/3338)) · `--web` · `--tablet` · `--mobile` (slotless carve-out, per [#1912](https://github.com/brikdesigns/brik-bds/pull/1912)) · the bare **service-line** modifiers on service-line-emitting blocks (§ 4, [#1982](https://github.com/brikdesigns/brik-bds/issues/1982) — sourced from `ServiceLine`, never re-listed).

## Alternatives considered

**Make `error`/`success` canonical instead, following the prop-layer majority.** Rejected: it reverses a shipped deprecation. `dist/tokens.css:1333-1334` already aliases `--*-status-error` → `--*-negative` and asks consumers to migrate off it; choosing `error` would require deprecating `--*-negative` in the opposite direction and re-migrating the consumers that already moved. The majority is also an artifact of the same drift the ADR is closing, not evidence.

**Keep the prefix optional and mandate it only where a block exposes more than one modifier axis.** Rejected. It halves the migration (173 → roughly the multi-axis blocks) but destroys derivability, which is the property being bought: a consumer grepping for a class cannot know how many axes the block exposes without reading its props, and a gate that reads the props type to decide whether a prefix is required cannot be run against CSS alone.

**Retire the 38 prefixed modifiers instead of the 173 bare ones.** Rejected on the same ground — the cheaper migration by a factor of four, but it settles on the spelling that cannot be derived from a prop and cannot be found by a rule.

**Rule on valence only and leave axes 5 and 6 to later ADRs.** Rejected. #1909 renames component variants library-wide and is already blocked on this document; splitting the ADR means its rename lands before the BEM rule that governs the class those variants emit, so the same files get touched twice.

**Extend `appearance` to cover the hue-source axis rather than minting `emphasis`.** Rejected: `appearance` names fill treatment intensity (`solid`/`subtle`/`muted`) and hue source names which palette paints it. Folding them makes one more word carry two axes — the failure this ADR exists to stop.

## Consequences

- **#1909 is unblocked.** Its status-token cleanup now has a target vocabulary and, per § 4, a target class grammar, so it can rename tokens and modifiers in one pass instead of guessing at the second.
- **The migration is large and is not this ADR.** Deliverable 5 of #1910 files it, sized, one issue per axis, sequenced behind this document: valence prop unions (7 components + the Button/Toast union splits), extracting the brand-hued members into `emphasis` (Banner `announcement`, Badge + Counter `brand`), the `tone`→`emphasis` rename (3 components), the step-word retirements (5 token families + `ButtonSize`), the `--box-shadow-*` retirement (§ 5), the `info`/`neutral` fold (§ 5, mints 3 tokens), and the 173 bare BEM modifiers.
- **Every rename in the list is a breaking change for consumers.** Six repos consume `@brikdesigns/bds`. Each remediation issue ships the deprecation alias alongside the new name, per the pattern already in `dist/tokens.css:1333`, and the alias removal is a separate later issue — not folded into the rename.
- **Component props are typed, so the compiler finds every prop use; token names are strings, so it finds none.** The token half of the migration needs the gate in § Enforcement to be sound, not a grep.
- **[ADR-024](./ADR-024-layout-rhythm-map.md)'s lint rule 2 names a retiring token.** It bans mode-collapsing `--gap-xs` / `--gap-tiny` on vertical props, and § 3 renames `--gap-tiny` to `--gap-tiny`. `lint-content-rhythm` must be updated in the same PR as the rename, or the ban silently stops matching — both tokens collapse to `0px` in the compact spacing mode (`:1096-1098`), which is the behaviour ADR-024 exists to prevent.
- **`--display-{modifier}-{step}`** (`--display-fluid-lg`, `:1666-1669`) shows a slot-internal modifier the non-color Anatomy does not yet document. Not drift under any rule here; noted so the next Anatomy edit covers it.

## Enforcement

This ADR is the spec for #1910 AC #5's gate, which shipped as [`lint-naming-canon`](../../scripts/lint-naming-canon.mjs) ([#1936](https://github.com/brikdesigns/brik-bds/issues/1936)) and is the condition of this ADR's **Accepted** status. `npm run lint-naming-canon`, wired to [`naming-canon-check.yml`](../../.github/workflows/naming-canon-check.yml) on every PR to `main`. The gate must reject, and is demonstrated failing on a planted violation of each ([`lint-naming-canon.test.mjs`](../../scripts/__tests__/lint-naming-canon.test.mjs)):

1. A token name whose step falls outside its Tier's vocabulary in § 3, and is not a § Named exception.
2. A token name defined twice with different value *types* (the `--box-shadow-md` class) — distinct from the existing `lint-token-shadowing`, which allows a marked override.
3. A prop union mixing axes from § 2's table, or containing a § Retired valence word — or, for a **name-identified axis** (the orientation axis, § Amendments), a union whose type name carries a retired axis word (`StackDirection`, `FormLayout`) or a retired axis value (`FieldLayout`'s `stacked`/`inline`). The name path is value-corroborated — every member must belong to the axis vocabulary — so a homonym like `SortDirection = 'asc' | 'desc' | 'none'` is not a finding.
4. A BEM modifier without its axis prefix (§ 4), or carrying a retired word — except a bare service-line modifier on a block that emits from a `ServiceLine`-typed value (§ 4's named exception). The value list is read from `ServiceLine` at scan time; a rename of that type is a scan failure, not a silently-lifted carve-out.
5. Any word not on a closed list here — the § 6 default.
6. A reference to a token in the `--*-status-*` family, which § Token families retires and [#1958](https://github.com/brikdesigns/brik-bds/issues/1958) deleted.

Rules 1–5 judge a name where it is *declared*, which is the right unit for a word that is merely wrong and the wrong unit for a word that is **gone**: an unresolvable custom property is not a CSS error, so a `var()` pointing at a deleted token renders transparent and ships. Rule 6 therefore reads the consumption side, and matches two shapes — `var(--*-status-*)`, and the `cssVar: '--*-status-*'` data form the docs-site `ColorGrid` wraps in `var()` at render time. Prose naming the retired family stays legal, or this ADR could not describe it. Its migration targets are transcribed from the deleted declarations rather than derived, because dropping the `status-` segment yields `--background-error` — not a token, and § 1's retirement is what makes the answer `--background-negative`.

Rules 1 and 2 read `dist/tokens.css`; rules 3 and 4 read `components/ui/**/*.{tsx,css}`; rule 6 reads `components/`, `content-system/`, `docs-site/`, `stories/`, `tokens/`, `.storybook/`, and hard-fails on a listed directory that does not exist so the coverage list cannot rot into a silently-empty scan. Existing gates the new one must not duplicate: [`lint-token-purpose-slots`](../../scripts/lint-token-purpose-slots.mjs) (does the *slot* ship documented — structure, not vocabulary), `lint-token-shadowing` (double definition, type-blind), [`slot-pattern-check.mjs`](../../scripts/slot-pattern-check.mjs) (modifier *shape*), `lint-component-props` (docs match source), `lint-mdx-tokens` (phantom names in docs).

### The baseline

Every rule was red on `main` when the gate landed — 22 step words, 6 type collisions, 17 mixed-or-retired unions, 197 bare-or-retired modifiers, 4 default-deny words. A gate that fails `main` on merge is not shippable, so all 246 are listed in [`tokens/naming-canon-baseline.json`](../../tokens/naming-canon-baseline.json), each keyed to the remediation issue that burns it down:

| Rule | Baselined | Owned by |
|---|---|---|
| 1 — step vocabulary | 22 | #1923 |
| 2 — type collision | 6 | #1924 (`--box-shadow-*` ×4) · #1910 (`--easing-ease-*` ×2) |
| 3 — union axis | 17 | #1909 (valence ×11) · #1925 (hue source ×6) |
| 4 — BEM modifier | 197 | #1927 (×171) · #1909 (valence ×17) · #1926 (the nine twins) |
| 4 — five rows retired, not fixed | −5 | #1982 shipped § 4's service-line exception, so `--information` (#1982) and `--marketing` / `--product` / `--back-office` / `--service` (#1927) stopped violating and left the baseline. `--brand` stays: it is still bare on five non-service blocks |
| 5 — default-deny | 4 | #1925 |

**The baseline is a countdown, not a carve-out.** A stale entry — one that no longer violates — is itself a failure, so an entry cannot outlive its fix and the file can only shrink. Adding a row to keep a *new* violation green is the one edit that defeats the gate. `npm run lint-naming-canon:census` prints the remaining count per rule.

Two limits are worth naming, because a gate whose blind spots are undocumented gets trusted past them:

- **Rule 1 does not read colour tokens.** A colour token's tail is a role, not a step (`--color-blue-light`, `--background-brand-primary`), and § 3's numeric/t-shirt vocabulary cannot express either. The colour ramps' two step vocabularies are dispositioned by § Amendments, "Colour ramps take numeric steps only" ([#1949](https://github.com/brikdesigns/brik-bds/issues/1949)), and judged by rule 7 rather than rule 1.
- **Rule 4 reads CSS only.** A modifier built from a runtime value (`` `bds-badge--${tone}` ``) has no static spelling to judge — the same blind spot [`slot-pattern-check.mjs`](../../scripts/slot-pattern-check.mjs) documents at `:38-42`.

## Amendments

New words admitted or retired after acceptance, per § 6. Each entry names the word, its axis, its closed value list, and the negative search that admitted it.

### Orientation axis (2026-08-23, [#2001](https://github.com/brikdesigns/brik-bds/issues/2001))

**Does an existing § 2 word name this axis?** No. The concept's synonyms across the five known components were `orientation` (ButtonGroup, Divider, CardList), `direction` (Stack), and `layout` (Field) — plus `layout` again on Form, a sixth component the umbrella's first repro missed — and none of § 2's six words (`tone`, `status`, `variant`, `emphasis`, `appearance`, `density`) names a layout direction. `orientation` is the majority prop spelling (4 of 6) and the token layer holds no competing word.

- **Axis:** orientation — a mutually-exclusive layout direction, carrying no valence.
- **Word:** `orientation`. **Closed values:** `horizontal` · `vertical`.
- **Retired for this axis:** prop names `direction` (Stack) and `layout` (Field, Form); values `stacked` → `vertical`, `inline` → `horizontal` (Field).
- **Correct today:** ButtonGroup, Divider, CardList.

**Enforcement.** This is the first **name-identified** axis: `StackDirection` / `FormLayout` carry canonical *values* (`horizontal`/`vertical`) under a retired prop *name*, so the value-based rule-3 path cannot see them — the retirement lives in the type name. And `inline` cannot be retired library-wide the way a valence word is, because `SheetEditTarget = 'inline' | 'page'` uses it for an unrelated axis; the retirement is therefore scoped to unions the orientation axis actually names, value-corroborated so `SortDirection = 'asc' | 'desc' | 'none'` is left alone. `lint-naming-canon` gained `AXES.orientation`, `NAME_IDENTIFIED_AXES`, and `nameIdentifiedAxisFindings()` in this PR (§ Enforcement rule 3), with a planted violation per the § Enforcement bar.

**Baseline.** The four live violations at amendment time — `StackDirection#name` (#2004), `FormLayout#name` (#2008), `FieldLayout#name` + `FieldLayout#values` (#2005) — are baselined against their rename issues. The bare `--vertical`/`--horizontal`/`--stacked`/`--inline` BEM modifiers were already baselined under #1927; their `--orientation-` prefix migration is [#2007](https://github.com/brikdesigns/brik-bds/issues/2007). The countdown is complete when all four rename PRs land.

### `inverse` admitted to the emphasis axis (2026-09-04, [#2279](https://github.com/brikdesigns/brik-bds/issues/2279))

**Does an existing § 2 word name this axis?** The axis is already named — `emphasis`, § 2. The open question was whether an existing *value* on it, or a synonym elsewhere in the library, already names a near-black inverted palette. It does not. Searched as union members across `components/ui/**/*.tsx` (stories excluded) at `1e8dacbf`: `invert`, `inverted`, `dark`, `black`, `ink`, `onyx`, `night`, `charcoal`, `contrast`, `reverse`, `knockout` — **zero hits each**. `inverse` returned two, and both are BDS's own: `ButtonVariant` ([Button.tsx:40](../../components/ui/Button/Button.tsx)) and `FooterVariant` ([Footer.tsx:106](../../components/ui/Footer/Footer.tsx)). The word is the incumbent with no competitor; what it lacked was an axis.

- **Axis:** emphasis — which palette paints it (unchanged; this admits a fourth value).
- **Word:** `inverse`. **Closed values now:** `neutral` · `brand` · `accent` · `inverse`.
- **Correct today:** none — `inverse` sits on `variant` at both existing sites, which is the § 2 mixing #1983 owns.
- **Migrates:** Button (`inverse` leaves `variant` — #1983); SocialIcon gains it (#2274).

**`inverse` is a hue source, not a form.** Every existing use swaps the palette and leaves the shape alone: `.bds-button--inverse` sets `--background-inverse` + `--text-inverse` on the same solid form as `primary` ([Button.css:110-113](../../components/ui/Button/Button.css)), and `.bds-footer--inverse` sets `--surface-inverse` with `--text-on-color-dark` throughout ([Footer.css:57-58,258-265](../../components/ui/Footer/Footer.css)). Contrast the genuine forms on the same union — `outline` and `ghost` change fill and border, not hue. This is why the word belongs on `emphasis` and not on `variant`, and why #1983's body, which lists `inverse` and `on-color` among its six "form" values, understates the split: `ButtonVariant` carries **three** axes, not two.

**`on-color` is the same axis and is deliberately NOT admitted here.** `.bds-button--on-color` sets `--background-on-color-dark` ([Button.css:115-116](../../components/ui/Button/Button.css)) — a hue source by the identical test. But no caller needs it on `emphasis` today, and admitting a word with no consumer is exactly the drift § 6's default-deny exists to stop. #1983 dispositions it when it splits the union.

**Enforcement.** `lint-naming-canon`'s `AXES.emphasis.values` gains `inverse` in this PR, per § 6 step 3, with a planted violation per the § Enforcement bar. No new rule or mechanism — rule 5 already policed this axis; it was denying a word that had no home.

**Baseline.** Admitting the word surfaces exactly one live violation, on code this PR does not touch: `ButtonVariant#mixed` — `mixes 2 axes (emphasis + tone)`, [Button.tsx:35](../../components/ui/Button/Button.tsx). That mixing ships on `main` today and is invisible only because `variant` is an open list, so nothing claimed a second axis for the intersection to be empty against; #1983's own repro says so. It is baselined against [#1983](https://github.com/brikdesigns/brik-bds/issues/1983), the filed and sized remediation, on the same countdown basis as the orientation entry above. The baseline's "can only shrink" rule is not bent here: the row keys a **pre-existing** violation to its owner, which is what the file is for — it is a row added for a *new* violation that defeats the gate.

### `layout` axis (2026-09-11, [#2459](https://github.com/brikdesigns/brik-bds/issues/2459))

**Does an existing § 2 word name this axis?** No. This is the axis a Container carries when the SAME slot set is arranged more than one way — Card's `stack` / `row` / `metric` / `control` (ADR-038, which flattened the `preset` discriminated union into it). None of § 2's words fit: it is not a valence (`tone`), a lifecycle (`status`), a form (`variant` — the surface fill is a *separate* Card axis), a hue source (`emphasis`), a fill treatment (`appearance`), or a spacing compression (`density`). `preset` was the incumbent BEM axis prefix but is a meta-word for "a bundled configuration", not the concept itself; #2459 removes it.

- **Axis:** layout — which arrangement of one shared slot set a Container renders.
- **Word:** `layout`. **Values:** per-subject / open (`values: null`), like `variant` and `status` — the arrangement set is Container-specific (Card's four are not a library-wide closed list), and compound sub-modifiers (`--layout-stack-inset`, `--layout-row-wide`, `--layout-control-action-center`) are legal members that a flat closed list could not express.
- **Correct today:** Card (`bds-card--layout-{stack,row,metric,control}`).

**Coexistence with the orientation retirement.** § Amendments (#2001) retires the prop *name* `layout` **for the orientation axis** (`FieldLayout`, `FormLayout` — unions whose values are `horizontal`/`vertical`). That retirement is value-corroborated (§ Enforcement rule 3): it fires only when the union's members are the orientation vocabulary. `CardLayout = 'stack' | 'row' | 'metric' | 'control'` shares none of those values, so the two never collide — `layout` names DIRECTION when the values are h/v, and ARRANGEMENT otherwise. The word is one concept per *value set*, which is what the ADR governs.

**Enforcement.** `lint-naming-canon` gains `AXES.layout` (`values: null`) in this PR, which flows into `MODIFIER_AXES` via `Object.keys(AXES)`; the ten bare `bds-card--{stack,row,metric,control}*` modifiers #2459 introduced then carry a blessed prefix. No new rule or mechanism. **Baseline:** none — the amendment lands with the code that needs it, so there is no pre-existing live violation to key.

### `tiny` · `xxl` · `huge` are rungs, not retired step words (2026-09-26, [#2594](https://github.com/brikdesigns/brik-bds/issues/2594))

**Does an existing § 3 word name these rungs?** For the Foundations families, no — and that is the defect. § 3 retired `tiny`/`xxl`/`huge` and [#2229](https://github.com/brikdesigns/brik-bds/issues/2229) (`20c5d83f`) renamed 13 variables to `2xs`/`xs`/`2xl`/`3xs`/`3xl` in the repo. The paired write to ❖ Brik Foundations was split to [#2227](https://github.com/brikdesigns/brik-bds/issues/2227) and never landed, so for 26 days the repo and the design source named the same variables differently, and this gate enforced the side that had no source behind it.

**Negative search** (live pull of ❖ Brik Foundations `Rkdc3SIWJUdgoAkeadgZZe`, 381 variables, 2026-09-26, diffed against `design-tokens/foundations.json`): **no Foundations family ships a numeric rung.** The ladders are

| Family | ❖ Brik Foundations rungs |
|---|---|
| `gap` · `padding` | `none · tiny · xs · sm · md · lg · xl · huge` |
| `body` · `icon` | `tiny · xs · sm · md · lg · xl · huge` |
| `heading` | `tiny · sm · md · lg · xl · xxl · huge` |
| `label` | `tiny · xs · sm · md · lg · xl` |
| `border-width` | `none · sm · md · lg · xl · huge` |

> **Extended 2026-11-06 ([#1285](https://github.com/brikdesigns/brik-bds/issues/1285)):** `padding` now runs `none · 3nano · 2nano · nano · tiny · xs · …`. The three `nano` rungs are fixed and padding-only. See § Amendments, "`nano`".

**The measured basis for two rows was a repo artifact, not a design rung.** § 3 sent `icon/tiny` to `3xs` and `icon/huge` to `3xl` because "`2xs` is already taken by a distinct 12px rung". That 12px rung is `--icon-2xs` in [`tokens/gap-fills.css`](../../tokens/gap-fills.css) — a hand-authored gap-fill with no Figma variable behind it ("not yet in Figma; see #758"). The ADR read the repo's own fill-ins as evidence about the ladder and renamed the Figma-backed rungs around them.

- **Rungs:** `tiny` (below `3xs`) and `huge` (above `3xl`) join the t-shirt set; `xxl` sits between `2xl` and `3xl`. Full order: `tiny · 3xs · 2xs · xs · sm · md · lg · xl · 2xl · xxl · 3xl · huge`. `--padding-*` alone extends below `tiny` with `3nano · 2nano · nano` (#1285).
- **Scope:** Foundations *tokens* only. `ButtonSize`'s `tiny → xs` stands — a component size union is governed by Storybook and the coded component, not by a Figma variable. The `duration` and `content-width` word ladders and the deleted `--border-width-{thin,standard,bold}` also stand: none is Figma-backed, so "Figma is the source" does not reach them.
- **Values:** unchanged in every mode. The revert is positional, exactly as the rename was.

**Enforcement.** `lint-naming-canon` drops `tiny`/`huge`/`xxl` from `RETIRED_STEPS` and adds all three to `T_SHIRT` in this PR; the 13 rule-1 rows keyed to #2226 leave `tokens/naming-canon-baseline.json` in the same change, because a name that no longer violates would fail the gate as a stale entry. **Baseline:** net −13. No new rule, script, or workflow.

**Standing rule this leaves behind.** A step word is retired only when the ❖ Brik Foundations ladder that owns it has stopped using it. A repo-side rename of a Figma-backed variable is not complete until the Figma write lands — see the assessment in [`docs/reports/2026-09-26-foundations-disconnect-assessment.html`](../reports/2026-09-26-foundations-disconnect-assessment.html) for why nothing caught this (every "Figma" gate reads the repo mirror).

### `span` axis (2026-11-01, [#2930](https://github.com/brikdesigns/brik-bds/issues/2930))

**Does an existing § 2 word name this axis?** No. The axis is a grid child's extent along its parent grid's tracks — `Field` needs to run the full row of a `FieldGrid` whose column count now changes per container width. None of § 2's six words fits: it is not a valence (`tone`), a lifecycle (`status`), a form (`variant`), a hue source (`emphasis`), a fill treatment (`appearance`), or a spacing compression (`density`). Searched `components/ui/**` (`.tsx` + `.css`, stories and tests excluded, `Field`/`FieldGrid` themselves excluded) and the gate's lists (`scripts/lint-naming-canon.mjs`, `tokens/naming-grammar.json`) for the synonyms `span`, `colspan`, `col-span`, `column-span`, `full-width`, `fullWidth`, `wide`, `stretch`, `grid-column`:

- **No competing prop, type or modifier for grid-cell extent.** `span` as a prop, type key or `--span-*` class: **zero hits**. The *value* `'full'` is the one overlap, on `PageHeaderVariant` and `ModalSize` (see Enforcement); both are other axes' words. `col-span` / `column-span`: zero. The only `colSpan` is `TableSubheaderProps.colSpan` ([Table.tsx:257,278,285](../../components/ui/Table/Table.tsx)), a numeric pass-through of the native `<td colSpan>` attribute for a table row — the HTML name on a different element, not a grid-child axis, and it stays. `grid-column` appears only as per-component placement (`AppShell`, `DataSection`), never as a prop.
- **`fullWidth` / `--full-width` is a different concept, not a synonym.** It is a boolean on 11 form and button components (`Button`, `ButtonGroup`, `TextInput`, `Select`, `SegmentedControl`, …) that sets the component's own inline size to its container (`width: 100%` in normal flow). It says nothing about which grid tracks a child occupies: inside a three-column `FieldGrid`, `width: 100%` fills one cell, while `grid-column: 1 / -1` fills the row. The two answer different questions and can be set independently, so `span` is not a retirement target for `fullWidth` and `fullWidth` is not retired by `span`.
- **`wide` and `stretch` name other things.** `wide` is a rung or width preset (`Card` image width, `Footer` `constrain`, `Frame` ratio, `letter-spacing-wide`); `stretch` is the CSS `align-items` keyword (`Stack` `align`) or prose.

- **Axis:** span — how many of its parent grid's tracks a grid child occupies; mutually exclusive, no valence.
- **Word:** `span`. **Closed values:** `full`.
- **Correct today:** `Field` (`span="full"` → `bds-field--span-full`, `grid-column: 1 / -1`).

**`full` is the only value, deliberately.** `1 / -1` is the one extent that stays correct as `FieldGrid`'s column count steps 4 → 3 → 2 with the container. A numeric extent (`span={2}`) would break at the width where the grid has fewer tracks than the span asks for, so it is not admitted; a caller that needs one files a § 6 amendment with that story.

**Enforcement.** `tokens/naming-grammar.json` `axes.span` (`values: ["full"]`) gains the axis in this PR, which `lint-naming-canon` reads into `AXES` and from there into `MODIFIER_AXES` — so `bds-field--span-full` carries a blessed prefix and the prop-to-class derivation (`span="full"` → `--span-full`) holds, which is § 4's reason for the axis prefix. One mechanism change, forced by the negative search: `full` is not unique to this axis — it is also a form value on `PageHeaderVariant` (`'full' | 'compact' | 'tabs-only'`, [PageHeader.tsx:42](../../components/ui/PageHeader/PageHeader.tsx)) and a rung on `ModalSize` ([Modal.tsx:8](../../components/ui/Modal/Modal.tsx)). Rule 3 claims a union's members by value, so with `full` claimed it read `PageHeaderVariant` as `density + span` and failed code this amendment does not touch. `span` is therefore judged by its prefix and type name only — `axesOf()` skips it (`SPAN_AXIS` in the gate) — while rule 5 still default-denies any other `--span-*` / `*Span` member. Planted cases in `scripts/__tests__/lint-naming-canon.test.mjs` admit the modifier and the union, keep a `PageHeaderVariant`-shaped union clean, and still deny a bare `--full` and a neighbouring value (`half`). **Baseline:** none — the amendment lands with the code that needs it, and the `PageHeaderVariant` collision is fixed in the gate rather than baselined.

### `color` axis, and `outline` replaces `muted` on `appearance` (2026-11-03, [#2943](https://github.com/brikdesigns/brik-bds/issues/2943))

**Does an existing § 2 word name this axis?** No. Tag gains the accent hues Avatar already takes, so the indicator family needs a word for *which named hue* paints one. `emphasis` names which *palette* (`neutral` · `brand` · `accent` · `inverse`), one level up: a blue Tag and a green Tag are both `accent` emphasis, and § "Alternatives considered" already refuses to let one word carry two axes. `appearance` is fill treatment, and the same section rejects folding hue into it. Searched `components/ui/**` (`.tsx`, stories and tests excluded) for a `color` prop and for unions carrying the hue words:

- **`color` is the only prop spelling.** `AvatarColor` ([Avatar.tsx:7](../../components/ui/Avatar/Avatar.tsx)) and `TagColor` ([Tag.tsx:36](../../components/ui/Tag/Tag.tsx)) are the only `*Color` unions, and `color?:` appears as a prop only on Avatar and Tag (every other `color:` hit is an inline style object in `DevFeedbackWidget`). No `--color-*` BEM modifier existed before this PR.
- **`--accent-{hue}` is the incumbent modifier, not a rival word.** Avatar derives `bds-avatar--accent-{hue}` from its `color` prop. That breaks § 4's prop-to-class derivation and is already baselined under #1927, which renames it to `--color-{hue}`. Tag takes the canonical spelling now rather than adding a second `--accent-*` family.

- **Axis:** color — which accent hue paints an indicator; mutually exclusive, no valence.
- **Word:** `color`. **Closed values:** `neutral` · `blue` · `green` · `orange` · `purple` · `yellow` · `red`.
- **Correct today:** `Tag` (`color="blue"` → `bds-tag--color-blue`).

**`appearance`: `outline` in, `muted` out.** The same issue gives Badge, Tag and Avatar one fill vocabulary: `solid` (saturated fill), `subtle` (pale `-light` fill) and `outline` (transparent fill, border only). Tag's old `subtle` was a border-only treatment and its old `muted` was a pale fill, so the words move to match Badge: Tag `subtle` → `outline`, `muted` → `subtle`. After the change no `*Appearance` union carries `muted`, so it leaves the closed list rather than staying as an unused value.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.color` and swaps `muted` for `outline` in `axes.appearance`. `lint-naming-canon` reads `axes.color` into `AXES` and from there into `MODIFIER_AXES`, so `--color-{hue}` carries a blessed prefix and rule 5 still default-denies any other hue. `neutral` is now legal on both `emphasis` and `color`, but rule 3 judges a union by the intersection of its members' axes, and `TagColor`'s intersection is `{color}`, so no union reads as mixed. **Baseline:** −1. The `--muted` rule-4 row keyed to #1927 leaves `tokens/naming-canon-baseline.json`, because Tag was its last user and an entry that no longer violates fails the gate. No new rule, script or workflow.

### Colour ramps take numeric steps only (2026-11-03, [#1949](https://github.com/brikdesigns/brik-bds/issues/1949))

**What was open.** § 3 closed the step vocabulary for scale families and left the colour ramps out. Nine hues shipped an 11-rung numeric ramp (`50`–`950`) beside a six-rung word ramp (`lightest` · `lighter` · `light` · `dark` · `darker` · `darkest`) under one family name, and § Enforcement named the gap.

**Disposition: retire the word ramp; numeric is the only colour Primitive step.** This entry records a decision already made, not a new one. [ADR-043](ADR-043-system-id-token-prefix.md) § 4 retires the word steps "from every tier and every system" and states that it dispositions #1949. The operator ratified ADR-043 as written on 2026-10-01; its quote B ties the numeric steps to the brik-llm colour rail. The reference counts behind the issue's first criterion were measured on 2026-09-09, per consumer, in the [#1949 disposition comment](https://github.com/brikdesigns/brik-bds/issues/1949).

- **Family:** colour Primitive, `--bds-color-{family}-{step}`.
- **Closed steps:** `50` · `100` · `200` · `300` · `400` · `500` · `600` · `700` · `800` · `900` · `950`, plus the named endpoints `grayscale-black` and `grayscale-white` (`tokens/naming-grammar.json` `tiers.primitive.color.namedSteps`).
- **Retired:** `lightest` · `lighter` · `light` · `dark` · `darker` · `darkest` · `base` as colour steps (`retiredWordSteps`).
- **Not a named exception.** The word ramp does not enter `steps.namedExceptions`. The earlier "a colour tail is a role" reading still keeps rule 1 off colour tokens, but the colour Primitive is now a scale family with its own rule.

**The old names resolved through the bridge, not the canon; the bridge was removed in the release after 0.224.0 ([#2711](https://github.com/brikdesigns/brik-bds/issues/2711)), so they no longer resolve.** Canonical output carries zero word-step colour names: `grep -oE -- '--bds-color-[a-z]+-(lightest|lighter|light|dark|darker|darkest|base):' dist/tokens.css` returns nothing. The 54 legacy names (nine hues × six) lived only in the generated prefix bridge (`tokens/compat/prefix-bridge.css`, since deleted), each aliasing the numeric stop it always pointed at (`--color-blue-lightest: var(--bds-color-blue-100)`). That kept the operator's 2026-09-09 direction to avoid deleting the aliases until the numeric transition proved out. [#2711](https://github.com/brikdesigns/brik-bds/issues/2711) retired the whole bridge.

**Enforcement.** Rule 7 (`colorBodyFindings()` in `lint-naming-canon`) parses every colour Primitive as `color-{family}-{step}` against the grammar file and fails a retired word step with its numeric target. `scripts/__tests__/lint-naming-canon.test.mjs` plants a `--bds-color-blue-light` case that fails as rule 7, never as rule 1. No new rule, script or workflow. **Baseline:** none. Rule 7 has no live colour finding on `main`, and the bridge is outside what the gate reads.

### `ratio` axis (2026-11-05, [#2037](https://github.com/brikdesigns/brik-bds/issues/2037))

**Does an existing § 2 word name this axis?** No. The axis is a proportion: Frame's aspect ratio, and Split's column split between its two regions. None of § 2's words fit. It is not a valence, a lifecycle, a form, a hue source, a fill treatment, a spacing compression, a direction (`orientation`), an arrangement of slots (`layout`) or a grid-cell extent (`span`). Synonyms searched as props and union type names across `components/ui/**/*.tsx` (stories excluded) at this PR's base: `proportion`, `aspect`, `fraction`, `split`, `cols`, `widths` returned **zero hits each**. `weight` returned only `IconWeight` ([Icon.tsx:51](../../components/ui/Icon/Icon.tsx)), a stroke weight, not a proportion. `columns` returned Grid, FieldGrid, Footer, Table and AddableFieldRowList, and each is a column *count*, a list of column definitions, or (AddableFieldRowList) a free-form CSS track template. None is a closed proportion value. `ratio` returned Frame ([Frame.tsx:68](../../components/ui/Frame/Frame.tsx)), Image ([Image.tsx:20](../../components/ui/Image/Image.tsx)) and Split. The word is the incumbent with no competitor; what it lacked was an axis.

- **Axis:** ratio — a fixed proportion a component holds.
- **Word:** `ratio`. **Values:** per-subject (`values: null`), like `layout`. Frame's values are aspect slugs (`4-3`, `square`, `cinema` …) and Split's are column splits (`50-50`, `60-40`, `40-60`). They share a word and a shape, but no library-wide closed list covers both.
- **Correct today:** Frame (`bds-frame--ratio-{slug}`, from its `ratio` prop) and Split (`bds-split--ratio-{split}`).

**Enforcement.** `tokens/naming-grammar.json` gains `axes.ratio` (`values: null`) in this PR. `lint-naming-canon` reads it into `AXES` and from there into `MODIFIER_AXES`, so `--ratio-*` carries a blessed prefix and the prop-to-class derivation holds. No new rule or mechanism. `scripts/__tests__/lint-naming-canon.test.mjs` plants an admitted `--ratio-60-40` and a still-denied bare `--60-40`. **Baseline:** −17. The `--ratio-*` rule-4 rows keyed to #1927 (Frame's slugs) leave `tokens/naming-canon-baseline.json`, because they no longer violate and a stale entry fails the gate.

### `nano` — three fixed `padding` rungs below `tiny` (2026-11-06, [#1285](https://github.com/brikdesigns/brik-bds/issues/1285))

**Does an existing § 3 word name these rungs?** No. The portal pads dense table cells, badges and pills at 2 / 4 / 6px, and only `--gap-*` holds those values, so ~33 sites break the gap/padding family rule on a `bds-lint-ignore`. `--padding-tiny` is 8px at default density, and `tiny` is the bottom of the order this ADR fixes (`tiny · 3xs · 2xs · xs · …`, #2594 above). No word on the closed list sits below it. Synonyms searched across `tokens/*.css`, `design-tokens/foundations.json`, `components/**`, `content-system/**` and the gate's lists:

- `3xs` / `2xs` rank **above** `tiny` in the fixed order, so using them for 2–6px would make the names lie about their position. `--bds-padding-2xs` is also already taken: it is the deprecated alias of `tiny` at 8px (`tokens/gap-fills.css:504`).
- A `4xs` rung would have no defined place against `tiny`, which already sits below `3xs`.
- `micro` already means something else. [spacing § The two exceptions](../../docs-site/content/docs/foundation/spacing.mdx) and `scripts/lint-tokens.js`'s grid carve-out use it for the `0`/`1px`/`2px` values below the 4pt grid, not a 6px rung.
- `compact` and `dense` are the density axis (§ 2, `[data-mode-spacing="compact"]`). `hairline` is a known invented name from the #512/#553 rollback.
- `nano`, `mini`, `xxs`: zero hits as a token step, prop value or union member. The only `nano` in the repo is the `nanoid` dependency (`docs-site/package.json`).

**Decision.** The operator chose one new step word, scoped to `padding`, at 2 / 4 / 6px and fixed in every spacing mode (2026-11-06, relayed in chat). AGENT DECIDED (revisable): the word is `nano`, and it uses the n-prefix grammar `xs` already uses (`xs` → `2xs` → `3xs`, smaller as the number grows). That gives three rungs from one word. Evidence: the negative search above. Revert: drop `steps.familySteps` and the three variables.

- **Family:** `--padding-*` only. **Closed steps, low to high:** `3nano` (`{space.50}`, 2px) · `2nano` (`{space.100}`, 4px) · `nano` (`{space.150}`, 6px). They sit below `tiny`.
- **Mode-invariant.** All four `spacing/*` modes carry the same alias, so `tokens/modes-spacing.css` emits no override for them. They sit outside the seven-rung `spacing-mode-track` check (`SPACING_RUNGS` in `lint-tokens.js`), which keeps checking the density rungs. In `compact`, `--padding-tiny` drops to 2px, below `--padding-nano`. That is accepted: the operator chose fixed values over mode-tracking.
- **Not for `gap`.** `--gap-tiny` / `-xs` / `-sm` already hold 2 / 4 / 6px. A `nano` rung there would be a second name for an existing rung.

**Standing rule (#2594) applies.** These are Foundations variables (`spacing/{compact,default,comfortable,spacious}` → `padding/3nano`, `padding/2nano`, `padding/nano`). This PR lands the repo mirror (`design-tokens/foundations.json`). The rungs are not complete until the same three variables exist in ❖ Brik Foundations, or the next pull deletes them.

**Enforcement.** `tokens/naming-grammar.json` gains `steps.familySteps["--padding-"]`. `lint-naming-canon` reads it into `FAMILY_STEPS`, and rule 1 allows those words only inside that family. It does not add them to `T_SHIRT`, so `--gap-nano` is still denied. `scripts/__tests__/lint-naming-canon.test.mjs` plants the three admitted padding rungs and a denied `--bds-gap-nano` / `--bds-icon-2nano`. No new rule, script or workflow. **Baseline:** none. The amendment lands with the tokens that need it.

### `on-color` admitted to the emphasis axis (2026-11-14, [#1983](https://github.com/brikdesigns/brik-bds/issues/1983))

**Does an existing § 2 word name this axis?** The axis is `emphasis`, and § Amendments (#2279) already left this word to #1983. Searched as string literals in `components/` and `content-system/` (`.ts`/`.tsx`, non-story, non-test) for the concept's synonyms — `on-brand`, `knockout`, `reversed`, `on-dark`, `static-white` — and every one came back empty. The only hit for `on-color` is `ButtonVariant` itself ([Button.tsx](../../components/ui/Button/Button.tsx)).

- **Axis:** emphasis — which palette paints it (unchanged; this admits a fifth value).
- **Word:** `on-color`. **Closed values now:** `neutral` · `brand` · `accent` · `inverse` · `on-color`.
- **Correct today:** none — `on-color` sat on `variant` at its one site.
- **Migrates:** Button (`on-color` leaves `variant`, #1983).

**Why it earns the word.** `on-color` is the token layer's own word for a static white fill on a brand-colored surface (`--bds-background-on-color-dark`, `--bds-text-on-color-*`), and it is a hue source by the same test as `inverse`: it paints the primary form's fill and leaves the shape alone. It is distinct from `inverse`, which flips with the theme, and from `brand`, which is the brand palette itself rather than a fill placed on it. It has callers now — Banner, BannerGroup, ContentBlock and SectionHeader place it on brand surfaces.

**Enforcement.** `tokens/naming-grammar.json` `axes.emphasis.values` gains `on-color` in this PR, per § 6 step 3; the planted-violation test that used `on-color` as its denied neighbour now plants `knockout`.

**Baseline.** `ButtonVariant#mixed` → `1983` leaves `tokens/naming-canon-baseline.json`: `ButtonVariant` is now form-only, so the row is stale and the gate would fail on it.

### `fit` · `anchor` · `resize` · `marker` · `underline` · `measure` axes (2026-11-16, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name these axes?** No. Each is a prop five components already turn into a correctly prefixed modifier. The gate baselined those modifiers as bare because the prefix was on no axis list, not because the class was wrong. None of these concepts fits § 2's words or the amended ones (`orientation`, `layout`, `span`, `ratio`, `color`). Synonyms were searched across `components/ui/**` (`.tsx` + `.css`, stories and tests excluded) as prop keys, union type names and `--{word}-*` modifiers:

- **fit** — `cover`, `crop`: zero hits. The other `fit` props are the same concept: Image reuses `FrameFit` ([Image.tsx:32](../../components/ui/Image/Image.tsx)), and Card's `CardMediaImageFit` ([Card.tsx:153](../../components/ui/Card/Card.tsx)) and Table's `TableImageFit` ([Table.tsx:687](../../components/ui/Table/Table.tsx)) are `'contain' | 'cover'`, a subset of the list below. `objectFit` appears only as an inline style in DevFeedbackWidget. CardList's `fitContent` is a sizing boolean, not this axis.
- **anchor** — `lock`, `hold`: no proportion prop. Image reuses `FrameAnchor` ([Image.tsx:39](../../components/ui/Image/Image.tsx)). Button's `AnchorLinkProps` is the `<a>` element, a homonym, not a prop axis.
- **resize** — `resizable`, `grow`: zero. The one other `resize` is an inline style ([DevFeedbackWidget.tsx:510](../../components/ui/DevFeedbackWidget/DevFeedbackWidget.tsx)).
- **marker** — `listStyle`, `numbered`, `ordered`: no competing prop (the only `ordered` hit is `bordered`). `BulletListDensity` is the density axis.
- **underline** — `decoration`: zero.
- **measure** — `readable`, `textWidth`: zero. Footer's `containerMaxWidth` is a container width, not a text measure.

| Axis | Word | Closed values | Correct today |
|---|---|---|---|
| Media fit in its box | `fit` | `cover` · `contain` · `fill` · `none` | Frame (`bds-frame--fit-${fit}`, [Frame.tsx:144](../../components/ui/Frame/Frame.tsx)); Image, Card, Table props |
| Dimension a ratio is held from | `anchor` | `width` · `height` | Frame (`bds-frame--anchor-height`, [Frame.tsx:145](../../components/ui/Frame/Frame.tsx)); Image prop |
| User resize direction | `resize` | `none` · `both` · `horizontal` · `vertical` | TextArea (`bds-text-area-field--resize-${resize}`, [TextArea.tsx:112](../../components/ui/TextArea/TextArea.tsx)) |
| List item marker | `marker` | `disc` · `decimal` · `none` | BulletList (`bds-bullet-list--marker-${marker}`, [BulletList.tsx:41](../../components/ui/BulletList/BulletList.tsx)) |
| Link underline trigger | `underline` | `hover` · `always` · `none` | TextLink (`--underline-always` / `--underline-none`, [TextLink.tsx:104](../../components/ui/TextLink/TextLink.tsx)) |
| Text column width | `measure` | `sm` · `md` · `lg` | SectionHeader (`bds-section-header--measure-${measure}`, [SectionHeader.tsx:65](../../components/ui/SectionHeader/SectionHeader.tsx)) |

Each value list is the component's union as it ships. The amendment admits what exists and invents no value.

**`tint` is not admitted.** Card's `--tint-*` is prefixed the same way, but the search found a second word for its concept. BlockQuote picks a service line with `serviceLine` ([BlockQuote.tsx:17](../../components/ui/BlockQuote/BlockQuote.tsx), the term #788 chose) and paints the same `--surface-service-*-light` wash ([BlockQuote.css:50](../../components/ui/BlockQuote/BlockQuote.css)) that Card's `tint` paints ([Card.css:391](../../components/ui/Card/Card.css)). Admitting `tint` would put one concept under two words, which § 2 forbids. Its five rows stay baselined under #1927 until that issue picks one word. **Resolved 2026-11-17:** see the `service-line` axis below.

**Enforcement.** `tokens/naming-grammar.json` gains the six axes. `lint-naming-canon` reads them into `AXES` and `MODIFIER_AXES`, so the modifiers carry a blessed prefix and rule 5 default-denies any other value (`--fit-stretch`, a `*Marker` union with `square`). One mechanism change, the same one `span` needed: these values are CSS keywords and t-shirt rungs that other unions share, so rule 3 claiming them by value would read `DividerSpacing = 'none' | 'sm' | 'md' | 'lg'` as `marker + measure`. All six join `span` in `PREFIX_JUDGED_AXES`, which `axesOf()` skips (the gate's old `SPAN_AXIS` constant becomes this set). Planted cases in `scripts/__tests__/lint-naming-canon.test.mjs` admit the six modifiers, deny `--fit-stretch`, and keep a `DividerSpacing`-shaped union clean. **Baseline:** −17. The six families' rule-4 rows keyed to #1927 leave `tokens/naming-canon-baseline.json` because they no longer violate. The two rows keyed to the closed #1926 (`--center`, `--compact`) move to #1927, which now owns them.

### `columns` axis (2026-11-16, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is a grid's column count. None of § 2's words or the amended ones fit: it is not a direction (`orientation`), an arrangement of slots (`layout`), a grid child's extent (`span`), or a proportion (`ratio`). Grid and FieldGrid already name the prop `columns`. What was wrong was the class: Grid emitted `bds-grid--cols-{n}` and a bare `bds-grid--auto-fit` / `--auto-fill`, and FieldGrid emitted `bds-field-grid--cols-{n}`. That is two spellings of one word, and one value with no prefix at all. Synonyms were searched across `components/ui/**` (`.tsx` + `.css`, stories and tests excluded) as prop keys, union type names and `--{word}-*` modifiers, at this PR's base:

- **`cols`, `colCount`, `columnCount`, `column-count`:** no prop, type or key. `cols` appeared only in the two modifiers this amendment renames.
- **`perRow`, `itemsPerRow`, `per-row`:** no prop. The hits are AddableFieldRowList prose ("the per-row remove button").
- **`track` / `tracks`:** no prop. The hits are CSS comments and Slider's and Meter's own track elements.
- **`columns` itself has three homonyms.** None emits a modifier and none is a closed union. Footer's `columns` is a list of column definitions (`FooterColumn[]`, [Footer.tsx:82](../../components/ui/Footer/Footer.tsx)). AddableFieldRowList's is a free-form CSS track template (`string`, [AddableFieldRowList.tsx:45](../../components/ui/AddableFieldRowList/AddableFieldRowList.tsx)). TableSkeletonRow's is a numeric cell count ([Table.tsx:390](../../components/ui/Table/Table.tsx)). ADR-039 § 1 already names the blueprint structure axis `columns`.

- **Axis:** columns: how many columns a grid lays out, as a fixed count or a reflow strategy.
- **Word:** `columns`. **Closed values:** `1` · `2` · `3` · `4` · `5` · `6` · `auto-fit` · `auto-fill`. These are `GridColumns` as it ships ([Grid.tsx:12](../../components/ui/Grid/Grid.tsx)). `FieldGridColumns` (`2 | 3 | 4`) is a subset.
- **Migrates:** Grid (`bds-grid--cols-{n}` and `bds-grid--auto-{fit,fill}` become `bds-grid--columns-{value}`) and FieldGrid (`bds-field-grid--cols-{n}` becomes `bds-field-grid--columns-{n}`). The CSS and the TSX template change in one commit. Grid's `auto-*` values now take the same prefix as its counts, so the class is derived from the prop by one template instead of two.

**Blueprints are out of this rule's reach, and they still spell it `cols`.** `bds-card-grid--cols-*` and `bds-features--cols-*` (CardGrid, Features and TestimonialsCardGrid, on both rails, plus `BlueprintColumns` in `content-system/blueprints/astro/types.ts`) use the same word. Rule 4 reads only `components/ui/**/*.css` (§ Enforcement), so the gate cannot see them and the baseline holds no row for them. They render in client sites through the Astro rail, so renaming them is a consumer change across `web/*`, not a library-internal one. It stays a #1927 remainder.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.columns`. `lint-naming-canon` reads it into `AXES` and `MODIFIER_AXES`, so `--columns-*` carries a blessed prefix and rule 5 default-denies any other value (`--columns-7`, a `*Columns` union with `masonry`). No new mechanism. No other union shares these values, so `columns` stays out of `PREFIX_JUDGED_AXES`. Planted cases in `scripts/__tests__/lint-naming-canon.test.mjs` admit the Grid and FieldGrid modifiers and still deny the retired `--cols-3`, a bare `--auto-fit`, `--columns-7` and `TileColumns.masonry`. **Baseline:** −8. The `--cols-{1..6}`, `--auto-fit` and `--auto-fill` rule-4 rows keyed to #1927 leave `tokens/naming-canon-baseline.json`.

### `spacing` axis (2026-11-16, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is how far a block sits from the block before or after it: Divider's margin on both sides, and the extra rhythm DataSection and SheetSection put before the next sibling section. None of § 2's words or the amended ones fit. It is not a spacing compression (`density`, which shrinks a component's own insides), a grid child's extent (`span`), or a text column width (`measure`). The `gap-*` and `padding-*` token families are not prop axes, and they name a different space: `gap` is between a block's children, `padding` is inside its edge. All three components already name the prop `spacing` and already emit `bds-{block}--spacing-{value}`. The gate baselined them as bare because the prefix was on no axis list, not because the class was wrong. Synonyms were searched across `components/ui/**/*.tsx` (stories and tests excluded) as prop keys and union type names, and across `components/ui/**/*.css` as `--{word}-*` modifiers, at this PR's base:

- **`margin`, `rhythm`, `gutter`, `separation`, `offset`, `spaced`, `spacious`:** zero hits as a prop, a union type or a modifier.
- **`spacing`** returned exactly the three components below, and no homonym.

- **Axis:** spacing: the outer separation between a block and its neighbour.
- **Word:** `spacing`. **Closed values:** `none` · `sm` · `md` · `lg`. These are `DividerSpacing` as it ships ([Divider.tsx:6](../../components/ui/Divider/Divider.tsx)). `DataSectionSpacing` and `SheetSectionSpacing` (`md | lg`, [DataSection.tsx:7](../../components/ui/DataSection/DataSection.tsx), [SheetSection.tsx:5](../../components/ui/SheetSection/SheetSection.tsx)) are a subset. Divider never emits `--spacing-none` ([Divider.tsx:39](../../components/ui/Divider/Divider.tsx)), but the union carries it, and rule 5 judges unions.
- **Migrates:** nothing. No class or prop is renamed.

**Not the spacing mode.** `[data-mode-spacing]` is a Theming Dimension set on a page scope, not a BEM modifier or a component prop (the "Style is not a prop axis" callout in [Prop Axes](../../docs-site/content/docs/build-standards/prop-axes.mdx)). The two never meet in one name. The mode changes what the `padding-*` and `gap-*` rungs resolve to ([modes-spacing.css:8](../../tokens/modes-spacing.css)), and this axis picks which `padding-*` rung a block's margin uses.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.spacing`. `lint-naming-canon` reads it into `AXES` and `MODIFIER_AXES`, so `--spacing-*` carries a blessed prefix and rule 5 default-denies any other value (`--spacing-xl`, a `*Spacing` union with `loose`). It joins `PREFIX_JUDGED_AXES`, because its values are the t-shirt rungs `measure` and `resize` share. Planted cases in `scripts/__tests__/lint-naming-canon.test.mjs` admit the three components' modifiers and deny `--spacing-xl` and `PanelSpacing.loose`. The existing `DividerSpacing`-shaped case stays clean. **Baseline:** −3. The `--spacing-{sm,md,lg}` rule-4 rows keyed to #1927 leave `tokens/naming-canon-baseline.json`.

### `corner` axis (2026-11-17, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is which corner of the viewport a fixed element docks to. TaskConsole emitted the value bare (`bds-task-console--bottom-right`). None of § 2's words or the amended ones fit: `align` is how content sits along a row or column (Stack, CardControl), not where a fixed box docks on screen, and `anchor` is the dimension a ratio is held from. Synonyms were searched across `components/ui/**/*.tsx` (stories and tests excluded) as prop keys and union type names, and across `components/ui/**/*.css` as `--{word}-*` modifiers, at this PR's base:

- **`corner`, `dock`, `docked`, `edge`:** zero hits as a prop, a union type or a modifier.
- **`placement`** ([Tooltip.tsx:32](../../components/ui/Tooltip/Tooltip.tsx), [Popover.tsx:21](../../components/ui/Popover/Popover.tsx), [Menu.tsx:125](../../components/ui/Menu/Menu.tsx)) and **`side`** ([Sheet.tsx:118](../../components/ui/Sheet/Sheet.tsx)) name a different concept: the side of a trigger a popup opens on, and the viewport edge a sheet slides in from. Their values are `top` · `bottom` · `left` · `right`, none of them a corner. `placement` is admitted in its own section and `side` in the `side` section below (#1927).

**Why not `position`, the word TaskConsole's prop uses.** `position` names four concepts across `components/ui`: TaskConsole's screen corner, Pagination's row alignment (`left` · `center` · `right`, [Pagination.tsx:11](../../components/ui/Pagination/Pagination.tsx)), SidebarNavigation's layout mode (`fixed` · `sticky`, [SidebarNavigation.tsx:15](../../components/ui/SidebarNavigation/SidebarNavigation.tsx)), and a media side or label side (`start` · `end` on MediaTabs and SyncedMediaSteps, `above` · `below` on Meter). § 2 gives each word exactly one axis. Admitting `position` was tried first: rule 5 judges a union by its type name, so every `*Position` union became governed and the gate reported 11 live members (`PaginationPosition.left`, `SidebarPosition.sticky`, `MeterLabelPosition.above`, …). A word that would fail 11 members of four other concepts is not one axis.

- **Axis:** corner: the viewport corner a fixed element docks to.
- **Word:** `corner`. **Closed values:** `bottom-right` · `bottom-left`, which is `TaskConsolePosition` as it ships ([TaskConsole.tsx:16](../../components/ui/TaskConsole/TaskConsole.tsx)). The amendment admits what exists and invents no value.
- **Migrates:** TaskConsole's `--bottom-right` · `--bottom-left` → `--corner-bottom-right` · `--corner-bottom-left`. The prop stays `position`; the class carries the axis word, as CardControl's `actionAlign` carries `--align-*`. No alias ships.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.corner`. `lint-naming-canon` reads it into `AXES` and `MODIFIER_AXES`, so `--corner-*` carries a blessed prefix and rule 5 default-denies any other value (`--corner-top-left`, a `*Corner` union with `top-left`). It is not prefix-judged: `bottom-right` and `bottom-left` are on no other union. Planted cases in `scripts/__tests__/lint-naming-canon.test.mjs` admit the two modifiers and deny the bare class, `--corner-top-left` and `ConsoleCorner.top-left`. **Baseline:** −2. The `--bottom-left` · `--bottom-right` rule-4 rows keyed to #1927 leave `tokens/naming-canon-baseline.json`; TaskConsole is the only block that emits either.

### `service-line` axis (2026-11-17, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is which service line's surface paints a block. The `tint` paragraph under § Amendments (2026-11-16) refused to admit `tint` because BlockQuote already names the concept `serviceLine`. This amendment picks that one word. `emphasis` is not it: `emphasis` picks a palette (`brand` · `accent` · `inverse`), and a service line is a domain value with its own token family (`--surface-service-{line}-*`). Synonyms were searched across `components/ui/**/*.tsx` (stories and tests excluded) as prop keys, and across `components/ui/**/*.css` as `--{word}-*` modifiers, at this PR's base:

- **`serviceLine`:** BlockQuote ([BlockQuote.tsx:17](../../components/ui/BlockQuote/BlockQuote.tsx)). [#788](https://github.com/brikdesigns/brik-bds/issues/788) renamed `audience` → `serviceLine` across the API, so this is the canonical word.
- **`tint`:** Card only, the prop this amendment retires. No other prop or modifier.
- **`audience`, `serviceCategory`, `hue`:** zero hits.
- **`category`** is a live third spelling. ServiceTag ([ServiceTag.tsx:11](../../components/ui/ServiceTag/ServiceTag.tsx)) and RelationshipField ([RelationshipField.tsx:32](../../components/ui/RelationshipField/RelationshipField.tsx)) type it `ServiceLine`. Neither emits a `--category-*` modifier, so § 4 does not reach it. It is known drift against #788 and is not renamed here.

**Why prefixed, when § 4's service-line exception allows the bare value.** The exception lets BlockQuote emit `bds-block-quote--marketing`. Card cannot: `bds-card--brand` is already its `variant="brand"` fill (see the exception's own scoping paragraph above), so a bare `--brand` service line would collide with it. Card takes the prefix.

- **Axis:** service-line: the service line whose surface paints the block.
- **Word:** `service-line` in a class, `serviceLine` as the prop. **Closed values:** `brand` · `marketing` · `information` · `product` · `back-office`, which is `CardServiceLine` as it ships ([Card.tsx:56](../../components/ui/Card/Card.tsx)): `ServiceLine` minus the deprecated `service` alias. The amendment admits what exists and invents no value.
- **Migrates:** Card's `tint` prop → `serviceLine`, `tintInverse` → `serviceLineInverse`, type `CardTint` → `CardServiceLine`, and `--tint-{line}` → `--service-line-{line}`. No alias ships: no consumer passes `tint` (0 of 75 Card-rendering files in brik-client-portal and `web/*`, 2026-11-17).

**Enforcement.** `tokens/naming-grammar.json` gains `axes["service-line"]`. `lint-naming-canon` reads it into `AXES` and `MODIFIER_AXES`, so `--service-line-*` carries a blessed prefix and rule 5 default-denies any other value (`--service-line-service`). Two mechanism changes:

1. **Prefix-judged.** `service-line` joins `PREFIX_JUDGED_AXES`. `brand` is also an `emphasis` value, so judging unions by value would report a `'brand' | 'positive'` union as three axes instead of two.
2. **A value on its own axis's list is not a retired word there.** `information` is retired as a valence (→ `info`). It is also the service line's name. A prefixed modifier is now checked against the retired-valence list only when its own axis's closed list does not hold the value. `--tone-information` still fails. `information` is the only retired valence word on any axis list.

Rule 5's type-name match does not govern a `*ServiceLine` union: the axis key is hyphenated, and a type name never is. Planted cases in `scripts/__tests__/lint-naming-canon.test.mjs` admit the five modifiers and deny `--tint-brand`, `--service-line-service` and `--tone-information`. **Baseline:** −5. The `--tint-{brand,marketing,information,product,back-office}` rule-4 rows keyed to #1927 leave `tokens/naming-canon-baseline.json`.

### `placement` axis (2026-11-18, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is the side of its anchor a floating element opens on. Three components already name it `placement` in their API: Tooltip (`TooltipPlacement`, [Tooltip.tsx:23](../../components/ui/Tooltip/Tooltip.tsx)), Popover (`PopoverPlacement`, [Popover.tsx:12](../../components/ui/Popover/Popover.tsx)) and Menu (`MenuPlacement`, [Menu.tsx:94](../../components/ui/Menu/Menu.tsx)). Tooltip and Menu already turn the prop into a modifier, and the gate baselined those as bare only because the prefix was on no axis list. Synonyms were searched across `components/ui/**` (`.tsx` + `.css`, stories and tests excluded) as prop keys and union type names:

- **`side`:** Sheet only (`SheetSide`, [Sheet.tsx:38](../../components/ui/Sheet/Sheet.tsx)). That is the viewport edge a panel docks to, not a side of an anchor, so it is a different concept. Popover hands its `placement` to Radix as `side={placement}` ([Popover.tsx:98](../../components/ui/Popover/Popover.tsx)), which is Radix's word, not a BDS prop.
- **`position`:** Pagination (`PaginationPosition`, `left | center | right`) is horizontal alignment. SidebarNavigation (`fixed | sticky`) is CSS `position`. TaskConsole's is the `corner` axis above. MediaTabs and SyncedMediaSteps (`start | end`) place media in a row. None names a side of an anchor.
- **`anchorSide`, `edge`, `direction`:** zero hits.

| Axis | Word | Closed values | Correct today |
|---|---|---|---|
| Side of its anchor a floating element opens on | `placement` | `top` · `bottom` · `left` · `right` | Tooltip, Popover (props); Menu (`bds-menu--placement-top`) |

The value list is the three unions as they ship (Menu's is the `top | bottom` subset). The amendment admits what exists and invents no value.

**Not admitted.** Meter's `labelPosition` (`above | below`) and TextInput's icon `before | after` use different values for a different relation (a label against a bar, an icon against text). They stay baselined under #1927 until their own search.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.placement`. `lint-naming-canon` reads it into `AXES` and `MODIFIER_AXES`, so `--placement-*` carries a blessed prefix and rule 5 default-denies any other value. `placement` joins `PREFIX_JUDGED_AXES`: `top`, `left` and `right` are also members of Pagination's and Sheet's unions, so judging by value would report those as a placement union. **Baseline:** −1. Only `--top` leaves `tokens/naming-canon-baseline.json`. `--bottom`, `--left` and `--right` stay because Sheet (`side`) and Pagination (`position`) still emit them bare, and each needs its own axis decision.

### `side` axis (2026-11-18, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is the viewport edge a docked panel slides in from and anchors to. Sheet is the only component with it (`SheetSide`, [Sheet.tsx:38](../../components/ui/Sheet/Sheet.tsx)), and the prop is already `side` ([Sheet.tsx:118](../../components/ui/Sheet/Sheet.tsx)). Candidates checked:

- **`placement`:** the side of an *anchor element* a floating popup opens on. Sheet docks to the *viewport*, so it is a different relation, and its value set (`right` · `left` · `bottom`, no `top`) is not the placement set.
- **`corner`:** a viewport corner, not an edge.
- **`align`:** content alignment along a row, not where a fixed panel docks.

| Axis | Word | Closed values | Correct today |
|---|---|---|---|
| Viewport edge a docked panel anchors to | `side` | `right` · `left` · `bottom` | Sheet (`bds-sheet--side-right`) |

**Enforcement.** `tokens/naming-grammar.json` gains `axes.side`. `side` joins `PREFIX_JUDGED_AXES`: `left`, `right` and `bottom` are also members of `placement` and of Pagination's union, so judging by value would misread them. **Migrates:** Sheet `--right` · `--left` · `--bottom` → `--side-right` · `--side-left` · `--side-bottom`. Pagination's `--left` · `--center` · `--right` (prop `position`, horizontal alignment) go onto the existing `align` prefix as `--align-*`, with no amendment. No aliases ship. **Baseline:** −4. `--bottom`, `--center`, `--left` and `--right` leave `tokens/naming-canon-baseline.json`.

### Button's `variant` is a curated style list (2026-11-19, [#3275](https://github.com/brikdesigns/brik-bds/issues/3275))

OPERATOR CHOSE 2026-11-19: Button API → one flat `variant` list, and this ADR is amended so Button's variant is a curated list of styles.

**What changes.** § 2 says one union carries one axis. Button no longer follows that. Its `variant` is a closed list of ten complete styles. Each member names one finished look, not a mix of axes:

| Prop | Values | Class |
|---|---|---|
| `variant` | `primary` · `secondary` · `outline` · `ghost` · `inverse` · `on-color` · `negative` · `negative-outline` · `negative-ghost` · `positive` | `bds-button--variant-{value}` |

**Why.** Button had three props for one choice: `variant`, `tone` and `emphasis`. Most pairings had no style. `tone="positive"` worked only on `primary`, and `emphasis` worked only on `primary`. The rest fell back silently. A designer picks one button style, so the API is one list. `IconButton` and `LinkButton` share the type.

**This reverses two § 2 migrations for Button only.** Valence members (`negative`, `positive`) and hue members (`inverse`, `on-color`) return to `variant`. The `tone` and `emphasis` axes stay unchanged for every other component.

**Is any other union a curated style list?** No. Rule 3's mixed-axis check was run over every union in `components/ui/**`. It flagged `ButtonVariant` and the three `*Tone#mixed` unions already baselined under #1925 (Badge, Banner, Counter). Those three are valence + emphasis splits that #1925 is migrating, not style lists, so they stay. The exception is `ButtonVariant` alone.

**Retired for one minor.** `tone` and `emphasis` on Button, IconButton and LinkButton, the `ButtonTone` / `ButtonEmphasis` types, and Hero's `ctaEmphasis` stay as `@deprecated` and fold into `variant` with a dev warning. `danger`, `danger-outline`, `danger-ghost` and `destructive` fold the same way.

**Enforcement.** `lint-naming-canon` gains `CURATED_STYLE_UNIONS = {ButtonVariant}`, which skips rule 3's mixed-axis check for that union only. The retired-word checks still run on it. Another union joins the set only by its own amendment. **Baseline:** −3. `--ghost`, `--outline` and `--inverse` leave `tokens/naming-canon-baseline.json` (`--inverse` once Footer #3273 also moved to `--variant-inverse`). `--primary` and `--secondary` stay because other components still emit them bare.

### Shadow depths are named steps (2026-11-20, [#3058](https://github.com/brikdesigns/brik-bds/issues/3058))

OPERATOR SAID 2026-11-19: "let's refactor our elevation logic to ensure alignment across figma and code".

**What changes.** Figma's `elevation` collection names six depths: `shadow/{sunken,flat,subtle,raised,lifted,dramatic}`. The build composes each into one `--bds-shadow-{depth}` (#3058). A token name is its Figma path (#3278), so these six words are the `--shadow-*` steps. **Closed steps, low to high:** `sunken` · `flat` · `subtle` · `raised` · `lifted` · `dramatic`.

**Does an existing § 3 word name these depths?** No. The t-shirt rungs `sm` / `md` / `lg` / `xl` were the old hand-written names, and they do not map one to one: `sunken` sits below the page and `flat` is a zero shadow, which no t-shirt rung describes. `subtle` is also an `appearance` value (§ 2). That is a prop axis, not a token step, so the two never meet in one name.

**For one minor, the family mixes vocabularies.** The DEPRECATED `--bds-shadow-{sm,md,lg}` aliases in `tokens/gap-fills.css` share the family. Rule 1 would then flag the depth words. The family-step entry is what keeps them legal, and it stays legal after the aliases drop.

**Enforcement.** `tokens/naming-grammar.json` gains `steps.familySteps["--shadow-"]`. Rule 1 allows the six words in that family only. `scripts/__tests__/lint-naming-canon.test.mjs` plants an admitted `--bds-shadow-raised` and a denied `--bds-gap-raised`. The `blur-radius` scale slot leaves the grammar with its four hand-written tokens, which had no Figma variable behind them. No new rule, script or workflow. **Baseline:** the alias rows are rule 9, not rule 1. `--bds-shadow-{sm,md,lg}` join rule 9 under #3058, the shape #3274 used for its deprecated aliases. `--bds-shadow-overlay` moves from #3239 to #3058. All four leave with the alias block.


### `motion` axis (2026-11-24, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is which entrance or attention animation a block plays. Negative search over `components/**/*.tsx` for `motion`, `animation`, `animate`, `animated`, `attention`, `pulse` and `shake` as prop names found none. `pulse?: boolean` on Dot ([Dot.tsx:29](../../components/ui/Dot/Dot.tsx)) is a state flag, not a choice among animations, and stays a boolean.

- **`bds-badge--animate-in` · `--shake` · `--pulse`:** Badge ([Badge.css](../../components/ui/Badge/Badge.css)). CSS-only class hooks. No prop emits them, so consumers apply them by hand.
- **`status`, `variant`, `emphasis`:** not it. None names a motion.
- **`bds-*--motion`, `--animation-*`:** zero other hits.

- **Axis:** motion: the entrance or attention animation a block plays.
- **Values:** `enter` · `shake` · `pulse`. `animate-in` becomes `enter` because the axis word already says animation.
- **Migrates:** `.bds-badge--animate-in` → `--motion-enter` · `--shake` → `--motion-shake` · `--pulse` → `--motion-pulse`. No alias ships.
- **Frees `pulse`:** it joins the boolean list, because Dot's was its only other emitter and that is a boolean prop.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.motion`. `lint-naming-canon` reads it into `AXES` and `MODIFIER_AXES`, so `--motion-*` carries a blessed prefix and rule 5 default-denies any other value (`--motion-bounce`). `pulse` joins `BOOLEAN_MODIFIERS`. Planted cases in `scripts/__tests__/lint-naming-canon.test.mjs` admit the three values, deny a bare `--shake`, and deny `--motion-bounce`. **Baseline:** −3. The `--animate-in`, `--shake` and `--pulse` rule-4 rows leave `tokens/naming-canon-baseline.json`. No new rule, script or workflow.

### `type` axis (2026-11-24, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is whether a mark renders as a filled badge or a bare glyph. It is not a valence, a form, a fill treatment (`appearance`) or a hue source (`emphasis`). Negative search over `components/ui/**/*.tsx`: the only unions with these values are `SocialIconType` ([SocialIcon.tsx:15](../../components/ui/SocialIcon/SocialIcon.tsx)) and `ContactIconType` ([ContactIcon.tsx:15](../../components/ui/ContactIcon/ContactIcon.tsx)), both `'badge' | 'glyph'`. The word `type` is the incumbent prop name on both, and the only other `*Type` union, `AddableEntryPrimaryInputType = 'text' | 'url'`, is the HTML input-type concept, so the axis is prefix-judged and `lint-naming-canon` never claims a union by a `*Type` name.

- **Axis:** type: badge or bare-glyph rendering of a mark.
- **Values:** `badge` · `glyph`.
- **Migrates:** `.bds-social-icon--badge` / `--glyph` → `--type-badge` / `--type-glyph`; same for `.bds-contact-icon--*`. The `type` prop is unchanged; no alias ships.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.type`, and `type` joins `PREFIX_JUDGED_AXES` in `lint-naming-canon` so `AddableEntryPrimaryInputType` is not misread. Planted cases admit `--type-badge` and `--type-glyph` and deny bare `--glyph` and `--type-ring`. **Baseline:** −2. The `--badge` and `--glyph` rule-4 rows leave `tokens/naming-canon-baseline.json`.

### `overflow` axis (2026-11-24, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

**Does an existing § 2 word name this axis?** No. The axis is what a rail does when its items outgrow it: wrap onto a new row, or scroll on one. It is not an `orientation` (direction), a `layout` (slot arrangement) or a `fit` (media sizing). Negative search over `components/ui/**/*.tsx` (stories excluded) for a prop or union named `overflow`: one hit, `TabBarOverflow = 'wrap' | 'scroll'` ([TabBar.tsx:50](../../components/ui/TabBar/TabBar.tsx)), with the prop at [TabBar.tsx:78](../../components/ui/TabBar/TabBar.tsx). The other `overflow` hits are CSS `overflow` inline styles (DevFeedbackWidget) and a measurement key (Breadcrumb), not props. `wrap` appears elsewhere only as Stack's boolean `wrap` prop, a different concept and not a union member. The word is the incumbent with no competitor; what it lacked was an axis.

- **Axis:** overflow: what a rail does when its items outgrow it.
- **Values:** `wrap` · `scroll`.
- **Migrates:** `.bds-tab-bar--scroll` → `.bds-tab-bar--overflow-scroll`. The `overflow` prop is unchanged; no alias ships. `wrap` is the default and emits no class.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.overflow`, so `*Overflow` unions and `--overflow-*` modifiers are judged against `wrap` · `scroll`. `scroll` does **not** join `BOOLEAN_MODIFIERS`: it is now an `overflow` value, and the set is word-keyed. PageContent's `scroll?: boolean` ([PageContent.tsx:58](../../components/ui/Page/PageContent.tsx)) still emits a bare `bds-page__content--scroll`, so the `--scroll` rule-4 row stays in the baseline for #1927, now owed by Page alone. Planted cases admit `--overflow-scroll` and deny `--overflow-clip`. **Baseline:** unchanged (TabBar no longer emits it; Page still does). Follow-up: Page now emits `bds-page__content--overflow-scroll`, so the `--scroll` row is gone (#1927).

### `relation` axis (2026-11-24, [#1927](https://github.com/brikdesigns/brik-bds/issues/1927))

This is the "own search" the `placement` amendment deferred for Meter's `labelPosition` and TextInput's icon `before | after`: both stayed baselined.

**Does an existing § 2 word name this axis?** No. The axis is which side of its sibling content an element sits on: a Meter label against its bar (`above` · `below`, [Meter.tsx:23](../../components/ui/Meter/Meter.tsx)), a TextInput icon against its text (`before` · `after`, [TextInput.tsx:106,131](../../components/ui/TextInput/TextInput.tsx)). It is not `placement` (the side of an anchor a floating element opens on: `top` · `bottom` · `left` · `right`), not `side` (a viewport edge a docked panel anchors to), not `orientation` (a direction), and not `layout` (an arrangement of slots). `position` stays out for the reason the `placement` amendment gave: it names four concepts, and rule 5 would judge every `*Position` union by its type name. Negative search over `components/ui/**/*.tsx` (stories excluded) for the values `above`, `below`, `before`, `after` as union members: only `MeterLabelPosition` hits. `before` and `after` appear as union members nowhere; they are the slot names `iconBefore` and `iconAfter`, which are props, not a union. The word `relation` returned zero hits as a prop, union or class.

- **Axis:** relation: which side of its sibling content an element sits on.
- **Values:** `before` · `after` · `above` · `below`.
- **Migrates:** `.bds-meter__label--above` / `--below` → `--relation-above` / `--relation-below`; `.bds-text-input__icon--before` / `--after` → `--relation-before` / `--relation-after`. The `labelPosition`, `iconBefore` and `iconAfter` props are unchanged; no alias ships. `.bds-text-input-field--has-icon-before` / `--has-icon-after` are booleans and stay.

**Enforcement.** `tokens/naming-grammar.json` gains `axes.relation`. Rule 5 judges `--relation-*` modifiers against the four values; no union is named `*Relation`, so none is claimed by its type name. Planted cases admit all four modifiers and deny bare `--above` and `--relation-beside`. **Baseline:** −4. The `--above`, `--below`, `--before` and `--after` rule-4 rows leave `tokens/naming-canon-baseline.json`.

### Duration has no Semantic tier (2026-11-24, [#3281](https://github.com/brikdesigns/brik-bds/issues/3281))

OPERATOR SAID 2026-11-24 (chat, `638610b9-eb8e-48f1-8912-bf3e52a50f43.jsonl:805`): "1 - let's ensure we're aligned on animation logic. We follow a numeric scale at the primitive tier. We capture ease tokens at the next tier. These include ease-out, ease-in, etc. Let's better understand how animation and motion tokens will be used throughout our ecosystem. It seems like t-shirt sizes would clash with existing ease logic. Let's reassess. (e.g. https://atlassian.design/foundations/motion/applying-motion)". OPERATOR SAID 2026-11-24 (same session, `:878`): "go".

**What changes.** § 3's rule (numeric at Primitive, t-shirt at Semantic) does not reach motion. Motion has two tiers, and neither is a t-shirt ladder:

| Tier | Family | Steps | Source |
|---|---|---|---|
| Primitive | `--duration-*` | `100` … `600` — a step index, not milliseconds (`400` is 500ms) | ❖ Brik Foundations `primitives/value` → `duration/{step}` |
| Semantic | `--ease-*` | `out` · `in` · `in-out` · `spring` · `spring-soft` · `linear` — named by behaviour | ❖ Brik Foundations `motion/default` → `ease/{name}` |

Which duration a transition takes is a documented pairing of interaction → duration + ease ([Motion tokens § Pairing](../../docs-site/content/docs/foundation/motion.mdx)), not a token. `--duration-sm` · `-md` · `-lg` are withdrawn as the migration target for `fast` · `normal` · `slow`. The target is the numeric Primitive.

**Why.** A `sm` · `md` · `lg` Semantic duration would sit beside `ease/*` in the same tier with a second vocabulary — size words next to behaviour words. Neither exists in Figma, and #3252 already moved every component onto the numeric Primitives (`tokens/compat/renamed-knobs.json:32-36`). `--duration-marquee` and `--duration-autoplay` stay named exceptions: they are loop periods, not tweens.

**Enforcement.** `tokens/naming-grammar.json` `steps.retired` re-points `fast` · `normal` · `slow` for `--duration-` to `100` · `200` · `300`, so rule 1's message names the numeric target. No new rule, script or workflow. **Baseline:** unchanged.

### Presence reads the valence fills (2026-11-24, [#3239](https://github.com/brikdesigns/brik-bds/issues/3239))

OPERATOR SAID 2026-11-24 (chat, `638610b9-eb8e-48f1-8912-bf3e52a50f43.jsonl:805`): "… 3 - yes", answering "Accept two visual changes? … Avatar's offline dot goes from gray 500 to gray 800." OPERATOR SAID 2026-11-24 (same session, `:878`): "go".

**What changes.** § 2's *Why* paragraph says the `--background-presence-{online,offline,busy,away}` tokens "ship today". They no longer do. #3360 retired the four gap-fills, and Avatar's status dots now read `--bds-background-positive` · `-warning` · `-negative` · `-neutral`, as Dot already did.

**Why § 2 still holds.** The case for `status` = presence/lifecycle rests on the word, not on a token family. `AvatarStatus` (`online|offline|busy|away`) and TaskConsole's lifecycle keep the `status` prop. Only the second argument, "orphaning the presence token family", lapses.

**Enforcement.** None new. The four names left `tokens/naming-canon-baseline.json` and `tokens/compat/legacy-token-names.json` in #3360. **Baseline:** unchanged by this amendment.

### Loop periods live in the `motion` collection (2026-11-25, [#3338](https://github.com/brikdesigns/brik-bds/issues/3338))

OPERATOR SAID 2026-11-25 (chat, `75a4bd36-fe57-45c1-b2bc-dc6f7a18a794.jsonl:596`): "1 - yes; 2 - Let's ensure we clarify our band vs text-column width in this collection. You can revisit our tertiary colors per your recs. 3 - yes; 4 - can we add to our motion collection?" OPERATOR SAID 2026-11-25 (same session, `:658`): "updated and published - let's' continue and ensure style dictionary is referencing the latest tokens".

**What changes.** `--duration-marquee` (55s) and `--duration-autoplay` (10s) move out of `tokens/gap-fills.css`. They are now ❖ Brik Foundations `motion/default` → `duration/marquee` · `duration/autoplay`, emitted to `tokens/figma-tokens.css`. The names do not change.

**Why.** § Amendments, "Duration has no Semantic tier", keeps them as named exceptions because they are loop periods, not tweens. That reason still holds. A loop period is a motion role, so it sits beside `ease/*` in the Semantic `motion` collection, not on the numeric Primitive ramp.

**Enforcement.** None new. Both rule-9 rows leave `tokens/naming-canon-baseline.json`. **Baseline:** −2.
