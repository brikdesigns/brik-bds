---
name: propagate.sh — version-bump lane for @brikdesigns/bds consumers
description: Why only propagate.sh changes the @brikdesigns/bds version in a consumer, the incident behind it, and what propagate does on its own. Moved out of BDS-CONSUMER.md, where the rule stays.
type: reference
last-verified: 2026-10-21
---

# propagate.sh — version-bump lane

The rule lives in [BDS-CONSUMER.md](../../BDS-CONSUMER.md) § Package: only `scripts/propagate.sh` changes the `@brikdesigns/bds` version in a consumer. This page holds the history and the internals that rule does not need on every turn.

## Incident

A hand-edited bump and the bot's daily bump collided on the same lockfile lines (brikdesigns#1734 / #1738). One lane for bumps removes the collision.

## What propagate does on its own

- Skips a version an open PR already pins.
- Closes older bump PRs the new one supersedes.
- Applies brikdesigns' `bds-unfreeze` label on patch bumps only (brik-bds#2633). Minor and major bumps open without it and wait for a human.

Source: [`scripts/propagate.sh`](../../scripts/propagate.sh).
