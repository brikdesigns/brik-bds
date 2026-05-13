# ADR-009 — Typegen for the component axis matrix

**Status:** Accepted (2026-05-13)
**Related:** ADR-008 (naming canon, closed allowlist), brik-bds#561, brik-bds#560 (manual quick-fix)

## Context

ADR-008 established that **code is the source of truth** for vocabulary. Slot names live in `docs/SLOT-ALLOWLIST.md` (a closed allowlist). But component **variant/appearance/size unions** still lived in two parallel places:

1. `.tsx` type unions — canonical for TypeScript, enforced at compile time
2. Canon MDX (`naming-conventions.mdx` axis matrix) — canonical for humans and RAG

These drift independently. Evidence found in the 2026-05-11 session:

- `Button.tsx` exports 12 `ButtonVariant` values; canon listed 2
- `ChipVariant`/`ChipAppearance` (appearance removed in #554) — canon needed manual update
- `ServiceTag`, `Card`, `AlertBanner`, `Toast` — all had varying degrees of drift

The lint's `invented-variant` rule was **deleted in #557** because canon was provably wrong — agents querying canon would reject a valid `<Button variant="ghost">` as invented. The same failure mode that ADR-008 fixed for slot vocabulary: an open or stale canon is a negative signal, not a positive one.

## Decision

### 1. Generate a manifest from TypeScript types

`scripts/generate-component-axes.mjs` reads every `components/ui/*/*.tsx`, finds exported type aliases whose names end in `Variant | Appearance | Size | Status` (string-literal unions only), and emits `manifest/component-axes.json`.

**Only exported string-literal union types** are captured. Inline prop-interface unions (e.g. `IconButton`'s `variant?:` inline union) are out of scope for this pass — TypeScript already validates them at the call site, and they can be promoted to named exports in a follow-up PR if lint coverage is needed.

### 2. Commit the manifest at `manifest/component-axes.json`

The manifest lives in `manifest/` (alongside `blueprints/blueprint-library.json`) — not in `dist/` — so it's committed without a gitignore exception and available without a build step.

**Why committed rather than always-generated:** lint scripts, RAG ingestion, and any future tooling need the manifest at an arbitrary point in the pipeline, not just during a dedicated build step. Committing it makes the manifest a stable, auditable artefact — the same reason `SLOT-ALLOWLIST.md` is committed rather than derived.

### 3. CI gate: regenerate + diff on every relevant PR

`.github/workflows/component-axes-check.yml` runs `npm run typegen:axes:check` on any PR touching:
- `components/ui/**/*.tsx` — type unions may have changed
- `manifest/component-axes.json` — should only change via the generator
- `scripts/generate-component-axes.mjs` — generator itself changed

If the freshly-generated manifest differs from the committed file, the build fails with a diff showing which components/axes changed. Fix: run `npm run typegen:axes` locally and commit the result.

### 4. Re-introduce `invented-variant` lint rule

`scripts/lint-blueprint-naming.mjs` now reads `manifest/component-axes.json` and flags blueprint files (`.tsx` and `.astro`) that pass a `variant=` value not in the component's declared union.

The rule is **intentionally narrow** — only checks `variant`, only for components present in the manifest, only for static string literals (not template expressions). TypeScript already covers all runtime cases; this catches stale string literals in Astro templates and in comment/JSDoc examples that escape TS checking.

## Alternatives considered

### Regex-based extraction

A regex over `.tsx` files (match `export type \w+Variant = ...`) covers ~95% of the simple cases. Rejected in favour of the TypeScript compiler API because:
- Multi-line unions need special handling
- Parenthesized types, comments, and string-escape edge cases add surface area
- TypeScript is already a dev dependency — using the compiler API adds no new deps and handles all valid TypeScript

### ts-morph

`ts-morph` provides a friendlier wrapper around the compiler API. Rejected because it would add a new dependency for functionality already covered by the native API in TypeScript 5.

### Storybook MCP as source of truth

Storybook exposes component props via the MCP addon. Rejected:
- Requires Storybook to be running — not available in CI or offline
- Storybook derives prop types from the same `.tsx` files — read the source directly instead

### Generate-only (never commit)

Generate fresh at lint/check time, never commit to git. Rejected:
- Lint needs the manifest at pre-commit time — generating it there is slow and requires a full TypeScript parse on every commit
- RAG ingestion needs a stable path to point at — a generated-but-not-committed file has no stable location

### Store in `dist/component-axes.json`

`dist/` is gitignored. A `!dist/component-axes.json` gitignore exception does not work when the parent `dist/` directory is itself ignored. `manifest/` is the clean alternative.

## Consequences

- **Every type-union change requires a manifest update.** The workflow: change the type → `npm run typegen:axes` → commit. Discoverable: CI fails if forgotten.
- **Inline unions are not captured.** `IconButton.tsx` uses an inline union in its props interface, not an exported type alias. TypeScript validates it; the manifest doesn't list it. A follow-up PR can promote it to a named export.
- **New components appear automatically.** As long as they export named `*Variant`/`*Appearance`/`*Size`/`*Status` types, the generator picks them up on the next `typegen:axes` run.
- **Lint is additive.** The `invented-variant` rule produces errors for blueprint files; it does not affect component source files. False positives from complex JSX expressions are avoided by matching only static string literals.

## Maintenance

- **Add a new axis value:** update the type in `.tsx`, run `npm run typegen:axes`, commit.
- **Add a new axis type (e.g. `*Orientation`):** add the suffix to `AXIS_SUFFIXES` in `scripts/generate-component-axes.mjs`, re-run, commit.
- **Audit drift:** `npm run typegen:axes:check` — exits non-zero if any component type has changed without a manifest update.
