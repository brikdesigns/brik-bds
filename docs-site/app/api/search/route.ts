import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static search index. `staticGET` serializes the whole Orama index once at
// build time; the route prerenders to a static JSON asset served from the CDN,
// and the client (search={{ options: { type: 'static' } }} in app/layout.tsx)
// downloads it once and searches in-browser.
//
// The previous `GET` handler rebuilt the index in-memory on every request and
// ran as a Netlify serverless function. Cold starts took ~6s (measured on
// design.brikdesigns.com/api/search), so the first as-you-type search after the
// function went idle appeared broken — results only surfaced once the function
// warmed and the query was client-cached (i.e. after re-typing / paste).
// Static indexing removes the serverless dependency and the cold start.
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
