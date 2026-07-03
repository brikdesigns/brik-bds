# brik-bds

Brik Design System — React component library + canonical token registry.

Hosts:

- React components (`src/components/`) published as `@brikdesigns/bds` and consumed by 6 downstream repos
- Canonical token registry — `dist/tokens.css` is the live allowlist for every `--text-*` / `--surface-*` / `--background-*` / `--border-*` name in any Brik repo
- Style Dictionary build pipeline — Figma → `tokens-studio.json` → per-platform outputs
- Brik Content System (`content-system/`) — vocabulary peer to the token system, published as `@brikdesigns/bds/content-system`
- Storybook + Chromatic — `localhost:6006` for in-repo dev, hosted Chromatic MCP for consumer-repo agents

This CLAUDE.md is `@import`-ed by every consumer of `@brikdesigns/bds` — the BDS rules below load into portal / renew / freedom / web/{slug}/ sessions too.

## brik-bds specifics

- **Active dev** — `~/Documents/GitHub/brik/brik-bds/`. NEVER edit the read-only mirror at `brik-llm/foundations/brik-bds/`.
- **Canon for CSS** — INVOKE the `canon-css` / `validate-token-names` skill before writing any `--text-*` / `--surface-*` / `--background-*` / semantic `--border-*` declaration. `dist/tokens.css` is the only authority.
- **Tokens in TS/TSX** — IMPORT from `@/lib/tokens` and `@/lib/styles`. NEVER write raw `var(--...)` strings inline.
- **Component composition** — USE Radix UI primitives (`@radix-ui/react-*`) for a11y behavior; BDS owns styling. NEVER use shadcn/ui or other CSS-variable libraries.
- **Pre-implementation** — BUILD new / composite components directly in Storybook + code with tokens; Storybook + the coded component are the component source of truth. Figma is the *token* source of truth, NOT a component-layout gate. Paper is for website / client builds, NEVER BDS components. BDS is modular by design: prefer nesting existing primitives (token-sized to fit any container — card, list row, table cell) over new components.
- **Pre-PR** — RUN `./scripts/pr-checklist.sh` before any PR touching tokens, themes, or component CSS. ONE concern per PR.
- **Publish** — `git tag v0.X.Y && git push origin v0.X.Y` triggers [`Release` workflow](.github/workflows/release.yml). After publish, UPDATE the brik-llm submodule pointer.
- **Chromatic** — RUN `npm run chromatic` after any component CSS or story change; local Storybook is not reachable from consumer-repo agents. The script authenticates the Chromatic token via `op run --env-file=.env.op` (the inline `op://`-ref form does not resolve in headless/detached agent sessions — see #1058); requires the 1Password CLI signed in.

## Where deeper context lives

- **Documentation system** (tier table, mental model, lifecycle, decision tree) → [`docs-site/content/docs/getting-started/documentation-system.mdx`](docs-site/content/docs/getting-started/documentation-system.mdx) — published at design.brikdesigns.com/docs/getting-started/documentation-system
- **Token system vocabulary** (the six locked concepts: Anatomy / Tier / Library / Layer / Mode / Tenet) → [Token Anatomy](docs-site/content/docs/primitives/token-anatomy.mdx) → published at design.brikdesigns.com/docs/primitives/token-anatomy. Read first before referencing any token.
- **Library Architecture** (Foundations Library vs Brand Kit Library + multi-Library Style Dictionary pull) → [Figma Library Architecture](docs-site/content/docs/getting-started/figma-library-architecture.mdx)
- **Token discipline** (semantic categories, service-token isolation, drift patterns) → `brik-rag query "token discipline"`
- **Color pairings** (which `--text-*` is WCAG-safe on which surface — brand + service tiers, both themes; the source-of-truth dataset `tokens/contrast-pairings.json`; the `npm run contrast-gate` CI check) → [Color Pairings](docs-site/content/docs/primitives/color-pairings.mdx). Consult before pairing a foreground/background or fixing contrast — never hand-edit HEX at the consumer layer.
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
