---
name: Fumadocs content standard (BDS docs-site)
description: Canonical rules for authoring MDX in docs-site/content/docs. Frontmatter shape, IA decision tree, voice pointer, length caps, anti-patterns.
type: reference
scope: brik-bds
applies-to: "**/docs-site/content/docs/**/*.mdx"
retrieved-via: brik-rag query "fumadocs writing standard"
last-verified: 2026-07-26
---

# Fumadocs content standard

Rules for `brik-bds/docs-site/content/docs/**/*.mdx`. Source of truth lives in this file (git-tracked); agents retrieve via `brik-rag query "fumadocs writing standard"`.

## Frontmatter — only two fields

```yaml
---
title: <Concept>
description: <One sentence. Action-oriented. Tells the reader what they leave with.>
---
```

Do not add `tags`, `keywords`, `author`, `date`, `category`, `sidebar_position`, or other fields. Fumadocs uses `meta.json` for nav ordering — not frontmatter. Adding bespoke fields creates parallel taxonomies that diverge.

`description` is required; it surfaces in nav previews and search. Treat it as the elevator pitch.

## IA decision tree — page / section / callout / cross-link

Ask in this order; first YES wins:

| Question | YES → |
|---|---|
| Is this its own discoverable concept someone would search for? | New `*.mdx` page |
| Is this a facet of an existing page that deserves a heading? | New `##` section in that page |
| Is this a 1-3 sentence warning, caveat, or "did you know"? | `<Callout type="info\|warn\|error">` |
| Does this fact already live on another page? | Cross-link with `[label](/docs/path)` — do not duplicate |

If you add a new top-level dir under `content/docs/`, update `meta.json`. Do not rely on alphabetical fallback.

### Cross-cutting page families — name the canonical home

