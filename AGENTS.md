# AGENTS.md

Agent-facing operating notes for `brik-bds`. Authoritative development rules live in [`CLAUDE.md`](CLAUDE.md); standard commands live in [`README.md`](README.md) and the `scripts` block of [`package.json`](package.json).

## Cursor Cloud specific instructions

The startup update script already runs `npm install` (root), `npx playwright install chromium`, and `npm install --prefix docs-site`. Assume those are done — the notes below are the non-obvious runtime caveats.

### Runnable surfaces

- **Storybook (primary)** — `npm run storybook` serves the component library on `http://localhost:6006`. Prefer this over `npm run dev`: `npm run dev` first runs `scripts/start-figma-relay.sh`, which tries to launch a Figma WebSocket relay and needs `bun` + the `_vendor/claude-talk-to-figma-mcp` tool (absent here). It soft-fails and does not block Storybook, but it is noise you don't need for local dev.
- **Docs site** — `cd docs-site && npm run dev` serves the Fumadocs/Next.js guidance site on `http://localhost:3001`. It consumes the parent library via `@brikdesigns/bds": "file:.."`, and its `predev`/`prebuild` hook (`scripts/ensure-bds-dist.mjs`) builds the parent `dist/` once if `dist/content-system/index.js` is missing. That build is not automatic on later runs — after changing components or tokens, run `npm run build:lib` at the repo root so the docs site (and any consumer) picks up the change.

### Tests, lint, build

- `npm test` (vitest) runs two projects: a Node unit project and a Storybook browser project. The browser project drives real component stories through Playwright Chromium — it fails with "Executable doesn't exist" if the Chromium browser isn't installed (the update script installs it). No `playwright install-deps` was needed; system libs already satisfy the headless shell.
- Lightweight checks: `npm run typecheck` and `npm run lint-tokens` (token lint reports pre-existing warnings but exits 0). The full pre-push gate `npm run validate:full` is heavy — it builds Storybook and runs every token/contrast/mdx lint.
- Git hooks (Husky): `pre-commit` runs gitleaks only if `gitleaks` is on PATH (gracefully skipped otherwise) plus token/JSDoc/story lints on staged files; `pre-push` runs an install-freshness guard and `validate:full`. Direct commits to `main`/`staging` are blocked by the pre-commit guard — always work on a branch.

### Not runnable here

- `npm run chromatic` needs the 1Password CLI (`op`) signed in with a Chromatic token via `.env.op`; it cannot run in this environment without that secret.
