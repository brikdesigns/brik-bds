/**
 * GoHighLevel form embed — shared constants + the load-once guard.
 *
 * The host is the Brik-branded GHL domain both hand-written embeds point at
 * (`web/rebel-cfo` FinalCta.astro, `web/birdwell-mutlak` InquiryForms.astro).
 * `GhlForm.astro` (Astro rail) repeats these two literals — the Astro barrel
 * ships as source and cannot import from `components/ui`.
 */
export const GHL_EMBED_ORIGIN = 'https://link.brikdesigns.com';
export const GHL_FORM_EMBED_SRC = `${GHL_EMBED_ORIGIN}/js/form_embed.js`;

export const ghlFormSrc = (formId: string) => `${GHL_EMBED_ORIGIN}/widget/form/${formId}`;

/**
 * Append GHL's `form_embed.js` unless a tag for it is already on the page.
 * Matching on `src` (not a marker attribute) also recognises a hand-written
 * tag, so a site mid-migration does not load the script twice.
 */
export function ensureGhlEmbedScript(doc: Document): void {
  if (doc.querySelector(`script[src="${GHL_FORM_EMBED_SRC}"]`)) return;
  const script = doc.createElement('script');
  script.src = GHL_FORM_EMBED_SRC;
  script.async = true;
  doc.body.appendChild(script);
}
