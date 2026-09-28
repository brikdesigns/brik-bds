import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brikdesigns/bds'],
  async rewrites() {
    return [
      // Per-page Markdown for agents (#2616). `/docs/foundation/color.md`
      // serves the same page as Markdown instead of the rendered SPA. The
      // `content.md` segment is what the route handler slices off to recover
      // the page slug.
      //
      // Redirects win over this rewrite — measured on Next 16.3.4, and true
      // even when it is declared in `beforeFiles`. That is why every renamed
      // page below needs an explicit `.md` twin: `path-to-regexp` does not stop
      // at the dot, so the `/docs/primitives/:slug*` wildcard swallows
      // `/docs/primitives/shadow.md` and 308s it to a URL with no page behind it.
      {
        source: '/docs/:slug*.md',
        destination: '/llms.mdx/docs/:slug*/content.md',
      },
    ];
  },
  async redirects() {
    return [
      // The naming-conventions page moved to Build Standards (#2208). Keep the
      // old URL alive so external links (CLAUDE.md, bookmarks) don't 404.
      // MUST stay before the /docs/primitives/:slug* rule below — Next uses
      // first-match, and the wildcard would otherwise send it to a dead
      // /docs/foundation/naming-conventions.
      // Every RENAME here needs a `.md` twin declared beside it (#2616).
      // Redirects are matched before the Markdown rewrite, and the wildcard at
      // the bottom matches a `.md` suffix, so without the twins these old URLs
      // 308 the Markdown surface to destinations that have no page. The
      // wildcard itself needs no twin — it is a 1:1 passthrough, so
      // path-to-regexp carries the `.md` through to a real page.
      {
        source: '/docs/primitives/naming-conventions',
        destination: '/docs/build-standards',
        permanent: true,
      },
      {
        source: '/docs/primitives/naming-conventions.md',
        destination: '/docs/build-standards.md',
        permanent: true,
      },
      // The Shadow page was renamed to Elevation to match the Figma collection
      // name. MUST stay before the /docs/primitives/:slug* wildcard so the old
      // primitives URL lands on the live page in one hop, not a dead
      // /docs/foundation/shadow.
      {
        source: '/docs/primitives/shadow',
        destination: '/docs/foundation/elevation',
        permanent: true,
      },
      {
        source: '/docs/primitives/shadow.md',
        destination: '/docs/foundation/elevation.md',
        permanent: true,
      },
      {
        source: '/docs/foundation/shadow',
        destination: '/docs/foundation/elevation',
        permanent: true,
      },
      {
        source: '/docs/foundation/shadow.md',
        destination: '/docs/foundation/elevation.md',
        permanent: true,
      },
      // The Foundation section moved from /docs/primitives to /docs/foundation
      // (#2209) — the route named one Tier of the four the section documents.
      // Keep old URLs alive (CLAUDE.md, consumer docs, bookmarks).
      {
        source: '/docs/primitives',
        destination: '/docs/foundation',
        permanent: true,
      },
      {
        source: '/docs/primitives.md',
        destination: '/docs/foundation.md',
        permanent: true,
      },
      {
        source: '/docs/primitives/:slug*',
        destination: '/docs/foundation/:slug*',
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
