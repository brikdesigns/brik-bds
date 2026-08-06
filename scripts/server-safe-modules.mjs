/**
 * server-safe-modules.mjs — the modules published WITHOUT the 'use client'
 * banner, so a Next.js App Router *server* component can read their exports
 * as real values (brik-bds#1721).
 *
 * Single source of truth for two consumers:
 *   - `vite.config.lib.ts`        — decides the per-chunk banner at build time.
 *   - `scripts/check-esm-bundle.mjs` — asserts `dist/` matches at publish time.
 *
 * ── Why this list exists ──────────────────────────────────────────────────
 * 'use client' marks a module as a client boundary. When a SERVER component
 * imports from such a module, React replaces every export with an opaque
 * client reference — a value the server may only pass through to a client
 * component, never read. Per react.dev/reference/rsc/use-client: "the values
 * must either be a React component or supported serializable prop values to be
 * passed to a Client Component. Any other use case will throw an exception."
 *
 * That is exactly right for components (a client reference is what a server
 * component should render) and fatal for plain data. `SOCIAL_ICON_PLATFORMS`
 * reached brik-client-portal's RSC bundle as `typeof 'function'` with
 * `Array.isArray() === false`, so `.includes()` threw — while plain Node-ESM
 * and `tsc` both saw a real array, which is why it cleared every gate we had
 * (brik-bds#1721; worked around in brik-client-portal#2792).
 *
 * ── Adding an entry ───────────────────────────────────────────────────────
 * This is an explicit allowlist, NOT a derived rule. Dropping the banner from
 * a module that touches a client-only React API (useState, createContext, …)
 * breaks SSR with "createContext is not a function" — a failure the static
 * gate cannot see. Add an entry only alongside a green `npm run test:rsc`,
 * which renders real components from a server component and asserts the data
 * exports arrive array-shaped.
 *
 * Names are source-tree-relative paths minus extension — Rollup's `chunk.name`
 * under `preserveModules`.
 */
export const SERVER_SAFE_MODULES = [
  // Pure re-export barrel; calls no React API. With the banner it made the
  // ENTIRE package root a client boundary, so NO data export was readable from
  // a server component. Without it, each re-exported module supplies its own
  // boundary: components stay client references, data stays data.
  'lib-entry',
  // Generated icon registries — SVG markup maps + the platform lists. Pure
  // data, no React import.
  'components/ui/SocialIcon/social-icons.generated',
  'components/ui/ContactIcon/contact-icons.generated',
];

/** `true` if the chunk/module name shipped banner-free. */
export const isServerSafe = (name) => SERVER_SAFE_MODULES.includes(name);
