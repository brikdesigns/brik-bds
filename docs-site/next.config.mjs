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
      {
        source: '/docs/primitives/naming-conventions',
        destination: '/docs/build-standards',
        permanent: true,
      },
    ];
  },
};

export default withMDX(nextConfig);
