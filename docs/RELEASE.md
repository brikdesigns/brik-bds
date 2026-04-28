# Releasing `@brikdesigns/bds`

BDS is published to **GitHub Packages** at `https://npm.pkg.github.com/` under
the `@brikdesigns` scope. Consumers (`brik-client-portal`, `renew-pms`,
`brikdesigns`, `freedom-client-portal`) install via the same registry — auth
is handled by each repo's `.npmrc` + a `GITHUB_TOKEN` (or scoped PAT).

## When to release

A release is appropriate when one or more of the following are true since the
last published version:

- A new component (or component prop) has landed and a consumer needs it.
- A token name or value changed in `dist/tokens.css`.
- A bug fix to an existing component is needed by a consumer.

If the change is contained inside Storybook docs or to internal scripts, no
release is needed — Chromatic's separate workflow already keeps the docs site
fresh.

## Flow

1. **Land the change on `main`.** Normal PR flow — review, merge, squash.
2. **Bump `package.json` `version`** on `main`. Either as part of the change
   PR (preferred for one-PR-one-release) or in a follow-up PR (acceptable for
   batched releases). Use semver:
   - **patch** (0.45.0 → 0.45.1) — bug fix, no API change
   - **minor** (0.45.0 → 0.46.0) — new component or new prop on existing component
   - **major** (0.45.0 → 1.0.0) — breaking change to a component API or token name
3. **Tag and push.** From the tip of `main`:
   ```bash
   git pull --ff-only
   git tag v0.46.0
   git push origin v0.46.0
   ```
   Or, in a single step before PR:
   ```bash
   npm version minor -m 'chore(release): %s'   # bumps + commits + tags
   git push && git push --tags
   ```
4. **Watch the workflow.** The `Release` workflow at
   `.github/workflows/release.yml` runs on the tag push:
   - Validates that `package.json` version matches the tag.
   - Runs `lint-tokens --errors-only`, `lint-jsdoc`, `validate:blueprints`, `typecheck`.
   - Runs `npm publish` (which triggers `prepublishOnly` → `rm -rf dist && npm run build:lib`).

5. **Bump consumers.** Each consumer needs `npm install @brikdesigns/bds@0.46.0`
   in a follow-up PR. The release workflow's job summary surfaces the exact
   install command.

## Re-running a failed publish

If the workflow fails after `npm publish` ran (e.g. validate passed but a
network blip dropped the publish step), you can either:

- Re-tag with `-1`, `-2` suffix (e.g. `v0.46.0-rerun.1`) — wasteful, avoid.
- Re-run via `Actions → Release → Run workflow → enter version` — this hits
  the tag-already-published guard from npm itself, which is the safe failure
  mode (publish is idempotent on the registry side).

Most recoverable failures show up in `npm run validate` and abort before any
publish — fix the underlying issue, push a new commit, re-tag.

## What got automated when

- **Before 2026-04-28:** publish was a manual `npm publish` from a maintainer's
  laptop. Two recent releases (0.43.0, 0.45.0) were initially missed because
  the maintainer assumed merging the PR also published.
- **2026-04-28:** introduced this workflow (`task/infra-release-workflow`).
  The tag is now the explicit publish gesture — no-tag means no-publish.
