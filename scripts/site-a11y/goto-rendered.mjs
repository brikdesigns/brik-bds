import { expect, test } from '@playwright/test';

/**
 * Render preconditions for the shared site a11y gate.
 *
 * Lifted from brikdesigns `tests/a11y/lib/goto-rendered.ts` (brikdesigns#1030,
 * #870). An empty axe result is indistinguishable from a clean one, so a page
 * that did not render reports a pass on exactly the build most likely to be
 * broken. `gotoRendered` proves the page answered, and answered with the app.
 *
 * The status check is retried, not single-shot: a deploy preview returns
 * transient 4xx/5xx under concurrent load (brikdesigns#341), and a genuinely
 * broken page fails every attempt while a throttle clears. Each attempt carries
 * its own navigation timeout, or one hung cold navigation consumes the whole
 * test and the retry is unreachable (brikdesigns#870).
 */

/** Attempts before a bad status is treated as a real defect rather than CDN flap. */
const ATTEMPTS = 4;

/** Linear backoff base — attempt N waits N × this, so 2s, 4s, 6s. */
const BACKOFF_MS = 2000;

/** Per-attempt cap on the navigation itself. 10s clears a cold SSR route on a fresh preview. */
const NAV_TIMEOUT_MS = 10_000;

/** Every attempt's navigation plus the backoffs between them: 4 × 10s + (2s + 4s + 6s) = 52s. */
const RETRY_BUDGET_MS =
  ATTEMPTS * NAV_TIMEOUT_MS +
  Array.from({ length: ATTEMPTS - 1 }, (_, i) => BACKOFF_MS * (i + 1)).reduce((a, b) => a + b, 0);

/**
 * Navigate to `path` and assert the page both answered and rendered.
 *
 * Options:
 *   waitUntil  `page.goto` waitUntil. Default `'load'` — CSS and images are in,
 *              which is what axe needs. `'networkidle'` never resolves on a
 *              preview carrying the feedback widget.
 *   renders    selector that must match exactly once to prove the document is
 *              the site's page rather than an infra error shell. Default
 *              `'main'`. `null` skips the check — say why at the call site.
 *   status     the HTTP status this route must answer with. Default: any
 *              status below 400. Set it for a route that is meant to answer
 *              otherwise, e.g. `404` for a not-found probe.
 *
 * Returns the final `Response`.
 */
export async function gotoRendered(page, path, options = {}) {
  const { waitUntil = 'load', renders = 'main', status: expected } = options;
  const ok = (s) => (expected === undefined ? s < 400 : s === expected);

  // Buy the loop the room it needs on the current test only — Playwright's
  // idiom for a helper that owns a retry budget.
  test.info().setTimeout(test.info().timeout + RETRY_BUDGET_MS);

  let response = null;
  let status = 0;
  let timedOut = 0;
  let lastNavError = null;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    // `timeout` is per-navigation and THROWS; catching it is what makes a slow
    // cold navigation retryable instead of terminal (brikdesigns#870).
    try {
      response = await page.goto(path, { waitUntil, timeout: NAV_TIMEOUT_MS });
      expect(response, `${path} returned no response at all (navigation failed)`).toBeTruthy();
      status = response.status();
      if (ok(status)) break;
    } catch (err) {
      timedOut += 1;
      lastNavError = err;
      // Deliberately NOT resetting `status`: a 500 followed by three timeouts
      // must still fail on the 500.
    }
    if (attempt < ATTEMPTS) await page.waitForTimeout(BACKOFF_MS * attempt);
  }

  if (!response) {
    throw new Error(
      `${path} did not finish navigating within ${NAV_TIMEOUT_MS}ms on any of ${ATTEMPTS} attempts ` +
        `(${timedOut} timed out, ~${Math.round(RETRY_BUDGET_MS / 1000)}s total). The route never ` +
        `answered, so anything this gate measures on it proves nothing.\n` +
        `Last navigation error: ${lastNavError?.message ?? 'unknown'}`,
    );
  }

  const wanted = expected === undefined ? 'a status below 400' : `HTTP ${expected}`;
  expect(
    ok(status),
    `${path} returned HTTP ${status} on all ${ATTEMPTS} attempts, wanted ${wanted} — the page did not render as this route expects, so anything this gate measures on it proves nothing. A one-off 4xx/5xx from CDN flap would have cleared within the retries.`,
  ).toBe(true);

  if (renders !== null) {
    await expect(
      page.locator(renders),
      `${path} answered HTTP ${status} but rendered no single \`${renders}\` within timeout — the document is not the site's page (infra cold-start or error shell), not real debt.`,
    ).toHaveCount(1);
  }

  return response;
}

/**
 * Assert the spec swept something on a route that guarantees a set
 * (brikdesigns#1036). Opt a route out in the route table rather than loosening
 * this to `>= 0`.
 */
export function expectMeasured(measured, label, what) {
  expect(
    measured,
    `${label}: swept 0 ${what} — this route is listed because it has at least one, so the page did not render as expected. If the route genuinely has none, opt it out in the route table rather than relaxing this assertion.`,
  ).toBeGreaterThan(0);
}
