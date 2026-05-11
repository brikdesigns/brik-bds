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
- **Pre-implementation** — DESIGN composite / new components in Paper before writing code. SKIP for simple variants of existing components or clear Figma specs.
- **Pre-PR** — RUN `./scripts/pr-checklist.sh` before any PR touching tokens, themes, or component CSS. ONE concern per PR.
- **Publish** — `git tag v0.X.Y && git push origin v0.X.Y` triggers [`Release` workflow](.github/workflows/release.yml). After publish, UPDATE the brik-llm submodule pointer.
- **Chromatic** — RUN `npm run chromatic` after any component CSS or story change; local Storybook is not reachable from consumer-repo agents.

## Where deeper context lives

- **Token discipline** (3-layer architecture, semantic categories, service-token isolation) → `brik-rag query "token discipline"`
- **Token PR checklist** → [`docs/TOKEN-PR-CHECKLIST.md`](docs/TOKEN-PR-CHECKLIST.md)
- **Release procedure** → [`docs/RELEASE.md`](docs/RELEASE.md)
- **Storybook + story shape** → [`docs/STORYBOOK-WRITING-GUIDE.md`](docs/STORYBOOK-WRITING-GUIDE.md) + [ADR-006](docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md)
- **Component patterns + Paper** → [`docs/COMPONENT-PATTERNS.md`](docs/COMPONENT-PATTERNS.md)
- **BCS authoring + discipline** → [`content-system/README.md`](content-system/README.md)
- **Cascade + React composition** → [`tokens/CASCADE.md`](tokens/CASCADE.md) + design.brikdesigns.com docs
- **ADRs** → [`docs/adrs/`](docs/adrs/) (component bloat, addable-list family, storybook taxonomy)
- **References** → [`.claude/references/`](.claude/references/) (Chromatic URLs + App ID)
