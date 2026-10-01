import manifest from '@brikdesigns/bds/bds-manifest.json';

export const revalidate = false;

// The component + token manifest as data (#2616) — the same artifact
// `scripts/bds-find.mjs` queries locally, so an agent without a checkout can ask
// "does BDS already have a component for this?" against the live version.
//
// Imported through the package's `./bds-manifest.json` export rather than a copy
// that docs-site's `prebuild` writes (#2632). That copy broke the Netlify build
// when #2622 shipped it (reverted in #2623). The export resolves to
// `dist/bds-manifest.json`, which the root `build:lib` writes, and Netlify's
// build command runs that step explicitly. The `@brikdesigns/bds` import in
// app/layout.tsx already takes the same path into `dist/`.
//
// Two-space indent reproduces build-inspector-manifest.mjs's bytes, so the docs
// host and the Storybook host serve the same file.
export async function GET() {
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