Some sections carry two page families that index the same material on different axes (Motion's `tiers/` × `effects/`; a future Components `by-platform` × `by-category`). Both families legitimately want the same class table, so "do not duplicate" is not self-executing — you have to say which one owns it.

Write the ownership split into the section's `index.mdx`, then hold it:

- One family owns **decisions** — when to reach for this, what to load, how to escalate.
- The other owns **implementation** — class tables, code samples, live demos.
- The non-owner cross-links. A pointer table (`| Effect | Classes | Reference |`) beats a prose list because it stays scannable as the family grows.

The failure mode is additive: an author lands a class table on the page they happened to be editing, the other page already had it, and neither is now authoritative. brik-bds#1361 found six such pairs across four motion pages. When you add reference material to a section with two page families, check the sibling family first.

## Section placement — where the page lives

IA placement is a first-class decision, not an afterthought. The wrong section hides a page from the readers who would search for it.

Before creating a new MDX page:

1. **Audit every top-level section.** Read `content/docs/meta.json`, then read each section's `index.mdx`. You need to know what each section already covers before you can decide where your page belongs.
2. **Ask the reader's question, not the author's.** "Where would someone with this question look?" beats "Which section name is closest to my topic?" — the same topic can sound right under multiple section names, but readers usually have one mental model.
3. **Refuse to perpetuate stub sections.** If the candidate section's `index.mdx` says "hasn't migrated yet" or only links to one other page, the section is a smell. Propose moving the existing page elsewhere and deleting the section in the same PR. Empty-ish sections accumulate orphans.
4. **Don't invent a new top-level section.** Adding to `content/docs/meta.json` should be rare and discussed first. The default is to fit into an existing section, even if the page feels like a new tenet.

When moving or deleting a section in the same PR:

- Run `grep -rn "/docs/<old-section>" docs-site/` — every match must be updated to the new path or removed.
- Update the top-level `content/docs/meta.json` to remove the section.
- Update any section-`index.mdx` page that enumerates the old section in its overview bullets.
- Update `brik-bds/CLAUDE.md` "Where deeper context lives" rows whose URLs change.
- The new section's `index.mdx` and `meta.json` need to know about the moved pages.

A common failure mode is moving the file but leaving cross-page references broken — the build does not always catch this for absolute `/docs/...` links. Grep is the only safe sweep.

## Heading depth — `##` and `###` only

`#` is reserved for the page title (rendered from frontmatter `title`). Use `##` for sections, `###` for subsections. Do not use `####` or deeper — Fumadocs nav UI does not surface them and readers lose orientation.

If you need a fourth level, split into a new page.

## Heading and title copy — scannable labels

Headings (`##`/`###`) and page titles are scannable labels, not sentences. The **hard rule** (enforced by `scripts/lint-mdx-headings.mjs`, CI: MDX Heading Check): no **em dashes, backticks, parentheticals, slashes, or arrows** in a heading — the qualifier that used to trail an em dash moves to the section's first sentence. As **guidance**, aim for **≤35 characters, sentence case**, and a label rather than a full sentence.

- **Page titles** follow the same rule and never restate the parent section — `Commercial Brokerage`, not `Real Estate — Commercial Brokerage`.
- **API-reference headings** may use the bare identifier as the label — `## useTheme`, `## bds-find` — with the one-line summary in the first sentence below.
- **Component-variant headings** drop the parenthetical too — `### Horizontal` with "Horizontal is the default." as the first line, not `### Horizontal (default)`.
- **One trailing inline badge component is allowed** — a status/tier tag such as `## Parallax <TierBadge tier="gsap" />` is functional metadata, not clutter. Prose-as-JSX and code in the heading text are not.

Sentence case here means capitalize the first word and proper nouns only. This is the docs-site convention and is deliberately *not* the product/consumer-UI title-case rule at [Typography → Heading casing](/docs/primitives/typography#heading-casing) — that rule governs rendered UI heading copy (`Section` / `__title` strings), enforced in consumer repos, not docs prose.

Renaming a heading changes its anchor slug. Before renaming, grep for inbound `#fragment` links (`grep -rn "#<old-slug>" docs-site/`) and update them in the same PR — `lint-doc-links` fails on a broken anchor.

## Section length cap — soft 400 words, hard 800

A section (`##` to the next `##`) over 800 words is almost always two sections. Over 1500 words is a new page.

Exception: code-block-heavy sections (API references, full snippets). Count prose lines, not code lines.

## Voice — point, don't redefine

The canonical Brik voice corpus is `brik-bds/source=brand-voice`. Retrieve via `brik-rag query "brik brand voice" --workflow-type fumadocs-standard`. Do not re-articulate voice rules inside this file or in MDX pages.

Concrete shorthand: terse, opinionated, knowledge-dense. "Patterns are recipes, not new components." Match the existing `react-reference/patterns.mdx` register.

## Code blocks — always language-tagged

````markdown
```tsx
<Component prop="value" />
```
````

Never bare triple-backticks. Tags in use: `tsx`, `ts`, `js`, `bash`, `css`, `json`, `yaml`, `mdx`, `tree` (for ascii dir layouts).

When a code block must itself show a fenced block (a snippet of MDX with a nested ` ``` `), wrap the outer fence in **four** backticks — otherwise the inner three-backtick fence closes the outer one early and the rest of the page renders as broken markdown.

## MDX authoring gotchas

MDX is not plain markdown — two constructs crash the prerender build rather than degrading gracefully.

**Curly braces in prose.** MDX evaluates `{anything}` as a JSX expression, even inside a plain sentence. Writing `{n}-of-something` makes MDX read a variable `n` and fail the build with `ReferenceError: n is not defined`. Escape it — wrap in backticks (`` `{n}` ``) or use the HTML entity (`&#123;n&#125;`). This bites hardest in prop-shape descriptions and template-literal-style copy; when in doubt, backticks.

**Tables over runtime data.** Use a markdown table for static reference data. Use an HTML `<table>` only when you need JSX `.map()` over runtime data (e.g. a vocabulary list built from pack data) — JSX expressions inside markdown table pipes are not re-parsed at runtime, so `{x.map(() => '| col |').join('\n')}` renders as literal text, not a table.

## Token names in code blocks and tables

Every Semantic-tier token name (`--text-*`, `--surface-*`, `--background-*`, `--border-*`, `--color-*`, `--padding-*`, `--gap-*`, `--size-*`, typography families) written in a fenced code block or a markdown table must resolve to a real token in `dist/tokens.css` (or a component-scoped CSS-Override-API knob). A documented-but-nonexistent name is the #512 / #553 phantom-token failure — it silently misleads every consumer who copies it. Enforced by `scripts/lint-mdx-tokens.mjs` (CI: MDX Token Check). Grep `dist/tokens.css` for the correct name rather than guessing.

Naming-pattern placeholders (`--surface-{role}`, `--text-*`, `--size-0…2200`) are not flagged. For a deliberate counter-example — a retired or invented name shown to teach what's wrong — wrap it in `{/* lint-mdx-tokens-ignore-start */}` … `{/* lint-mdx-tokens-ignore-end */}`, or add `lint-mdx-tokens-ignore` on the line.

## Component prop tables

The docs-site prop tables are curated summaries — the full auto-extracted reference lives in Storybook. A curated table can opt into source verification: put `{/* props-check: <PropsType> @ <path/to/Component.tsx> */}` on the line directly above the `| Prop | Type | Default |` header. `scripts/lint-component-props.mjs` (CI: Component Props Check) then verifies every documented prop against the TypeScript source — the prop exists, its type matches (alias or expanded literal union both accepted), and its literal default matches. A page with several tables (Button / LinkButton / IconButton) carries one marker per table, each naming its own props type. Unmarked tables are not checked, so annotate a table when you want its accuracy gated.

## Cross-link pattern

Internal links use absolute docs paths: `[Foundation](/docs/primitives)`. Never `./` or `../`. Storybook lives at `https://storybook.brikdesigns.com` — link out explicitly when referencing visual playground.

When referencing a token, component, or atmosphere, link to the canon page (`/docs/primitives/color`, `/docs/components/button`, `/docs/theming/atmospheres`) rather than restating it inline.

## Allowed Fumadocs components

Use only those already in active use across docs-site:

- `<Callout type="info|warn|error">` from `fumadocs-ui/components/callout`
- `<Cards>` / `<Card title href description>` from `fumadocs-ui/components/card`
- Standard markdown tables for comparisons

Adding a new Fumadocs UI component (tabs, accordions, custom MDX components) is a docs-site infrastructure change — open an issue first. Do not introduce ad-hoc components in a content PR.

## Anti-patterns — do not ship

- New frontmatter fields beyond `title` + `description`
- `####`+ heading depth
- Inline restatement of brand voice rules (point to corpus instead)
- Inline restatement of token names / component props (link to canon page)
- Phantom token names in code blocks / tables — every Semantic-tier token name must resolve in `dist/tokens.css`; mark deliberate counter-examples with `lint-mdx-tokens-ignore` (see "Token names in code blocks and tables")
- "TODO", "WIP", or "Coming soon" callouts as page-body content — use `<Callout type="warn">Status: roadmap.</Callout>` at the top of the page, then write content as if it exists
- Bare triple-backtick code blocks
- Mixing tenets on one page (Foundation / Theming / Motion / Content stay separate per the `index.mdx` four-tenets split)
- Marketing copy ("powerful", "delightful", "seamless"). Match the docs-site register: state what the thing is, what it does, when to reach for it.

## When this standard updates

1. Edit this file (the source of truth)
2. Bump `last-verified` in frontmatter
3. Stage + commit — the pre-commit hook auto-ingests changed standards into brik-rag and updates `scripts/.standards-hashes` (brik-bds#744). CI verifies the hash matches on every PR.
4. Note the change in the PR description

The skill auto-retrieves on `.mdx` edits — no other propagation needed.
