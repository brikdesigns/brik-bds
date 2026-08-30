import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brikdesigns/bds'],
  async redirects() {
    return [
      // The naming-conventions page moved to Build Standards (#2208). Keep the
      // old URL alive so external links (CLAUDE.md, bookmarks) don't 404.
      // MUST stay before the /docs/primitives/:slug* rule below — Next uses
      // first-match, and the wildcard would otherwise send it to a dead
      // /docs/foundation/naming-conventions.
      {
        source: '/docs/primitives/naming-conventions',
        destination: '/docs/build-standards',
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
        source: '/docs/primitives/:slug*',
        destination: '/docs/foundation/:slug*',
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
