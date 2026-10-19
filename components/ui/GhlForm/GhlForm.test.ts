/**
 * GhlForm contract test (brik-client-portal#5364). Node environment: the markup
 * is asserted through `renderToStaticMarkup`, and the load-once guard through a
 * stub document, so the two invariants the issue names — a non-empty iframe
 * `title` and `form_embed.js` loaded ONCE per page — are pinned without a
 * browser. The in-browser render is the story's `play` (GhlForm.stories.tsx).
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { GhlForm } from './GhlForm';
import { GHL_FORM_EMBED_SRC, ensureGhlEmbedScript } from './ghlEmbed';

const render = (props: { formId: string; formName: string; height: number }) =>
  renderToStaticMarkup(createElement(GhlForm, props));

describe('GhlForm markup', () => {
  const html = render({ formId: 'rvGeUFEFytjrjxr7XiDE', formName: 'Contact Us', height: 838 });

  it('renders the GHL widget iframe for the form id', () => {
    expect(html).toContain('<iframe');
    expect(html).toContain('src="https://link.brikdesigns.com/widget/form/rvGeUFEFytjrjxr7XiDE"');
    expect(html).toContain('data-form-id="rvGeUFEFytjrjxr7XiDE"');
    expect(html).toContain('id="inline-rvGeUFEFytjrjxr7XiDE"');
    expect(html).toContain('data-layout-iframe-id="inline-rvGeUFEFytjrjxr7XiDE"');
  });

  it('names the iframe with the form name (non-empty title)', () => {
    expect(html).toContain('title="Contact Us"');
    expect(html).toContain('data-form-name="Contact Us"');
  });

  it('falls back to a non-empty title when formName is blank', () => {
    const blank = render({ formId: 'abc', formName: '   ', height: 600 });
    expect(blank).toMatch(/title="[^"]+"/);
    expect(blank).not.toContain('title=""');
  });

  it('reserves the height so the section does not collapse', () => {
    expect(html).toContain('data-height="838"');
    expect(html).toContain('--bds-ghl-form-height:838px');
  });

  it('carries the GHL embed data attributes the vendor script reads', () => {
    expect(html).toContain('data-trigger-type="alwaysShow"');
    expect(html).toContain('data-activation-type="alwaysActivated"');
    expect(html).toContain('data-deactivation-type="neverDeactivate"');
    expect(html).toContain('data-cookie-consent="true"');
    expect(html).toContain('data-cookie-consent-provider="auto"');
  });
});

describe('ensureGhlEmbedScript', () => {
  function stubDocument() {
    const appended: Array<{ src?: string }> = [];
    return {
      appended,
      doc: {
        // Matches by src, as the real `script[src="…"]` selector does — so a
        // hand-written tag already on the page also counts as "loaded".
        querySelector: (selector: string) =>
          appended.some((el) => el.src && selector.includes(el.src)) ? ({} as Element) : null,
        createElement: () => ({ setAttribute: () => undefined }) as unknown as HTMLScriptElement,
        body: {
          appendChild: (el: unknown) => {
            appended.push(el as { src?: string });
          },
        },
      },
    };
  }

  it('appends form_embed.js the first time', () => {
    const { doc, appended } = stubDocument();
    ensureGhlEmbedScript(doc as unknown as Document);
    expect(appended).toHaveLength(1);
    expect(appended[0].src).toBe(GHL_FORM_EMBED_SRC);
  });

  it('loads it ONCE across many calls — one script per page', () => {
    const { doc, appended } = stubDocument();
    ensureGhlEmbedScript(doc as unknown as Document);
    ensureGhlEmbedScript(doc as unknown as Document);
    ensureGhlEmbedScript(doc as unknown as Document);
    expect(appended).toHaveLength(1);
  });
});
