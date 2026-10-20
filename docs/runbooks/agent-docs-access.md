# Agent-readable docs surface (no checkout)

Moved from CLAUDE.md. With no BDS checkout, the docs host serves an agent-readable surface (#2616):

- `design.brikdesigns.com/llms.txt` — index
- `design.brikdesigns.com/llms-full.txt` — every page
- `design.brikdesigns.com/docs/<path>.md` — one page
- `design.brikdesigns.com/bds-manifest.json` — component + token data, the same file `scripts/bds-find.mjs` queries
