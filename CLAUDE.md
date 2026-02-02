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

## Automated Syncs

GitHub Actions runs daily Figma syncs that update `design-tokens/` files.
Always pull before starting work to get latest tokens:

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

## Don't Edit the Submodule

The copy at `brik-llm/foundations/brik-bds/` is a git submodule.
**Never edit files there directly.** Changes won't persist and cause sync issues.
