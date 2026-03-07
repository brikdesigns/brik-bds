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

All components use CSS variables from the Webflow export:
- Naming: `--_[category]---[type]--[variant]`
- Example: `--_color---background--brand-primary`

See [tokens/TOKEN-REFERENCE.md](tokens/TOKEN-REFERENCE.md) for complete reference.

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

## Component Completeness Convention

Every component has a **type** that determines what interactive states it needs:

| Type | Components | Required states |
|------|-----------|----------------|
| **Input** | TextInput, TextArea, Select, SearchInput, AddressInput | CSS: `:hover`, `:focus`, `:disabled`, `::placeholder`. Props: `error`, `fullWidth` |
| **Interactive** | Button, FilterButton, Switch, Checkbox, Radio, Accordion, TabBar, Pagination | `:hover`, `:focus`/`:focus-visible`, `:disabled` (CSS or JS) |
| **Display** | Everything else | Storybook story |

**How states are implemented:**
- Inline `CSSProperties` handle base styles (shape, spacing, typography)
- A companion `.css` file handles pseudo-states (`:hover`, `:focus`, `:disabled`) that can't be expressed inline
- Some interactive components use JS-based state handling (onMouseEnter/etc.) — that's fine

**Run the audit anytime:**

```bash
./scripts/component-audit.sh              # Full report
./scripts/component-audit.sh --summary    # Counts only
./scripts/component-audit.sh TextInput    # Single component
```

**Convention for agents:** Run the audit after modifying any component. Fix FAILs before pushing. WARNs are tracked but don't block.

## Don't Edit Submodules

The copies at `brik-llm/foundations/brik-bds/` and `brik-client-portal/brik-bds/` are git submodules.
**Never edit files there directly.** All BDS development happens in this repo. Changes in submodule copies won't persist and cause sync issues.

Consuming projects have sync scripts:
- **Client Portal:** `./scripts/bds-sync.sh` (pulls latest BDS, builds, commits ref)
