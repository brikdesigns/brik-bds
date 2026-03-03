# Figma Variables Sync

**When to run:** After changing Variables in Figma

**Time required:** ~30 seconds (one click + auto-commit)

## How it works

```
You change variables in Figma
  ↓
Open Tokens Studio plugin → Push to GitHub
  ↓
Tokens Studio pushes DTCG JSON to brikdesigns/brik-bds (design-tokens/tokens-studio.json)
  ↓
GitHub Actions: @tokens-studio/sd-transforms → Style Dictionary → CSS + TS
  ↓
Auto-commit: "Sync Figma Variables — YYYY-MM-DD"
  ↓
Downstream projects pull on next submodule update
```

## One-time setup

### 1. Install Tokens Studio plugin

1. Open [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma)
2. Click "Install"

### 2. Create GitHub PAT

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) → Fine-grained token
2. **Name:** `tokens-studio-bds`
3. **Resource owner:** `brikdesigns`
4. **Repository access:** Only select repositories → `brik-bds`
5. **Permissions:** Contents → Read and Write
6. Copy the token immediately

### 3. Import existing variables

1. Open Brik Foundations file in Figma Desktop
2. Run Tokens Studio: Cmd+/ → "Tokens Studio"
3. Select "New empty file" if prompted
4. Go to **Settings** → change Token Format to **W3C DTCG**
5. Click **Styles & Variables** → **Import Variables** → import all collections
6. Review the diff → confirm

### 4. Configure GitHub sync

1. In the plugin → sync settings → Add new → **GitHub**
2. **Name:** `brik-bds`
3. **PAT:** paste the token from step 2
4. **Repository:** `brikdesigns/brik-bds`
5. **Branch:** `main`
6. **File path:** `design-tokens/tokens-studio.json`
7. Push to sync — verify the commit appears on GitHub

## Sync workflow

1. Make variable changes in Figma
2. Open Tokens Studio plugin → Push
3. Done

GitHub Actions handles:
- `@tokens-studio/sd-transforms` — preprocesses Tokens Studio output
- `style-dictionary build` — multi-platform outputs (CSS, JS, iOS, Android)
- `tokens/build.js` — CSS variables + TypeScript types
- Auto-commit if changes detected

## Local commands

```bash
# Build Figma tokens locally (after Tokens Studio push)
npm run build:sd-figma

# Full Webflow CSS token rebuild
npm run build:all-tokens

# Legacy: transform manual Figma export + compare
npm run sync:figma:check
```

## Alternative: Manual export (no Tokens Studio)

If Tokens Studio isn't set up, you can export manually:

1. In Figma, use variables-utilities plugin → Export Variables
2. Save output to `figma-variables.json` in repo root
3. Run locally:

```bash
node scripts/transform-figma-export.js --input figma-variables.json --compare
npm run build:all-tokens
```

4\. Commit and push

## Update downstream projects

After sync, update submodules in projects that reference brik-bds:

```bash
# brik-llm
cd /Users/nickstanerson/Documents/GitHub/brik-llm
git submodule update --remote foundations/brik-bds
git add foundations/brik-bds
git commit -m "Update brik-bds submodule"
git push
```

## FAQ

**Q: Why not fully automated (no click at all)?**
A: Figma Variables REST API requires Enterprise plan ($45/seat/mo). The Plugin API (which Tokens Studio uses internally) works on any plan but needs a user action in Figma to trigger the export. One click is the minimum.

**Q: How often should I sync?**
A: After any variable change in Figma. Token changes are infrequent (typically monthly).

**Q: What if Figma and Webflow CSS drift apart?**
A: Run `npm run sync:figma:check` to compare. The script shows which tokens exist in one source but not the other.

**Q: Is Tokens Studio free?**
A: Yes. The free Starter plan includes single-file GitHub sync — that's all we need. Multi-file sync (folder) is a paid feature.

**Q: What's the difference between `build:sd` and `build:sd-figma`?**
A: `build:sd` processes tokens from Webflow CSS (current source of truth). `build:sd-figma` processes tokens from Figma via Tokens Studio. Both output via Style Dictionary.
