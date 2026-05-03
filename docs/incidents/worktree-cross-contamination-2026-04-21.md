# Worktree cross-contamination — 2026-04-21 (Phase B)

**Status:** resolved (rule encoded as session-start + pre-tool-use hook in [`.claude/hooks/worktree-check.sh`](../../.claude/hooks/worktree-check.sh)). Linked from [`brik-bds/CLAUDE.md` § STOP — Worktree Rules](../../CLAUDE.md).

**Pattern:** the primary worktree at `/Documents/GitHub/brik/brik-bds` switched onto a `task/*` branch instead of staying on `main`, so a second concurrent agent session pulled the wrong branch's working tree and committed against it.

## Incident

| Date | PR / branch | What | Outcome |
|------|-------------|------|---------|
| 2026-04-21 | brik-bds [#169](https://github.com/brikdesigns/brik-bds/pull/169) (Phase B story-shape migration) | Primary worktree was switched to `task/storybook-shape-migration-wip`. A parallel session opened in the same primary, picked up that working tree, and committed unrelated changes onto the wrong branch. The mixup surfaced during PR review when files outside the migration scope appeared in the diff. | PR commentary captures the timeline; rule was hardened into a `worktree-check.sh` hook (warn) with `BDS_WORKTREE_GUARD=strict` opt-in (block). |

## Why this happened

Three reinforcing pressures:

1. **Primary worktrees are the default** for IDE / shell sessions — when an agent created a feature branch, switching the primary onto it (instead of spawning a worktree) was the path of least resistance.
2. **Worktrees were optional in tooling** until the `new-task.sh` script added a hard refusal to run from anywhere but the primary on main.
3. **Concurrent sessions share the primary's filesystem state** — a second Claude Code window on the same repo sees whatever branch the primary is currently on, with no signal that work is in progress elsewhere.

## What changed

- [`scripts/new-task.sh`](../../scripts/new-task.sh) now refuses to spawn a task unless invoked from the primary on `main` — branch + worktree work happens in `../brik-bds-worktrees/{slug}` automatically.
- [`.claude/hooks/worktree-check.sh`](../../.claude/hooks/worktree-check.sh) fires on `SessionStart` + `PreToolUse` and warns if the primary is not on `main`. Set `BDS_WORKTREE_GUARD=strict` to make it blocking.
- The same guard ships in every BDS-consumer repo (portal, renew-pms, brikdesigns) — drift in one repo doesn't propagate.

## Open follow-ups

- Env-var rename `BDS_WORKTREE_GUARD` → consistent cross-repo name tracked separately in [brik-llm#100](https://github.com/brikdesigns/brik-llm/issues/100). Decision pending — `BDS_` prefix is currently the de facto canonical name across 4 of 5 hooks.
