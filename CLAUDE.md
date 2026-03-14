# BDS React Component Library

This is the **source of truth** for the Brik Design System React components.

## Repository Architecture

```
/Documents/GitHub/
├── brik-llm/foundations/brik-bds/  ← SUBMODULE (read-only mirror)
└── brik-bds/                        ← THIS REPO (active development)
```

**Development happens HERE**, not in the brik-llm submodule.

## Key Paths

| Path | Purpose |
|------|---------|
| `components/ui/` | React components (Button, Badge, Card, etc.) |
| `components/providers/` | ThemeProvider context |
| `.storybook/` | Storybook configuration |
| `tokens/` | Token documentation and build scripts |
| `updates/brik-bds.webflow/` | Webflow CSS export (source of tokens) |

## Workflow

1. **Develop** in this repo (`/Documents/GitHub/brik-bds/`)
2. **Commit and push** to GitHub
3. **Update submodule** in brik-llm when needed:
   ```bash
   cd /Users/nickstanerson/Documents/GitHub/brik-llm
   git submodule update --remote foundations/brik-bds
   git add foundations/brik-bds
   git commit -m "Update brik-bds submodule"
   ```

## Figma Variables Sync

**IMPORTANT:** Figma Variables REST API requires Enterprise plan. We don't have it.

**Sync method:** figma-talk MCP (Plugin API works on any plan)
**Frequency:** Weekly or when Variables change in Figma (infrequent)
**Guide:** See [VARIABLES-SYNC.md](VARIABLES-SYNC.md) for step-by-step instructions
**Architecture:** See [FIGMA-ACCESS-ARCHITECTURE.md](FIGMA-ACCESS-ARCHITECTURE.md)

The old automated sync via GitHub Actions is disabled (it was always failing with 403 Enterprise-required).

Always pull before starting work:
```bash
git pull origin main
```

## Storybook

```bash
npm run storybook
```

Runs at http://localhost:6006. Theme switching available in toolbar.

## Token System

### Two naming conventions (don't confuse them)

| Convention | Example | Where used | Source |
| --- | --- | --- | --- |
| **Webflow semantic** | `--_color---text--primary` | `tokens/variables.css`, `tokens.ts` | Webflow CSS export |
| **Figma single-dash** | `--text-primary`, `--label-tiny` | `tokens/figma-tokens.css`, component CSS | Style Dictionary from Figma |

BDS components use **Figma single-dash** names in their CSS files. Consuming projects import `figma-tokens.css` to define these variables at runtime.

The portal's `tokens.ts` maps Webflow semantic names to `var()` references — this is the TypeScript consumption layer. The CSS layer underneath (`figma-tokens.css`) provides the actual computed values.

### Token build pipeline

```
Figma Variables → Tokens Studio JSON → Style Dictionary → per-platform outputs
```

| Command | Input | Output |
| --- | --- | --- |
| `npm run build:sd-figma` | `design-tokens/tokens-studio.json` | `tokens/figma-tokens.css`, `build/figma/swift/*.swift`, `build/figma/js/tokens.mjs` |
| `npm run build:tokens` | `updates/brik-bds.webflow/css/` | `tokens/variables.css`, `tokens/themes.css`, `tokens/index.ts` |
| `npm run build:all-tokens` | Both | Full rebuild |

### Token files — which to use

| File | Status | Use |
| --- | --- | --- |
| `tokens/figma-tokens.css` | **Active** (auto-generated) | Import in consuming project `globals.css` |
| `tokens/fonts.css` | **Active** (manual) | Import in consuming project `globals.css` |
| `tokens/react-tokens.css` | **DEPRECATED** | Was manually maintained, drifted. Use `figma-tokens.css` |
| `tokens/webflow-tokens.css` | **Webflow only** | Circular refs, 8 theme blocks — never import in React |
| `tokens/variables.css` | **Internal** | Webflow semantic names, used by `tokens/index.ts` |

### Adding a new token

1. Add in Figma Variables
2. Export via Tokens Studio → `design-tokens/tokens-studio.json`
3. Run `npm run build:sd-figma` — updates `figma-tokens.css` automatically
4. If the component CSS references it, consuming projects get it on next `bds-sync.sh`

**Never manually add tokens to CSS files.** Style Dictionary is the single build path.

See [tokens/TOKEN-REFERENCE.md](tokens/TOKEN-REFERENCE.md) for complete reference.
See [CONSUMING-TOKENS.md](CONSUMING-TOKENS.md) for the consumption pattern in app projects.

## Spacing Modes

Storybook uses **Base mode** (overridden in `storybook-overrides.css`).
Webflow uses **Spacious mode** by default on `.body` class.

| Token | Base | Spacious |
|-------|------|----------|
| `--_space---lg` | 16px | 52px |

## Consuming tokens in app projects

Any project using brik-bds as a submodule (portals, dashboards, tools) MUST follow the token consumption pattern documented in [CONSUMING-TOKENS.md](CONSUMING-TOKENS.md).

**Key rule:** Never write raw CSS `var()` strings inline. Import from `@/lib/tokens` and `@/lib/styles`.

**Required files in every consuming project:**
1. `src/lib/tokens.ts` - Figma style name to CSS var() mapping
2. `src/lib/styles.ts` - Composed CSSProperties presets
3. `src/components/prose.tsx` - Shared markdown renderer
4. `.husky/pre-commit` - Token compliance gate (blocks hardcoded px values)

**Reference implementation:** brik-client-portal

## Don't Edit the Submodule

The copy at `brik-llm/foundations/brik-bds/` is a git submodule.
**Never edit files there directly.** Changes won't persist and cause sync issues.
