# brik-bds

Brik Design System — React component library + canonical token registry.

Hosts:

- React components (`components/ui/`) published as `@brikdesigns/bds` and consumed by 6 downstream repos
- Canonical token registry — `dist/tokens.css` is the live allowlist for every `--text-*` / `--surface-*` / `--background-*` / `--border-*` / `--color-*` (primitives) name in any Brik repo
- Style Dictionary build pipeline — Figma → `tokens-studio.json` → per-platform outputs
- Brik Content System (`content-system/`) — vocabulary peer to the token system, published as `@brikdesigns/bds/content-system`
- Storybook + Chromatic — `localhost:6006` for in-repo dev (Storybook MCP is dev-only); the hosted build is human-facing (a client-rendered SPA). Consumer-repo agents read BDS from **source**, not over the network → § Reading BDS from a consumer repo

This CLAUDE.md is `@import`-ed by every consumer of `@brikdesigns/bds` — the BDS rules below load into portal / renew / freedom / web/{slug}/ sessions too.

## brik-bds specifics

- **Active dev** — `~/Documents/GitHub/brik/brik-bds/`. NEVER edit the read-only mirror at `brik-llm/foundations/brik-bds/`.
- **Canon for CSS** — INVOKE the `canon-css` / `validate-token-names` skill before writing any `--text-*` / `--surface-*` / `--background-*` / semantic `--border-*` declaration. `dist/tokens.css` is the only authority.
- **Tokens in TS/TSX** — IMPORT from `@/lib/tokens` and `@/lib/styles`. NEVER write raw `var(--...)` strings inline.
- **Component composition** — USE Radix UI primitives (`@radix-ui/react-*`) for a11y behavior; BDS owns styling. NEVER use shadcn/ui or other CSS-variable libraries.
- **Pre-implementation** — BUILD new / composite components in Storybook + code with tokens (Storybook + the coded component are the source of truth; Figma is the *token* source, NOT a component-layout gate; Paper is for client sites, NEVER BDS). PREFER nesting existing primitives over new components → [component-build](.claude/standards/component-build.md).
- **Pre-PR** — RUN `./scripts/pr-checklist.sh` before any PR touching tokens, themes, or component CSS. ONE concern per PR.
- **Publish** — `git tag v0.X.Y && git push origin v0.X.Y` triggers [`Release` workflow](.github/workflows/release.yml). After publish, UPDATE the brik-llm submodule pointer.
- **Chromatic = hosting, NOT a visual gate** — RUN `npm run chromatic` after any component CSS or story change; it only publishes the Storybook and is NOT an agent read path. NEVER treat a green Chromatic check as visual coverage — a quota-exhausted build still exits 0 → [`.claude/references/chromatic.md`](.claude/references/chromatic.md), `→ rag:chromatic`.
- **Reading BDS from a consumer repo** (portal / `web/{slug}/` agents) — there is no hosted MCP/HTTP path that yields rendered docs; READ component docs/props from **source**: the sibling `~/Documents/GitHub/brik/brik-bds/` (`components/ui/**/*.{mdx,tsx,css}`) or `node_modules/@brikdesigns/bds/components/`. NEVER hand-roll a primitive because the docs "weren't reachable" → `→ rag:bds-docs-access`.
- **Visual regression** — a self-hosted Vitest `toMatchScreenshot` gate (`VISUAL_GATE=1`) runs on every PR to `main` via [`visual.yml`](.github/workflows/visual.yml) and is a **required status check** — a red `visual` blocks merge, no merge-wait discipline needed (#2077). NEVER regenerate baselines locally; run the **Update Visual Baselines** workflow → [`tests/visual/README.md`](tests/visual/README.md).

## Where deeper context lives

- **Documentation system** (tier table, mental model, lifecycle, decision tree) → [`docs-site/content/docs/getting-started/documentation-system.mdx`](docs-site/content/docs/getting-started/documentation-system.mdx) — published at design.brikdesigns.com/docs/getting-started/documentation-system
- **Token system vocabulary** (the six locked concepts: Anatomy / Tier / Library / Layer / Mode / Tenet) → [Token Anatomy](docs-site/content/docs/foundation/token-anatomy.mdx) → published at design.brikdesigns.com/docs/foundation/token-anatomy. Read first before referencing any token.
- **Build standards** (six composition layers: Section→Layout→Container→Block/Control→Component; page structure + slot anatomy) → [Composition Layers](docs-site/content/docs/build-standards/composition-layers.mdx) + [Page Structure](docs-site/content/docs/build-standards/page-structure.mdx). Consult before composing any page/component; corpus: `brik-rag query "composition layers page structure" --source-types canon-build-standards`.
- **Product page archetypes** (the four assembled product pages: record read, record edit, collection, profile — which one a surface gets, and per-archetype composition, state shell, and heading ramp) → [Page Archetypes](docs-site/content/docs/build-standards/page-archetypes/index.mdx). Consult before building any product page; the docs-site pages own the decision, Storybook's `Containers/read-mode-page` owns the live canvases + the two section-level edit conventions.
- **Library Architecture** (Foundations Library vs Brand Kit Library + multi-Library Style Dictionary pull) → [Figma Library Architecture](docs-site/content/docs/getting-started/figma-library-architecture.mdx)
- **Token discipline** (semantic categories, service-token isolation, drift patterns) → `brik-rag query "token discipline"`
- **Color pairings** (which `--text-*` is WCAG-safe on which surface — brand + service tiers, both themes; the source-of-truth dataset `tokens/contrast-pairings.json`; the `npm run contrast-gate` CI check) → [Color Pairings](docs-site/content/docs/foundation/color-pairings.mdx). Consult before pairing a foreground/background or fixing contrast — never hand-edit HEX at the consumer layer.
- **Token PR checklist** → [`docs/TOKEN-PR-CHECKLIST.md`](docs/TOKEN-PR-CHECKLIST.md)
- **Release procedure** → [`docs/RELEASE.md`](docs/RELEASE.md)
- **Component build rules** → [`.claude/standards/component-build.md`](.claude/standards/component-build.md) — auto-retrieved by the [`component-build`](.claude/skills/component-build/SKILL.md) skill on `components/ui/**/*.{tsx,css}` edits
- **Storybook story shape** → [`.claude/standards/storybook-story-shape.md`](.claude/standards/storybook-story-shape.md) + [ADR-006](docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md) (taxonomy + two-shape decision) + [ADR-010](docs/adrs/ADR-010-storybook-axes-of-information.md) (story-vs-control matrix) — auto-retrieved by [`storybook-story-shape`](.claude/skills/storybook-story-shape/SKILL.md) on `*.stories.tsx` edits
- **Storybook MDX recipe** → [`.claude/standards/storybook-mdx-recipe.md`](.claude/standards/storybook-mdx-recipe.md) + [ADR-007](docs/adrs/ADR-007-storybook-page-recipe.md) — auto-retrieved by [`storybook-mdx-recipe`](.claude/skills/storybook-mdx-recipe/SKILL.md) on `*.mdx` edits; lint enforced via `scripts/lint-storybook-recipe.js`
- **Storybook toolbar globals** → [`.claude/standards/storybook-toolbar-globals.md`](.claude/standards/storybook-toolbar-globals.md) — auto-retrieved by [`storybook-toolbar-globals`](.claude/skills/storybook-toolbar-globals/SKILL.md) on `.storybook/preview.tsx` / `main.ts` edits
- **BCS authoring + discipline** → [`content-system/README.md`](content-system/README.md)
- **Cascade + React composition** → [`tokens/CASCADE.md`](tokens/CASCADE.md) + design.brikdesigns.com docs
- **ADRs** → [`docs/adrs/`](docs/adrs/) (component bloat, addable-list family, storybook taxonomy)
- **References** → [`.claude/references/`](.claude/references/) (Chromatic URLs + App ID)
