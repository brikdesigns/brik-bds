# ADR-049 — Search has three modes (filter, lookup, global), each owned by one component, with one set of defaults

**Status:** **Accepted** 2026-11-11 (AGENT DECIDED, revisable — § Decision; the audience, route and index scope are operator-ratified — § The operator's words)
**Date:** 2026-11-11
**Supersedes:** —
**Superseded by:** —
**Amends:** [ADR-004](./ADR-004-component-bloat-guardrails.md) § Corrected input taxonomy, the `SearchInput` row (the `role="search"` claim)
**Owner:** Nick Stanerson
**Related:** [#3101](https://github.com/brikdesigns/brik-bds/issues/3101) (this ADR is its whole scope), [#3100](https://github.com/brikdesigns/brik-bds/issues/3100) (umbrella), [#3102](https://github.com/brikdesigns/brik-bds/issues/3102), [#3103](https://github.com/brikdesigns/brik-bds/issues/3103), [#3104](https://github.com/brikdesigns/brik-bds/issues/3104), [#3105](https://github.com/brikdesigns/brik-bds/issues/3105) (the four slices that read these defaults), [ADR-019](./ADR-019-own-width-responsive-primitives.md), [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md)

## The operator's words

OPERATOR SAID 2026-11-11 (Claude Code session in brik-bds, `6355b13a-8c1a-4454-8720-f5fd02012ba6.jsonl:231`): "1 - admin first. we can circle back on clients; 2 - see attached"

OPERATOR SAID 2026-11-11 (same session, `:269`): "1 - Yes; 2 - companies, contacts, services, projects, tasks and invoices. Also check against the live tables - go"

Those two replies ratify the audience (operator, `/admin/*`), the route (global search in the admin top bar) and the v1 entity scope. They do not rule on any default below. Every default in § Decision is `AGENT DECIDED (revisable)` and is revisable by changing one line.

## Context

BDS has one search field and three places that search. The portal has a fourth, and an admin cannot find a record without navigating to it ([#3100](https://github.com/brikdesigns/brik-bds/issues/3100)).

| Where | What it does | Source |
|---|---|---|
| `SearchInput` | Field with a magnifying glass and a clear button. No `debounceMs`, no `onSearch`, no Escape handling, no landmark. | [SearchInput.tsx:22-30](../../components/ui/SearchInput/SearchInput.tsx#L22) |
| `Breadcrumb` switcher | A private copy: `searchThreshold` 8, case-insensitive `includes` on the label, query reset on close. Empty result reads `No matches`, with no count and no next step. | [Breadcrumb.tsx:152](../../components/ui/Breadcrumb/Breadcrumb.tsx#L152), [:333](../../components/ui/Breadcrumb/Breadcrumb.tsx#L333), [:343-347](../../components/ui/Breadcrumb/Breadcrumb.tsx#L343), [:337-339](../../components/ui/Breadcrumb/Breadcrumb.tsx#L337), [:428-429](../../components/ui/Breadcrumb/Breadcrumb.tsx#L428) |
| `Menu` | Closes on Escape through a document listener. Has no search. | [Menu.tsx:184-186](../../components/ui/Menu/Menu.tsx#L184) |
| `FilterBar` | No search slot. | `components/ui/FilterBar/FilterBar.tsx` (no `search` match) |

Three facts the slices would otherwise each decide for themselves:

1. **Debounce.** `grep -rniE 'debounce' components --include='*.tsx' --include='*.ts'` returns 0 matches. Control: the same grep shape finds 69 `Escape` matches in `components/`, so it can find a word. There is no BDS precedent to copy.
2. **The landmark.** [ADR-004:120](./ADR-004-component-bloat-guardrails.md) says `SearchInput` has "`role="search"`". `grep -rn 'role="search"' components/ui | wc -l` returns 0. Control: `grep -rn 'role="' components/ui --include='*.tsx' | wc -l` returns 124. The claim was never true of the code.
3. **The vocabulary.** No `Command*` component exists (`ls components/ui | grep -i -e command -e palette` is empty).

### What Carbon says (fetched 2026-11-11)

| Question | Carbon's answer | Source |
|---|---|---|
| Esc | "Press `Enter` to submit text as a search term, or press `Esc` to clear the search field." | [Search usage](https://carbondesignsystem.com/components/search/usage/) |
| Esc in type-ahead | "`Esc` allowing the user to exit the type-ahead menu without selecting anything." | [Search pattern](https://carbondesignsystem.com/patterns/search-pattern/) |
| Result count | "Always include the number of search results, including for searches with no results." | Search pattern |
| No results | "If a search returns "No results", suggest a follow-up action." | Search pattern |
| Debounce, minimum characters | **Not stated** on either page. The pattern page says only that running the search after every character "can be impractical". | Both |
| Types | Three: Basic ("routed to a distinct results page"), Active ("lists the top results in results panel or on the current page", "Best for small data sets"), Focused (limited to "a user, a category, or a data set", with "the option to widen the scope"). Type-ahead is a behaviour, not a type. | Search pattern |
| Grouping, recents | Active results may be clustered "by category with the option to "View all" within the category"; recent searches appear "below the search field" and are "replaced by matching search results when the user begins typing". | Search pattern |

The two Carbon pages disagree on Esc: the usage page clears the field, the pattern page exits the menu. Carbon never says what Esc does when a menu is open **and** the field has text. § Decision rule 3 answers that.

## Decision

### 1. Three modes, one owner each

| Mode | What it does | Owner | Carbon's nearest term |
|---|---|---|---|
| **Filter** | Narrows a list already on the page, in place. Synchronous, in memory. | `FilterBar` search slot (#3103); tables compose it | Active search ("filtering an on-page catalog") |
| **Lookup** | Type-ahead inside a popup to pick one entity from a known option set. | `Menu`, with `Breadcrumb`'s switcher consuming it (#3104) | Type-ahead (a behaviour) |
| **Global** | Cross-entity search from anywhere in the shell: results grouped by entity, recents before typing. Remote. | `SearchOverlay` (#3105) | Active search with results clustered by category; Focused search when a scope chip is set |

`SearchInput` is the field every mode renders. It owns the field behaviour (clear, Escape, `debounceMs`, `onSearch`); the three owners own what surrounds it. No mode builds its own `<input>`.

Carbon's *Basic search* does not map to Global. Basic routes to a separate results page; `SearchOverlay` lists results in place. #3100's table names Global "basic search"; that label is wrong and this ADR's column replaces it.

**A command palette (actions, not records) is a possible fourth mode and is deferred.** No component, story or token is reserved for it.

### 2. `SearchOverlay` is one component with sections

`SearchOverlay` is a single component. The field, scope chips, grouped results, recents, count and key-hint footer are its sections, composed from existing primitives (`Modal`, `SearchInput`, `FilterToggle`). There is no separate `Command`, `CommandMenu` or `CommandPalette` component: [ADR-033](./ADR-033-naming-canon-one-word-per-concept.md) allows one word per concept, and a second name for "an overlay that searches" would be a second word. [ADR-004](./ADR-004-component-bloat-guardrails.md)'s three-uses test is met by the Project's own three modes; a palette would need its own.

### 3. Escape: close the popup first, clear on the second press

`AGENT DECIDED (revisable).` The "popup" is the surface the field controls: a `Menu` or the `SearchOverlay` dialog.

| State when Esc is pressed | Result |
|---|---|
| A popup is open | Close the popup. Do not clear the field. |
| No popup open, the field has text | Clear the field and fire `onClear`. |
| No popup open, the field is empty | Do nothing, and do **not** `preventDefault`, so a parent (a `Modal`, a page) still receives Esc. |

Where the field lives *inside* the popup (`Breadcrumb`'s switcher, `SearchOverlay`), closing resets the query, as `Breadcrumb` already does ([Breadcrumb.tsx:337-339](../../components/ui/Breadcrumb/Breadcrumb.tsx#L337)). One press therefore ends the interaction and the next open starts empty. The second-press clear applies to a field that stays on the page: the `FilterBar` slot and a stand-alone `SearchInput` with a popup of results.

*Evidence:* Carbon's two pages disagree (§ Context) and neither covers popup-open-with-text. *Revert:* change the table; the three slices read it.

### 4. Debounce and minimum characters

`AGENT DECIDED (revisable).` Carbon is silent on both (§ Context); there is no BDS precedent (§ Context, fact 1).

| Mode | `debounceMs` | Minimum characters | Why |
|---|---|---|---|
| Filter | 0 | 0 | In-memory; every keystroke is free, and a delay would feel broken. |
| Lookup | 0 | 0 | In-memory over a known option set. The box only shows above `searchThreshold` (8, [Breadcrumb.tsx:152](../../components/ui/Breadcrumb/Breadcrumb.tsx#L152)); that count is the gate, not a character count. |
| Global | 250 | 2 | Each query fans out to six tables ([#3100](https://github.com/brikdesigns/brik-bds/issues/3100) § Decisions recorded). One character matches almost everything under `ILIKE`, so below 2 characters the overlay shows recents instead of querying. |

`SearchInput` takes `debounceMs` **defaulting to 0**, so no existing consumer changes behaviour. `SearchOverlay` passes 250. `onSearch` fires on Enter and bypasses the debounce.

The 250 and the 2 are judgement calls with no measurement behind them. *Revert:* edit the two numbers in the table; no component hard-codes them outside its default prop.

### 5. Where `role="search"` goes

A `role="search"` landmark labels the container that holds the whole search feature, not the field. MDN: it goes on "the container element that encompasses all of the elements that combined to form the search feature ... including a descendant `<input type="search">`", and `<input type="search">` "does not define a search landmark by itself" ([MDN, search role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/search_role), fetched 2026-11-11).

So the landmark cannot sit on `SearchInput`'s `<input>`, and ADR-004:120 attributed it to the wrong element as well as to code that never had it.

| Element | Landmark | Why |
|---|---|---|
| `SearchInput` (the field) | **No** | An input cannot encompass the feature. A stand-alone field stays a plain field; a consumer whose field is the page's search wraps it. |
| `FilterBar` search slot container | **Yes** (#3103) | Field plus its count: the whole filter feature. |
| `SearchOverlay` content wrapper | **Yes** (#3105) | Field, scope chips and results: the whole global feature. |
| Lookup (`Menu`, `Breadcrumb` switcher) | **No** | A picker inside a popup is not a page search; a landmark would add a stop to every breadcrumb. |

Every landmark takes a distinct `aria-label` so two on one page are told apart. Use `role="search"` on a `div`. MDN prefers the `<search>` element; whether the React types and the supported browsers accept it was **not checked**, so #3102 and #3103 decide when they build, and either spelling satisfies this table.

**ADR-004 correction.** The `SearchInput` row of ADR-004's *Corrected input taxonomy* lists `role="search"` among its distinct UX. It is replaced by "clear-button interaction, Escape and `onSearch`/`debounceMs` behaviour (ADR-049)". The verdict (own component) is unchanged. ADR-004 carries a one-line amendment note pointing here.

### 6. Result count and no results

Carbon's rules, adopted (§ Context): **always show the result count, including zero**, and **on zero results suggest a next step**.

- The count lives in a `role="status"` region that stays mounted, so assistive tech announces the change. `Breadcrumb` already does this for its empty state ([Breadcrumb.tsx:428-429](../../components/ui/Breadcrumb/Breadcrumb.tsx#L428)); a live region inserted already populated is often missed.
- Zero reads as a count (`0 results`), not as `No matches`. `Breadcrumb`'s current `No matches` has no count and no next step, so #3104 brings it to this rule while keeping its other behaviour.
- A zero state always renders one next step: clear the query, or widen the scope when a scope chip is set (Carbon's "option to widen the scope"). The mechanism is a slot; the wording is Brik Content System copy, not set here.

### 7. Entity scope and recents are not component decisions

The v1 index (companies, contacts, services, projects, tasks, invoices), "services means engagements", test-fixture exclusion and "an empty query shows the most recently updated rows" are `AGENT DECIDED (revisable)` calls recorded in [#3100](https://github.com/brikdesigns/brik-bds/issues/3100) § Decisions recorded. They belong to the portal endpoint ([brik-client-portal#6732](https://github.com/brikdesigns/brik-client-portal/issues/6732)), not to a BDS component. `SearchOverlay` takes grouped results as data and knows no entity names.

## Consequences

- #3102 ships `debounceMs` (default 0), `onSearch` and the Escape rule on `SearchInput`.
- #3103 puts a landmark-wrapped search slot in `FilterBar` and keeps the field visible below the 600px collapse ([ADR-019](./ADR-019-own-width-responsive-primitives.md), `COLLAPSE_BELOW_PX`, [FilterBar.tsx:17](../../components/ui/FilterBar/FilterBar.tsx#L17)).
- #3104 moves `Breadcrumb`'s private search into `Menu` with behaviour unchanged except the count and next step in § 6.
- #3105 builds `SearchOverlay` to § 1-6 and passes `debounceMs={250}`.
- No slice chooses its own Escape, debounce, minimum-characters or landmark answer. A change to any is a one-line edit here plus the slice that reads it.
- This ADR changes no component, token or story.

## Alternatives considered

- **Put `role="search"` on `SearchInput`.** Rejected: an input cannot encompass the feature (§ 5), and it would put a landmark on every picker.
- **Esc always clears.** Rejected: with a popup open it discards the user's text when they only meant to dismiss the list.
- **Debounce every mode.** Rejected: it adds latency to in-memory filtering for no saving.
- **A separate `Command` component for the overlay.** Rejected: a second word for one concept (§ 2).
- **Carbon's Basic search for Global.** Rejected: Basic routes to a results page; the overlay lists results in place (§ 1).
