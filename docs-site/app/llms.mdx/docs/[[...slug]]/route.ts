import { renderPage, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

// Reached through the `/docs/:slug*.md` rewrite in next.config.mjs, which
// appends a `content.md` segment — so the real page slug is everything but the
// last entry. `/docs/foundation/color.md` → slug `['foundation','color']`.
export async function GET(
  _req: Request,
  props: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await props.params;

  // `llms.mdx` is a literal segment, so this route is also reachable directly,
  // without the rewrite that appends `content.md`. Dropping the last segment
  // unconditionally then answered `/llms.mdx/docs/foundation/anything` with a
  // 200 carrying the Foundation page — a wrong page under a success status,
  // for a URL that names no page at all. Only the rewritten shape is served.
  if (slug?.at(-1) !== 'content.md') notFound();

  const slugs = slug.slice(0, -1);
  if (slugs.at(-1) === 'index') slugs.pop();

  const page = source.getPage(slugs);
  if (!page) notFound();

  return new Response(await renderPage(page), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}

export async function generateStaticParams() {
  return source.generateParams().map(({ slug }) => ({
    // The root page's slug is `[]`, which would prerender the unreachable
    // `/docs/.md`. Its real URL is `/docs/index.md` — the `index` segment the
    // handler pops above.
    slug: [...(slug?.length ? slug : ['index']), 'content.md'],
  }));
}
