# RSC smoke gate

Proves `@brikdesigns/bds` is consumable from a Next.js App Router **server
component** — specifically, that its root data exports arrive as real values
rather than opaque client references.

```bash
npm run test:rsc            # pack + install + next build
npm run test:rsc -- --keep  # leave the staged fixture for inspection
```

## Why a whole Next app

`'use client'` marks a module as a client boundary. When a *server* component
imports from such a module, React replaces every export with a client
reference — a value the server may only pass through to a client component,
never read. From [react.dev/reference/rsc/use-client](https://react.dev/reference/rsc/use-client):

> When a server evaluated module imports values from a `'use client'` module,
> the values must either be a React component or supported serializable prop
> values to be passed to a Client Component. Any other use case will throw an
> exception.

That is correct for components and fatal for data. The lib build stamps the
banner on every emitted module ([`vite.config.lib.ts`](../../vite.config.lib.ts)),
which made the whole package root a client boundary, so **no** data export was
readable from a server component.

v0.151.0 shipped `SOCIAL_ICON_PLATFORMS` that way. In brik-client-portal's RSC
bundle it was `typeof 'function'` with `Array.isArray() === false`, so
`.includes()` threw ([#1721](https://github.com/brikdesigns/brik-bds/issues/1721),
worked around in brik-client-portal#2792). It passed every gate in this repo,
because BDS never builds itself as an RSC consumer:

| Gate | Saw |
| --- | --- |
| `tsc` | `SocialIconPlatform[]` ✅ |
| `require()` in plain Node | real array ✅ |
| `import` in plain Node-ESM | real array ✅ |
| vitest | real array ✅ |
| **an actual RSC bundle** | **client reference ❌** |

Only the last row catches it, and only a real Next build produces that row.

## How it works

[`scripts/test-rsc-smoke.sh`](../../scripts/test-rsc-smoke.sh) packs the package
exactly as `npm publish` would, copies `fixture/` to a temp dir, installs the
tarball there, and runs `next build`.

The assertions live in [`fixture/app/page.tsx`](fixture/app/page.tsx) — a server
component (no `'use client'`) that **throws** on violation. `next build`
prerenders it, so a regression fails the build; nothing greps stdout.

It gates both directions:

- **Data must be readable** — `Array.isArray` + length + `.includes` on the
  platform arrays, imported from the package root the way consumers do.
- **Components must still render** — `SocialIcon`, `ContactIcon`, `Button`,
  `Tooltip`, `Accordion` render from the server component. A module that *lost*
  a banner it needed fails here with "createContext is not a function".

The fixture is copied before installing, so the committed tree never gains a
`node_modules/`, a lockfile, or a tarball path in its `package.json`.

## Static counterpart

[`scripts/check-esm-bundle.mjs`](../../scripts/check-esm-bundle.mjs) pins the
banner in `dist/` to the allowlist in
[`scripts/server-safe-modules.mjs`](../../scripts/server-safe-modules.mjs),
in both directions. That is deterministic and near-free, and catches a build-config
regression — but it cannot prove a banner-free module actually works under SSR.
This gate can.

Both run in CI on every PR to `main`. Only the static one is in `prepublishOnly`:
it is hermetic, whereas this gate needs an `npm install` of Next, and putting a
network fetch on the release path buys little when CI already ran it on the same
commit.

## Adding a module to the allowlist

`SERVER_SAFE_MODULES` is an explicit list, not a derived rule. Dropping the
banner from a module that touches a client-only React API (`useState`,
`createContext`, …) breaks SSR in a way the static gate cannot see. So:

1. Add the module name to `scripts/server-safe-modules.mjs` (source-tree path,
   no extension — Rollup's `chunk.name` under `preserveModules`).
2. Import its exports in `fixture/app/page.tsx` and assert on them.
3. `npm run test:rsc` must be green.

## Keeping `next` current

`fixture/package.json` pins `next` to the version brik-client-portal runs, so
the gate tests the bundler the consumer actually uses. When the portal bumps
Next, bump it here too.
