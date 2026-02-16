# Figma Variables Sync — Step-by-Step Guide

**When to run:** Weekly or when Variables change in Figma (infrequent)

**Time required:** ~2 minutes

---

## Prerequisites

- [ ] Figma Desktop installed
- [ ] figma-talk MCP configured (`claude mcp list | grep figma-talk`)
- [ ] "Claude Talk to Figma" plugin installed in Figma

---

## Step 1: Start figma-talk Server

```bash
/Users/nickstanerson/Documents/GitHub/brik-llm/scripts/mcp/mcp-start-figma-server.sh
```

**Expected output:**
```
figma-talk WebSocket server running on http://localhost:3055
```

**Verify:**
```bash
curl -s http://localhost:3055/status
# Should return: {"status":"ok"}
```

---

## Step 2: Open Figma File

1. Open **Figma Desktop** (not browser)
2. Open any of the 3 BDS files:
   - ❖ Brik Foundations (`Rkdc3SIWJUdgoAkeadgZZe`)
   - ❖ Modern Theme Web Toolkit (`GLi4Xm9q783AniSTY009p5`)
   - ❖ Expressive Theme Web Toolkit (`XEXnuAmnklNKw55kxjvNR5`)

---

## Step 3: Connect Plugin

1. Press **Cmd+/** (or Plugins menu → "Claude Talk to Figma")
2. Click **"Connect"** button in plugin
3. **Copy the channel ID** (looks like: `channel_abc123xyz`)

---

## Step 4: Sync Variables via Claude Code

Open Claude Code in the `brik-bds` repo and run:

```
Please sync Figma Variables to design-tokens/tokens.json:

1. Join figma-talk channel: <PASTE_CHANNEL_ID_HERE>
2. Call mcp__figma-talk__get_variable_defs
3. Export to design-tokens/tokens.json in the expected structure
4. Run npm run transform-tokens
5. Show me a summary of what changed
```

Claude will:
- Join the figma-talk channel
- Read Variables from the open Figma file
- Export to `design-tokens/tokens.json`
- Generate CSS via `transform-tokens` script

---

## Step 5: Verify Output

```bash
# Check tokens were written
cat design-tokens/tokens.json | jq 'keys'

# Check CSS was generated
head -20 css/design-tokens.css
```

Expected: Non-empty JSON with color/spacing/typography tokens, CSS with custom properties.

---

## Step 6: Update BDS Source (if needed)

If the Webflow export (`updates/brik-bds.webflow/css/brik-bds.webflow.css`) needs updating:

```bash
# Manually update brik-bds.webflow.css with new tokens
# OR export fresh CSS from Webflow

# Then regenerate build outputs
cd tokens
node build.js
```

---

## Step 7: Commit and Push

```bash
git add design-tokens/ css/ tokens/
git commit -m "Sync Figma Variables - $(date -u +'%Y-%m-%d')"
git push origin main
```

---

## Step 8: Update Downstream Projects

```bash
# Update submodule in client-portal
cd /Users/nickstanerson/Documents/GitHub/brik-client-portal
git submodule update --remote brik-bds
git add brik-bds
git commit -m "Update brik-bds submodule — Variables sync"
git push

# Update submodule in brik-llm
cd /Users/nickstanerson/Documents/GitHub/brik-llm
git submodule update --remote foundations/brik-bds
git add foundations/brik-bds
git commit -m "Update brik-bds submodule — Variables sync"
git push
```

---

## Troubleshooting

### Plugin won't connect

**Check server is running:**
```bash
lsof -i :3055
# Should show node process
```

**Restart server:**
```bash
pkill -f figma-talk-server
/Users/nickstanerson/Documents/GitHub/brik-llm/scripts/mcp/mcp-start-figma-server.sh
```

### "Channel not found" error

- Make sure you copied the channel ID correctly
- Channel IDs are session-specific — reconnect plugin if it expired

### Tokens JSON is empty

- Verify the Figma file actually has Variables defined
- Try a different file from the 3 BDS files
- Check Figma plugin console for errors (Cmd+Opt+I in Figma)

---

## Why This Workflow?

**Q: Why not automated daily sync like before?**
A: The REST API Variables endpoint requires Enterprise plan ($45/seat/month). Plugin API works on any plan but requires Figma Desktop open + manual connection.

**Q: How often should I run this?**
A: Weekly or when Variables change in Figma. Token changes are infrequent (maybe monthly).

**Q: Can this be scripted?**
A: Partially. The figma-talk connection step is manual, but the export/transform/commit can be scripted once connected.
