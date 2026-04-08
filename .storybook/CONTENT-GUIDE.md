# Storybook Content Formatting Standard

Every documentation page in BDS Storybook must follow these rules. No exceptions.

## Page structure

```
# Page Title                     ← One H1 per page. Always first.

Intro paragraph (1-2 sentences). ← Immediately after H1. No blank lines between.

## Section                       ← H2 for major sections.

Section content.

### Subsection                   ← H3 only inside an H2. Never skip to H3 from H1.

Subsection content.
```

## Rules

1. **One H1 per page.** It's the page title. Nothing above it except the `<Meta>` tag.
2. **No dividers.** Never use `---` / `<hr>`. Headings provide structure.
3. **No skipped heading levels.** H1 → H2 → H3. Never H1 → H3.
4. **Intro text is mandatory.** Every page starts with 1-2 sentences explaining what the page covers.
5. **Tables in MDX:** Use markdown tables. Never inline `<table>` HTML.
6. **Tables in TSX stories:** Import shared styles from `stories/foundation/_components/docTableStyles.ts`.
7. **Code blocks:** Always specify a language tag (```css, ```tsx, ```bash).
8. **No emoji in headings.** Keep headings clean and scannable.
9. **Links:** Use relative Storybook paths: `[Label](?path=/docs/category-page--docs)`.

## Token / component documentation pages

Foundation pages (Color, Typography, Spacing, etc.) follow this template:

```
# Token Category Name

What this token category controls and how it fits the system.

## Semantic tokens

[Content — tables, React components, or grids]

### Subcategory (if needed)

[Content]

## Primitives

[Scale tables or visualizations]
```

## Interactive dashboard pages (Health, Coverage, Compliance)

TSX story pages that render dashboards:

- Use `docTable`/`docTh`/`docTd` from `_components/docTableStyles` for all tables
- Section headings rendered as styled `<h2>` elements (not markdown)
- Metric cards use consistent padding/radius tokens
