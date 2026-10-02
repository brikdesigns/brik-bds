import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Badge, type BadgeTone } from './Badge';
// `?raw` inlines the file content as a string at build time (Vite), so the
// browser-run test gets the real token source without touching node:fs,
// which Vite externalizes in client code.
import figmaTokensCss from '../../../tokens/figma-tokens.css?raw';
import figmaTokensDarkCss from '../../../tokens/figma-tokens-dark.css?raw';
import gapFillsCss from '../../../tokens/gap-fills.css?raw';
import themeBrandBrikCss from '../../../tokens/theme-brand-brik.css?raw';

/**
 * Render-level contrast check for Badge `appearance="subtle"` (brik-bds#2402).
 *
 * Reads getComputedStyle on an actually-mounted Badge — not arithmetic on
 * hex literals — so a future cascade/gap-fill change that silently breaks a
 * pairing fails here, not only in `npm run contrast-gate`'s source-file read.
 *
 * Injects the real token source files (tokens/figma-tokens.css,
 * figma-tokens-dark.css, gap-fills.css, theme-brand-brik.css — the same
 * cascade dist/tokens.css concatenates, per scripts/build-dist-tokens.js) as
 * a <style> tag, mirroring Card.anatomy.browser.test.ts's sentinel-injection
 * pattern: dist/tokens.css is a build artifact that may be absent in CI, but
 * these source files are always committed. theme-brand-brik.css scopes its
 * rules under `.theme-brand-brik` on `<body>` (.storybook/preview.tsx's own
 * convention, also docs-site/app/layout.tsx) — without it, brand-tone
 * --background-brand-secondary would resolve to gap-fills.css's unthemed
 * white fallback, not the tan-100/grayscale-950 every real consumer renders.
 */

let host: HTMLDivElement;
let root: Root;

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = [figmaTokensCss, figmaTokensDarkCss, gapFillsCss, themeBrandBrikCss].join('\n\n');
  document.head.appendChild(style);
  document.body.classList.add('theme-brand-brik');
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  host?.remove();
  document.documentElement.removeAttribute('data-theme');
});

const h = React.createElement;

async function mount(tone: BadgeTone) {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(h(Badge, { tone, appearance: 'subtle' }, 'Label'));
  });
  return host.querySelector('.bds-badge') as HTMLElement;
}

function parseRgb(value: string) {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`Unparseable color: ${value}`);
  return m[1].split(',').map((n) => parseFloat(n));
}

function relativeLuminance([r, g, b]: number[]) {
  const [R, G, B] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fg: string, bg: string) {
  const l1 = relativeLuminance(parseRgb(fg));
  const l2 = relativeLuminance(parseRgb(bg));
  const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (a + 0.05) / (b + 0.05);
}

describe('Badge appearance="subtle" contrast (#2402)', () => {
  // `negative` and `info` are deliberately excluded: both are pre-existing,
  // library-wide AA failures in their primitive (red has no darker sibling
  // to pin to; blue measures 2.86:1) tracked at the primitive level in
  // #2096 and #1972 respectively, not fixed per-component here.
  it.each<[BadgeTone, number]>([
    ['positive', 4.5],
    ['warning', 4.5],
    ['neutral', 4.5],
    ['brand', 4.5],
  ])('tone="%s" clears AA (%s:1) in both themes on the real rendered badge', async (tone, floor) => {
    const el = await mount(tone);

    document.documentElement.removeAttribute('data-theme');
    const light = getComputedStyle(el);
    const lightRatio = contrastRatio(light.color, light.backgroundColor);

    document.documentElement.setAttribute('data-theme', 'dark');
    const dark = getComputedStyle(el);
    const darkRatio = contrastRatio(dark.color, dark.backgroundColor);

    expect(lightRatio, `light mode ${tone}: ${light.color} on ${light.backgroundColor}`).toBeGreaterThanOrEqual(
      floor,
    );
    expect(darkRatio, `dark mode ${tone}: ${dark.color} on ${dark.backgroundColor}`).toBeGreaterThanOrEqual(floor);
  });
});
