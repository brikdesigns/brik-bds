# Figma Variables Sync

**When to run:** After changing Variables in Figma, or when asked to "pull latest tokens"

## How it works

```text
User edits variables in Figma
  ↓
Agent calls Figma MCP get_variable_defs (reads variables directly, no plugin needed)
  ↓
Agent writes MCP output to /tmp/figma-vars.json
  ↓
node scripts/sync-figma-mcp.js /tmp/figma-vars.json --build
  ↓
tokens-studio.json patched → flatten → Style Dictionary → figma-tokens.css + JS + Swift
  ↓
Agent references new tokens in component CSS
```

## Agent workflow (copy-paste ready)

When the user says "pull latest tokens from Figma" or "sync design tokens":

1. Call `mcp__claude_ai_Figma__get_variable_defs` with:
   - `fileKey`: `Rkdc3SIWJUdgoAkeadgZZe` (Brik Foundations)
   - `nodeId`: `0:1` (root — returns all variables used in file)

2. Write the JSON result to `/tmp/figma-vars.json`

3. Run:

```bash
node scripts/sync-figma-mcp.js /tmp/figma-vars.json --build
```

4. Verify changes in `tokens/figma-tokens.css`

5. Reference new tokens in component CSS files

## What the sync script does

`scripts/sync-figma-mcp.js` reads the flat MCP output (`{"color/system/green": "#27ae60", ...}`) and:

1. Walks the nested `tokens-studio.json` structure under `primitives/value`
2. Updates `$value` for existing tokens
3. Adds new tokens with proper DTCG format (`$type`, `$value`, `$extensions`)
4. Reports what changed (updated, added, skipped)
5. With `--build`: runs `npm run build:sd-figma` (flatten + Style Dictionary)

## Flags

```bash
# Preview changes without writing
node scripts/sync-figma-mcp.js /tmp/figma-vars.json --dry-run

# Patch + rebuild in one step
node scripts/sync-figma-mcp.js /tmp/figma-vars.json --build

# Patch only (manual build later)
node scripts/sync-figma-mcp.js /tmp/figma-vars.json
npm run build:sd-figma
```

## Pipeline detail

```text
tokens-studio.json → flatten-tokens-studio.js → tokens-figma.json → Style Dictionary → outputs
```

| Command | Input | Output |
| ------- | ----- | ------ |
| `npm run build:sd-figma` | `design-tokens/tokens-studio.json` | `tokens/figma-tokens.css`, `build/figma/swift/*.swift`, `build/figma/js/tokens.mjs` |
| `npm run build:tokens` | `updates/brik-bds.webflow/css/` | `tokens/variables.css`, `tokens/themes.css`, `tokens/index.ts` |
| `npm run build:all-tokens` | Both sources | Full rebuild (Webflow + Figma) |

## Scoped pulls

For a targeted sync (e.g., only system colors), call `get_variable_defs` on a specific page node instead of `0:1`:

| Page | Node ID | Variables returned |
| ---- | ------- | ------------------ |
| Badge (Indicators) | `26430:5126` | System colors, spacing, typography used by badges |
| Root | `0:1` | All variables referenced anywhere in the file |

## Legacy methods (deprecated)

These are no longer the recommended workflow:

- **Tokens Studio plugin push** — Required opening Figma, opening the plugin, clicking push. Replaced by MCP sync.
- **figma-talk MCP** — Required Figma Desktop + WebSocket + plugin channel. Replaced by native Figma MCP.
- **Manual export + transform** (`npm run sync:figma`) — Required export plugin + transform script. Replaced by MCP sync.

The scripts still exist in the repo for reference but should not be used.

## Downstream projects

After sync, update submodules in projects that reference brik-bds:

```bash
cd /Users/nickstanerson/Documents/GitHub/brik-llm
git submodule update --remote foundations/brik-bds
git add foundations/brik-bds
git commit -m "Update brik-bds submodule"
```
