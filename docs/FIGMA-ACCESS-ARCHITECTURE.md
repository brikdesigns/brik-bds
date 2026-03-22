# Figma Access Architecture for Brik Designs

**Last Updated:** 2026-02-16
**Status:** DEFINITIVE — This replaces all previous Figma access discussions

---

## The Problem We Keep Solving

Figma Variables REST API requires **Enterprise plan**. We don't have Enterprise. The `/files/{key}/variables/local` endpoint will always return 403, no matter how many tokens we generate.

**This document exists so we stop having this conversation.**

---

## The Solution: 3-Tier Architecture

### Tier 1: figma-talk MCP (PRIMARY for Variables)

**Use for:**
- ✅ Reading Figma Variables (no plan restriction via Plugin API)
- ✅ Canvas manipulation (rare, but supported)
- ✅ Creating/modifying design elements

**Setup:**
```bash
# 1. Start WebSocket server
/Users/nickstanerson/Documents/GitHub/brik-llm/scripts/mcp/mcp-start-figma-server.sh

# 2. Open Figma Desktop → open target file
# 3. Run plugin: Cmd+/ → "Claude Talk to Figma" → "Connect"
# 4. Copy channel ID from plugin
# 5. Give channel ID to Claude → Claude calls mcp__figma-talk__join_channel
```

**When to use:**
- **Variables sync** (weekly or when tokens change)
- Active design work (canvas manipulation)

**Architecture:**
```
Claude Code → figma-talk MCP (stdio) → WebSocket (:3055) → Figma Plugin
```

**Why this works:**
- Figma Plugin API has full access to Variables regardless of plan
- No Enterprise requirement
- Read/write both supported

---

### Tier 2: REST API (for metadata, not Variables)

**Use for:**
- ✅ File metadata (name, last modified, etc.)
- ✅ Component lists
- ✅ Page structure
- ❌ **NOT Variables** (Enterprise-only)

**Setup:**
```bash
# Token in .env (any plan):
FIGMA_ACCESS_TOKEN=figd_...
FIGMA_FILE_KEYS=Rkdc3SIWJUdgoAkeadgZZe,GLi4Xm9q783AniSTY009p5,XEXnuAmnklNKw55kxjvNR5
```

**When to use:**
- Quick file info lookups
- Component/page queries during builds
- Doesn't require Figma Desktop open

**Endpoints that work:**
- `GET /v1/files/{key}` — file metadata
- `GET /v1/files/{key}/components` — component list
- `GET /v1/files/{key}/styles` — style definitions

**Endpoints that DON'T work (Enterprise-only):**
- ~~`GET /v1/files/{key}/variables/local`~~ ← 403 always
- ~~`GET /v1/files/{key}/variables/published`~~ ← 403 always

---

### Tier 3: Native Figma MCP (supplementary)

**Use for:**
- ✅ Quick screenshots
- ✅ Read-only design context
- ⚠️ OAuth expires frequently

**Setup:**
```bash
# Already configured globally
claude mcp list | grep figma
```

**When to use:**
- Quick screenshot grabs during builds
- Supplementary to Tiers 1 & 2
- Not primary workflow

---

## Decision Tree for Claude

```
What do you need?
│
├─ Variables (color, spacing, typography tokens)
│  └─ USE: figma-talk MCP (Tier 1)
│     - Start server, open Figma, connect plugin
│     - Call get_variable_defs or scan file
│     - Export to design-tokens/tokens.json
│
├─ File metadata, component list, page structure
│  └─ USE: REST API (Tier 2)
│     - curl with FIGMA_ACCESS_TOKEN
│     - Fast, no Figma Desktop needed
│
├─ Quick screenshot for reference
│  └─ USE: Native Figma MCP (Tier 3)
│     - mcp__figma__get_screenshot
│     - OAuth may need refresh
│
└─ Canvas manipulation (rare)
   └─ USE: figma-talk MCP (Tier 1)
      - Same setup as Variables
      - Full read/write access
```

---

## Variables Sync Workflow

**Old approach (broken):**
- `scripts/sync-figma.js` → REST API `/variables/local` → 403 Enterprise-only

**New approach (works):**
1. Start figma-talk server + connect plugin (manual, ~30 seconds)
2. Run `scripts/sync-figma-via-plugin.js` (automated)
3. Exports to `design-tokens/tokens.json`
4. Run `npm run transform-tokens` to generate CSS
5. Commit and push

**Frequency:** Weekly or when Variables change in Figma (infrequent)

**Script:** See `/scripts/sync-figma-via-plugin.js` (uses figma-talk MCP)

---

## What NOT to Do

❌ **Don't generate more REST API tokens hoping for `file_variables:read` scope**
→ That scope doesn't exist on non-Enterprise plans. It will never appear in the token creation dialog.

❌ **Don't try to use native Figma MCP for Variables**
→ It's read-only and doesn't expose Variables methods.

❌ **Don't expect daily automated sync**
→ figma-talk requires Figma Desktop open + plugin connected. Best for weekly manual runs.

---

## Files to Update

When Variables change in Figma:
1. Run sync script → updates `design-tokens/tokens.json`
2. `npm run transform-tokens` → updates `css/design-tokens.css`
3. If BDS source tokens change → update `updates/brik-bds.webflow/css/brik-bds.webflow.css`
4. Run `tokens/build.js` → regenerates `tokens/*.css` and `tokens/index.ts`
5. Commit and push
6. Update submodules in downstream projects (client-portal, brik-llm)

---

## Summary

| Need | Tool | Plan Requirement | Automation |
|------|------|------------------|------------|
| **Variables** | figma-talk | Any | Manual trigger |
| File metadata | REST API | Any | Fully automated |
| Screenshots | Native Figma MCP | Any | On-demand |
| Canvas work | figma-talk | Any | Manual |

**The key insight:** Variables require the Plugin API (figma-talk), not the REST API. Stop trying to use REST API tokens for Variables.
