import type { Config, Context } from '@netlify/edge-functions';

/**
 * Skew-protection cookie stamper
 *
 * Pins each browsing session to the deploy it originally loaded, so the hosted
 * Storybook never 404s a content-hashed chunk after a newer deploy lands
 * mid-session (the "Failed to fetch dynamically imported module" overlay).
 *
 * Runs ONLY on the HTML entry documents (see `config.path`) — never on
 * `/assets/*`, which are the paths pinned by `.netlify/v1/skew-protection.json`.
 * It stamps the CURRENT deploy's skew token into the `nf-skew` cookie via a
 * Set-Cookie header on the HTML response, so the cookie is in the jar BEFORE
 * the browser fetches any asset referenced by that HTML — no preload-scanner
 * race. Because the HTML documents are excluded from the skew patterns, a fresh
 * load always gets the current deploy and this refreshes the cookie to it;
 * an already-open tab keeps its older token until it reloads, so its lazy
 * chunk imports resolve against the deploy it was serving.
 *
 * NETLIFY_SKEW_PROTECTION_TOKEN is populated by Netlify at runtime; when it is
 * absent (e.g. skew protection disabled) the response passes through unchanged.
 *
 * The cookie is stamped onto a FRESH Headers copy rather than mutated in place:
 * `context.next()` can return a response whose headers are immutable — a 304
 * Not Modified from the `must-revalidate` entry documents, or a CDN-cached
 * body — and `.append()` on those throws, which the visitor sees as Netlify's
 * "This edge function has crashed" page instead of Storybook. Cloning the
 * headers sidesteps that; the outer try/catch is the belt-and-suspenders
 * guarantee that a stamping failure can never take the whole site down again.
 */
export default async (_request: Request, context: Context): Promise<Response> => {
  const response = await context.next();

  const token = Deno.env.get('NETLIFY_SKEW_PROTECTION_TOKEN');
  if (!token) return response;

  try {
    const headers = new Headers(response.headers);
    headers.append(
      'Set-Cookie',
      `nf-skew=${token}; Path=/; SameSite=Lax; Secure; HttpOnly`,
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    // Stamping is best-effort: a failed cookie set costs one skew-recovery,
    // a thrown edge function costs the whole page. Always serve the document.
    return response;
  }
};

export const config: Config = {
  path: ['/', '/index.html', '/iframe.html'],
};
