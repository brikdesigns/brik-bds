/**
 * Typed text in the pin form must be readable on the form's own white surface.
 *
 * The form hardcodes `background: #fff` but its inputs once set no text colour,
 * so on a host whose preflight resets form controls with `color: inherit` and
 * whose body text is light (a dark host page), typed text was near-white on
 * white (1.12:1).
 *
 * The seam is the cascade — inherited colour over a hardcoded surface — which
 * only a real browser resolves and a string match on the CSS cannot see. The
 * host reset below is the two Tailwind-preflight rules that matter; the light
 * host is the control that passes either way.
 *
 * Runs under the `components-browser` vitest project (see vitest.config.ts).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import widgetSource from './feedback-widget.js?raw';

const settle = (ms = 150) => new Promise((r) => setTimeout(r, ms));

type RGB = [number, number, number];
const channels = (css: string): RGB => css.match(/[\d.]+/g)!.slice(0, 3).map(Number) as RGB;
const luminance = ([r, g, b]: RGB) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(channels(a)), luminance(channels(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let hostStyle: HTMLStyleElement | null = null;

function installHost(scheme: 'light' | 'dark'): void {
  const [text, surface] = scheme === 'dark' ? ['#f2f2f2', '#111111'] : ['#1b1b1b', '#ffffff'];
  hostStyle = document.createElement('style');
  hostStyle.textContent = `
    body { color: ${text}; background: ${surface}; }
    input, textarea { color: inherit; background-color: transparent; font: inherit; }
  `;
  document.head.appendChild(hostStyle);
}

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style').forEach((s) => s.remove());
  hostStyle = null;
  vi.restoreAllMocks();
});

for (const scheme of ['light', 'dark'] as const) {
  describe(`feedback widget form text on a ${scheme} host`, () => {
    it('typed text meets 4.5:1 against the form surface', async () => {
      installHost(scheme);
      vi.spyOn(window, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ review: { design_feedback: [] } }), { status: 200 }),
      );
      const script = document.createElement('script');
      script.setAttribute('data-review-token', 'contrast-test');
      script.setAttribute('data-api-url', 'https://mock.invalid');
      script.setAttribute('data-variant-key', 'portal');
      script.textContent = widgetSource;
      document.body.appendChild(script);
      await settle();

      Array.from(document.querySelectorAll<HTMLElement>('.bfb-btn'))
        .find((b) => /feedback/.test((b.textContent ?? '').toLowerCase()))
        ?.click();
      await settle();
      document.body.dispatchEvent(
        new MouseEvent('click', { clientX: 400, clientY: 300, bubbles: true }),
      );
      await settle();

      // Assert the fixture before measuring it: a form that never opened would
      // measure nothing and pass.
      expect(
        document.querySelector('.bfb-form textarea.bfb-comment'),
        'pin mode did not open the form — the contrast check would be vacuous',
      ).not.toBeNull();

      for (const sel of ['.bfb-comment', '.bfb-name', '.bfb-email']) {
        const field = getComputedStyle(document.querySelector(sel)!);
        const form = getComputedStyle(document.querySelector('.bfb-form')!);
        // A transparent field shows the form's own surface.
        const bg = /rgba\(.*, 0\)|transparent/.test(field.backgroundColor)
          ? form.backgroundColor
          : field.backgroundColor;
        expect(contrast(field.color, bg), `${sel} text ${field.color} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}
