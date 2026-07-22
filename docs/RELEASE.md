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

   **Pre-1.0 exception (current policy).** While the version is `0.x`, breaking
   changes ride the **minor** slot (e.g. 0.130.1 → 0.131.0), not a `1.0.0` bump.
   npm 0.x caret ranges (`^0.130.0` resolves `>=0.130.0 <0.131.0`) don't
   auto-upgrade across a 0.x minor, so existing consumers stay pinned until they
   explicitly bump — a breaking change is safe in the minor slot. Reserve `1.0.0`
   for an explicit GA/API-stability decision, not a routine breaking change. Mark
   breaking commits `type(scope)!:`. Precedent: v0.131.0 (NavBar → TopNavigation
   rename, [#1335](https://github.com/brikdesigns/brik-bds/issues/1335)).
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
   - Creates a [GitHub Release](https://github.com/brikdesigns/brik-bds/releases) for
     the tag with auto-generated notes (PRs/commits since the previous tag) plus the
     consumer install command. No manual note-cutting — the tag push is the record
     gesture. Idempotent: re-runs skip an already-created Release.

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
- **2026-06-29:** the workflow now also creates a GitHub Release on tag push
  (#919). The Releases page had nothing newer than v0.68.1 while v0.97.x shipped
  with only a git tag; the tag is now the record gesture too, not just publish.
