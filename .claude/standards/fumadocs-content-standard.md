---
name: Fumadocs content standard (BDS docs-site)
description: Canonical rules for authoring MDX in docs-site/content/docs. Frontmatter shape, IA decision tree, voice pointer, length caps, anti-patterns.
type: reference
scope: brik-bds
applies-to: "**/docs-site/content/docs/**/*.mdx"
retrieved-via: brik-rag query "fumadocs writing standard"
last-verified: 2026-05-11
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

## Heading depth — `##` and `###` only

`#` is reserved for the page title (rendered from frontmatter `title`). Use `##` for sections, `###` for subsections. Do not use `####` or deeper — Fumadocs nav UI does not surface them and readers lose orientation.

If you need a fourth level, split into a new page.

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
- "TODO", "WIP", or "Coming soon" callouts as page-body content — use `<Callout type="warn">Status: roadmap.</Callout>` at the top of the page, then write content as if it exists
- Bare triple-backtick code blocks
- Mixing tenets on one page (Foundation / Theming / Motion / Content stay separate per the `index.mdx` four-tenets split)
- Marketing copy ("powerful", "delightful", "seamless"). Match the docs-site register: state what the thing is, what it does, when to reach for it.

## When this standard updates

1. Edit this file (the source of truth)
2. Re-run `scripts/ingest-fumadocs-standard.sh` to push to brik-rag
3. Bump `last-verified` in frontmatter
4. Note the change in the PR description

The skill auto-retrieves on `.mdx` edits — no other propagation needed.
