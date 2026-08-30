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
| Valence — what this communicates about a state | `tone` | § 1's five words | Field (`helperTone`); Banner's prop *name* | Badge, Counter, Dot, Meter, ProgressCircle (`status` → `tone`); Toast, Button (valence members leave `variant`); Banner (`announcement` leaves the union) |
| Presence / lifecycle — the state of a named subject | `status` | per-subject, scoped-intent token-backed | Avatar, Card, Table, TaskConsole | — |
| Form — mutually exclusive visual or structural shape, no valence | `variant` | per-component | Card, TabBar, Skeleton, Sheet, ServiceTag, Testimonial, Footer, ToggleSwitch, ProgressStepper | — |
| Hue source — which palette paints it | `emphasis` | `neutral` · `brand` · `accent` | — | TextLink, SocialIcon, ContactIcon (`tone` → `emphasis`; `grayscale` → `neutral`); Banner, Badge, Counter (brand member extracted, below) |
| Fill treatment intensity | `appearance` | `solid` · `subtle` · `muted` | Tag | — |
| Spacing compression | `density` | `comfortable` · `compact` | Tag, Sheet | — |
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
| `duration` | `fast` · `normal` · `slow` | **Retire** → `--duration-sm` · `-md` · `-lg` alongside the numeric Primitives. |
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

The exception is scoped to the **block**, not the value. `.bds-card--brand` is still a § 4 finding: Card imports `ServiceLine` and derives `CardTint` from it, but paints that class from an unrelated `variant`, and emits its actual service tint as the already-compliant `bds-card--tint-${tint}`. An import-level or directory-level carve-out would have exempted it and hidden real drift, so the gate requires the block to interpolate a `ServiceLine`-annotated identifier. Removing this exception means renaming the CSS and the TSX template together, in one commit.

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

Every mapping below is positional and measured; values do not change.

| Retired | Family | Migrates to | Measured basis |
|---|---|---|---|
| `tiny` | `--gap-*` | `2xs` | `--gap-tiny` = `--space-50`, one rung below `--gap-xs` = `--space-100` (`:419-420`); family ships no `2xs` |
| `huge` | `--gap-*` | `2xl` | `--gap-huge` = `--space-800`, one rung above `--gap-xl` = `--space-600` (`:416-418`) |
| `tiny` | `--icon-*` | `3xs` | Nine-rung ramp; `2xs` is already taken by a distinct 12px rung (`:1306-1318`) |
| `huge` | `--icon-*` | `3xl` | Same ramp; `2xl` already taken by a distinct 24px rung |
| `huge` | `--border-width-*` | `2xl` | `--border-width-huge` = `--border-width-500`, above `xl` = `--border-width-400` (`:401-403`) |
| `tiny` | `ButtonSize` | `xs` | The smallest rung, which `AvatarSize` / `BadgeSize` / `CounterSize` / `TagSize` already call `xs` |
| `thin` · `standard` · `bold` | `--border-width-*` | *deleted, not renamed* | `:1480-1482` — 1px/2px/3px duplicates of `sm`/`md`/`lg` that freeze what the spacing modes vary (`:1042-1052`) |
| `fast` · `normal` · `slow` | `--duration-*` | `sm` · `md` · `lg` | 100/200/300ms (`:1521-1523`) — three contiguous rungs |
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

`--size-pill` · `--size-circle` · `--border-radius-pill` · `--border-radius-circle` (shape constants) · `--aspect-{square,cinema,photo-landscape,photo-portrait}` (semantic ratio aliases) · `--iteration-infinite` (CSS keyword) · `--content-width-full` (not a step) · `--shadow-overlay` (a role, not a step) · `--duration-marquee` · `--duration-autoplay` (periodic-motion roles — a loop period and an auto-advance dwell, not points on the fast/normal/slow ramp; [#2044](https://github.com/brikdesigns/brik-bds/issues/2044)) · `--web` · `--tablet` · `--mobile` (slotless carve-out, per [#1912](https://github.com/brikdesigns/brik-bds/pull/1912)) · the bare **service-line** modifiers on service-line-emitting blocks (§ 4, [#1982](https://github.com/brikdesigns/brik-bds/issues/1982) — sourced from `ServiceLine`, never re-listed).

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
- **[ADR-024](./ADR-024-layout-rhythm-map.md)'s lint rule 2 names a retiring token.** It bans mode-collapsing `--gap-xs` / `--gap-tiny` on vertical props, and § 3 renames `--gap-tiny` to `--gap-2xs`. `lint-content-rhythm` must be updated in the same PR as the rename, or the ban silently stops matching — both tokens collapse to `0px` in the compact spacing mode (`:1096-1098`), which is the behaviour ADR-024 exists to prevent.
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

- **Rule 1 does not read colour tokens.** A colour token's tail is a role, not a step (`--color-blue-light`, `--background-brand-primary`), and § 3's numeric/t-shirt vocabulary cannot express either. The colour ramps *do* carry two vocabularies in one family — `--color-blue-500` beside `--color-blue-light`, across 10 hues — which this ADR never dispositioned. Filed as [#1949](https://github.com/brikdesigns/brik-bds/issues/1949) for a § 6 amendment; the gate may not assert a disposition the ADR has not made.
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
