# Figma Access Architecture for Brik Designs

**Last Updated:** 2026-03-03
**Status:** DEFINITIVE — This replaces all previous Figma access discussions

---

## The Problem We Keep Solving

Figma Variables REST API requires **Enterprise plan**. We don't have Enterprise. The `/files/{key}/variables/local` endpoint will always return 403, no matter how many tokens we generate.

**This document exists so we stop having this conversation.**

---

## The Solution: 3-Tier Architecture

### Tier 1: Tokens Studio Plugin (PRIMARY for Variables)

**Use for:**

- ✅ Syncing Figma Variables to GitHub (one click)
- ✅ W3C DTCG format output (industry standard)
- ✅ Bi-directional sync (pull tokens from GitHub back to Figma)
- ✅ Direct Style Dictionary integration via `@tokens-studio/sd-transforms`

**Setup:**

1. Install [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma)
2. Create GitHub PAT (fine-grained, Contents: Read/Write on `brikdesigns/brik-bds`)
3. Open Foundations file → import Variables → configure GitHub sync
4. Target: repo `brikdesigns/brik-bds`, file `design-tokens/tokens-studio.json`

**When to use:**

- **Variables sync** (after any variable change in Figma)

**Architecture:**

```text
Figma Desktop → Tokens Studio plugin → GitHub API → brikdesigns/brik-bds
  ↓
GitHub Actions → @tokens-studio/sd-transforms → Style Dictionary → auto-commit
```

**Why this works:**

- Tokens Studio uses Plugin API internally (no Enterprise requirement)
- Industry standard — used by Salesforce, GitHub, major design systems
- Native DTCG output feeds directly into Style Dictionary
- Free Starter plan includes single-file GitHub sync
- Replaces figma-talk MCP (no WebSocket servers, no channel IDs)

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
│  └─ USE: Tokens Studio plugin (Tier 1)
│     - Open Figma → run Tokens Studio → Push
│     - GitHub Actions processes automatically
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
   └─ USE: figma-talk MCP (if needed)
      - Start WebSocket server, connect plugin
      - Only for active design work, not token sync
```

---

## Variables Sync Workflow

**Legacy (broken):**

- `scripts/sync-figma.js` → REST API `/variables/local` → 403 Enterprise-only
- figma-talk MCP → fragile WebSocket + channel IDs

**Current approach (works):**

1. Open Figma → run Tokens Studio plugin → Push
2. Tokens Studio pushes DTCG JSON to GitHub (`design-tokens/tokens-studio.json`)
3. GitHub Actions → `@tokens-studio/sd-transforms` → Style Dictionary → auto-commit
4. Downstream projects pull on next submodule update

**Frequency:** After any variable change in Figma

**Docs:** See [VARIABLES-SYNC.md](VARIABLES-SYNC.md)

---

## What NOT to Do

❌ **Don't generate more REST API tokens hoping for `file_variables:read` scope**
→ That scope doesn't exist on non-Enterprise plans. It will never appear in the token creation dialog.

❌ **Don't try to use native Figma MCP for Variables**
→ It's read-only and doesn't expose Variables methods.

❌ **Don't expect fully automated sync (no human action)**
→ Plugin API requires Figma Desktop open. Tokens Studio reduces it to one click — that's the minimum.

---

## Files to Update

When Variables change in Figma:
1. Push via Tokens Studio → updates `design-tokens/tokens-studio.json`
2. GitHub Actions runs `build:sd-figma` → updates `build/figma/`
3. GitHub Actions runs `build:all-tokens` → updates `tokens/*.css` and `tokens/index.ts`
4. Auto-commit and push
5. Update submodules in downstream projects (client-portal, brik-llm)

---

## Summary

| Need | Tool | Plan Requirement | Automation |
|------|------|------------------|------------|
| **Variables** | Tokens Studio plugin | Any | One click in Figma |
| File metadata | REST API | Any | Fully automated |
| Screenshots | Native Figma MCP | Any | On-demand |
| Canvas work | figma-talk | Any | Manual |

**The key insight:** Variables require the Plugin API, not the REST API. Tokens Studio wraps the Plugin API into a one-click GitHub push with native DTCG output. Stop trying to use REST API tokens for Variables.
