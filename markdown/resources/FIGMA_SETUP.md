# Figma Integration Setup Guide

This guide covers Figma integration for both **Claude Code MCP access** and the **Figma → GitHub → Webflow pipeline**.

## Overview

The integration provides:
- **Claude Code MCP**: Direct access to Figma files for CSS extraction, design inspection, etc.
- **Figma to GitHub**: Automatic sync of design tokens from multiple files
- **Figma to Webflow**: Direct plugin integration
- **GitHub to Webflow**: Automated deployment

---

## Part 1: Claude Code MCP Setup (AI Assistant Access)

This allows Claude Code to access Figma directly in any project.

### Global MCP Configuration

Create `~/.mcp.json` in your home directory:

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    },
    "figma-desktop": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    },
    "webflow": {
      "type": "sse",
      "url": "https://mcp.webflow.com/sse"
    },
    "notion": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "<your-notion-token>"
      }
    }
  }
}
```

### Configuration Hierarchy

| Location | Scope |
|----------|-------|
| `~/.mcp.json` | All projects (global) |
| `<project>/.mcp.json` | Single project (overrides global) |

### Figma Authentication

Figma MCP uses OAuth - no manual token management needed:
1. On first use, Claude Code will prompt for Figma authorization
2. Authorize via Figma's OAuth flow
3. Token is managed automatically by the MCP server

### Figma Desktop Plugin (Optional)

For `figma-desktop` MCP to work:
1. Install the Figma desktop app
2. Install the "Claude Talk to Figma" plugin
3. The plugin runs a local server on `127.0.0.1:3845`

### After Setup

Reload VSCode (`Cmd+Shift+P` → "Developer: Reload Window") to activate MCP servers.

---

## Part 2: Figma File Keys

### Current Brik Files

| File | Key |
|------|-----|
| Brik Brand Toolkit | `7uPDq1zzZVoEdBe7PTauRS` |
| Brik Foundations | `Rkdc3SIWJUdgoAkeadgZZe` |

### Finding File Keys

1. Open your Figma file
2. Copy the URL: `https://www.figma.com/design/abc123def456/My-Design`
3. The file key is `abc123def456`

---

## Part 3: GitHub Actions Pipeline

### Required GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions**:

| Secret | Description |
|--------|-------------|
| `FIGMA_ACCESS_TOKEN` | Personal access token from Figma settings |
| `FIGMA_FILE_KEYS` | Comma-separated file keys |
| `WEBFLOW_API_TOKEN` | Your Webflow API token |
| `WEBFLOW_SITE_ID` | Your Webflow site ID |

### Generating a Figma Access Token

1. Go to Figma → Settings → Account → Personal access tokens
2. Click "Generate new token"
3. Copy and save securely (shown only once)
4. Add to GitHub Secrets as `FIGMA_ACCESS_TOKEN`

---

## Part 4: Figma Plugins

### Figma to Webflow (Primary)

1. Go to [webflow.com/figma-to-webflow](https://webflow.com/figma-to-webflow)
2. Click "Install plugin"
3. In Figma: Plugins → Figma to Webflow
4. Authorize your Webflow account

### Tokens Studio (Optional)

For design token synchronization with GitHub:
1. Install [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/Tokens-Studio-for-Figma)
2. Configure GitHub sync in plugin settings

---

## Part 5: Local Development

### Setup

```bash
git clone https://github.com/brikdesigns/brik-bds.git
cd brik-bds
npm install
```

### Environment File

Create `.env` (do not commit):

```bash
FIGMA_ACCESS_TOKEN=<your-token>
FIGMA_FILE_KEYS=7uPDq1zzZVoEdBe7PTauRS,Rkdc3SIWJUdgoAkeadgZZe
```

### Commands

```bash
npm run sync-figma          # Sync Figma designs to tokens
npm run transform-tokens    # Transform tokens to CSS
npm run sync-and-transform  # Do both
```

---

## Part 6: Workflow Automation

### Automatic Sync
- Design tokens sync daily at 9 AM UTC
- Changes create pull requests for review
- Merged changes trigger Webflow deployment

### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **"Sync Figma Designs"** workflow
3. Click **"Run workflow"**

---

## File Structure

```
brik-bds/
├── design-tokens/          # Auto-synced from Figma
│   ├── tokens.json
│   └── metadata.json
├── css/
│   └── design-tokens.css   # Auto-generated CSS variables
├── scripts/
│   ├── sync-figma.js
│   └── transform-tokens.js
└── .github/workflows/
    └── figma-sync.yml
```

---

## Troubleshooting

### Claude Code MCP Issues

| Issue | Solution |
|-------|----------|
| MCP tools not appearing | Reload VSCode after creating `~/.mcp.json` |
| Figma auth prompt every session | Re-authorize via OAuth flow |
| "Token expired" error | Generate new token in Figma settings, update GitHub Secrets |

### Pipeline Issues

| Issue | Solution |
|-------|----------|
| "No Figma file keys provided" | Check `FIGMA_FILE_KEYS` secret in GitHub |
| "Authentication failed" | Regenerate Figma access token |
| "No design tokens found" | Run `npm run sync-figma` first |

---

## Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma to Webflow Plugin](https://webflow.com/figma-to-webflow)
- [Tokens Studio Documentation](https://docs.tokens.studio/)
- [Webflow API Documentation](https://developers.webflow.com/)

---

**Last updated**: January 2025
