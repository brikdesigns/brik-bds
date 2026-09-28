import manifest from '@/lib/generated/bds-manifest.json';

export const revalidate = false;

// The component + token manifest as data (#2616) — the same artifact
// `scripts/bds-find.mjs` queries locally, so an agent without a checkout can ask
// "does BDS already have a component for this?" against the live version.
//
// Served from a route handler rather than public/, which never reaches the
// Netlify deploy — see the note in scripts/ensure-bds-dist.mjs, which writes the
// imported copy. The static import is what makes the bundler carry the file into
// this route's own output.
//
// Two-space indent reproduces build-inspector-manifest.mjs's bytes, so the docs
// host and the Storybook host serve the same file.
export async function GET() {
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
