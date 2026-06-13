/**
 * detectContext — derive page / section / component context for a clicked element.
 *
 * Framework-agnostic (operates on a DOM Element) so both the React
 * DevFeedbackWidget and the vanilla pin-drop widget can share one detector
 * rather than maintaining parallel logic (brik-llm#979).
 *
 * Two environments are supported with one pass:
 *   - Astro client mockups use the BDS `section--{type}` / `layout--{name}`
 *     class convention — the original `detectSectionContext()` behavior.
 *   - Product apps (portal, renew-pms) do NOT use those classes, so section is
 *     resolved from semantic landmarks (`<section>`, `<main>`, `[role=region]`,
 *     `[data-section]`) + an aria-label / nearest-heading / id fallback, and the
 *     targeted BDS component is read from its `bds-{name}` block class
 *     (e.g. `bds-button`).
 *
 * Every field is best-effort and may be absent — callers treat the result as
 * optional context, never required.
 */

export interface CapturedContext {
  /** Human-readable page name (document title, falling back to pathname). */
  page?: string;
  /** Section label/type the element sits in (e.g. "hero", "Billing settings"). */
  section?: string;
  /** BDS component block class without the prefix (e.g. "bds-button"). */
  component?: string;
  /** Tag name of the nearest meaningful element (e.g. "button", "h2"). */
  element_tag?: string;
}

/** Resolve the human-readable page name for the current document. */
function detectPage(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const title = document.title?.trim();
  if (title) return title;
  if (typeof location !== 'undefined' && location.pathname) return location.pathname;
  return undefined;
}

/** First non-empty, trimmed string from the candidates. */
function firstText(...candidates: Array<string | null | undefined>): string | undefined {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return undefined;
}

/** Derive a section label from a resolved section element. */
function sectionLabel(section: Element): string | undefined {
  // Mockup convention first: "section section--hero" → "hero".
  const typeMatch = section.className.match(/section--([a-z0-9-]+)/i);
  if (typeMatch) return typeMatch[1];

  // Product-app fallbacks, most-explicit first.
  const ariaLabel = section.getAttribute('aria-label');
  const dataSection = section.getAttribute('data-section');
  const labelledBy = section.getAttribute('aria-labelledby');
  const labelledByText =
    labelledBy && typeof document !== 'undefined'
      ? document.getElementById(labelledBy)?.textContent
      : undefined;
  const heading = section.querySelector('h1, h2, h3, h4')?.textContent;

  return firstText(ariaLabel, dataSection, labelledByText, heading, section.id || undefined);
}

/** Extract the BDS component block class (`bds-button`) nearest to the target. */
function detectComponent(target: Element): string | undefined {
  const el = target.closest('[class*="bds-"]');
  if (!el) return undefined;
  // Match the block class only, not modifiers: `bds-button` from
  // `bds-button bds-button--primary`; ignore `bds-button__icon` elements by
  // preferring the shortest `bds-<word>` token present.
  const blocks = Array.from(el.classList)
    .map((c) => c.match(/^(bds-[a-z0-9]+)(?:--|__|$)/i)?.[1])
    .filter((c): c is string => Boolean(c));
  if (blocks.length === 0) return undefined;
  // Shortest token is the block (modifiers/elements are longer); stable + simple.
  return blocks.sort((a, b) => a.length - b.length)[0];
}

/**
 * Inspect a clicked target and return whatever page/section/component context
 * can be resolved. Safe to call with any Element; missing context is omitted.
 */
export function detectContext(target: Element): CapturedContext {
  const ctx: CapturedContext = {};

  const page = detectPage();
  if (page) ctx.page = page;

  const section =
    target.closest('[class*="section--"]') ??
    target.closest('section, article, main, [role="region"], [data-section]');
  if (section) {
    const label = sectionLabel(section);
    if (label) ctx.section = label;
  }

  const component = detectComponent(target);
  if (component) ctx.component = component;

  const meaningful = target.closest(
    'a, button, h1, h2, h3, h4, img, video, input, textarea, select, p, li, span',
  );
  if (meaningful) ctx.element_tag = meaningful.tagName.toLowerCase();

  return ctx;
}
