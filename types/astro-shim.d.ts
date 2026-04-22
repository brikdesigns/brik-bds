/**
 * Ambient `.astro` module declaration for BDS's own tsc pipeline.
 *
 * The blueprints-astro barrel at content-system/blueprints/astro/index.ts
 * re-exports `.astro` components via relative paths. TypeScript doesn't
 * natively understand the `.astro` file extension, so without this
 * declaration `npm run typecheck` fails on the barrel (TS2307:
 * Cannot find module './HeroSplit6040.astro').
 *
 * This file is INTERNAL to BDS:
 *   - Not listed in package.json `files` → not shipped to consumers.
 *   - Astro consumers inherit a stronger `declare module '*.astro'`
 *     from `astro/client.d.ts` automatically via their tsconfig
 *     preset. The two declarations do not conflict because this one
 *     never reaches consumer compilation.
 *
 * The minimal shape here (`(props) => unknown`) is intentional — BDS's
 * tsc only needs the import to resolve, not to strongly-type the
 * component factory. Consumers get the real Astro component type from
 * Astro's own ambient declarations.
 */
declare module '*.astro' {
  const component: (props: Record<string, unknown>) => unknown;
  export default component;
}
