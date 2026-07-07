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
 */
export default async (_request: Request, context: Context): Promise<Response> => {
  const response = await context.next();
  const token = Deno.env.get('NETLIFY_SKEW_PROTECTION_TOKEN');

  if (token) {
    response.headers.append(
      'Set-Cookie',
      `nf-skew=${token}; Path=/; SameSite=Lax; Secure; HttpOnly`,
    );
  }

  return response;
};

export const config: Config = {
  path: ['/', '/index.html', '/iframe.html'],
};
