import { useEffect, useRef } from 'react';
import type { Atmosphere } from '../../../content-system/vocabularies/atmosphere';
import type { AtmosphereManifestEntry } from '../../../content-system/atmospheres';
import { docTable, docTd, docTdMono } from './docTableStyles';

import figmaTokensUrl from '../../../tokens/figma-tokens.css?url';
import figmaTokensDarkUrl from '../../../tokens/figma-tokens-dark.css?url';
import gapFillsUrl from '../../../tokens/gap-fills.css?url';
import themeBrandBrikUrl from '../../../tokens/theme-brand-brik.css?url';

/**
 * Supported Storybook theme identifier (mirrors `tokens/storybook-themes.ts`).
 * Only the built-in themes are wired — client themes would extend this map.
 */
export type PreviewTheme = 'brik' | 'brik-dark' | 'client-sim';

interface Props {
  atmosphere: Atmosphere;
  entry: AtmosphereManifestEntry;
  /** Relative URL to the atmosphere CSS file (so Storybook can load it). */
  cssHref: string;
  /**
   * Active Storybook theme. Applied inside the iframe as the `body` class +
   * `html[data-theme]` attribute so the composite reacts to theme switches
   * the same way a real client site would. Defaults to `brik` for MDX
   * callers that haven't plumbed the toolbar global through.
   */
  themeNumber?: PreviewTheme;
}

/**
 * AtmospherePreview — renders a live 640x380 preview iframe for a given
 * atmosphere, alongside a data table with its metadata.
 *
 * Why an iframe: atmosphere CSS sets `:root`, `body`, and `section[data-*]`
 * selectors — loading it into the Storybook docs page directly would
 * globally restyle the docs shell. The iframe isolates each atmosphere
 * to its own document.
 *
 * Inside the iframe: BDS tokens load first (figma-tokens → gap-fills →
 * theme-brand-brik), then the atmosphere CSS cascades on top. The
 * composite body uses BDS token references so theme switches are visible
 * on the tokens the atmosphere does NOT override (type, radius, gap, etc).
 */
export function AtmospherePreview({ atmosphere, entry, cssHref, themeNumber = 'brik' }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = buildPreviewHTML(atmosphere, cssHref, themeNumber);
    iframe.srcdoc = html;
  }, [atmosphere, cssHref, themeNumber]);

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 40px)' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 'var(--gap-lg, 20px)',
          marginBottom: 'var(--gap-md, 12px)',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            borderRadius: 'var(--border-radius-lg, 12px)',
            border: '1px solid var(--border-primary, #333)',
            overflow: 'hidden',
            minHeight: 380,
          }}
        >
          <iframe
            ref={iframeRef}
            title={`${atmosphere} preview (${themeNumber})`}
            sandbox="allow-same-origin"
            style={{ width: '100%', height: 380, border: 'none', display: 'block' }}
          />
        </div>

        <table style={{ ...docTable, margin: 0 }}>
          <tbody>
            <tr>
              <td style={docTd}><strong>Slug</strong></td>
              <td style={docTdMono}>{entry.slug}</td>
            </tr>
            <tr>
              <td style={docTd}><strong>Theme mode</strong></td>
              <td style={docTdMono}>{entry.themeMode ?? '(any)'}</td>
            </tr>
            <tr>
              <td style={docTd}><strong>Blurb</strong></td>
              <td style={docTd}>{entry.blurb}</td>
            </tr>
            <tr>
              <td style={docTd}><strong>Natural fit</strong></td>
              <td style={docTd}>{entry.naturalFit.join('  ·  ')}</td>
            </tr>
            <tr>
              <td style={docTd}><strong>Import</strong></td>
              <td style={docTdMono}>{entry.cssPath}</td>
            </tr>
            <tr>
              <td style={docTd}><strong>Under theme</strong></td>
              <td style={docTdMono}>{themeNumber}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Mirror preview.tsx's theme-to-body-attribute mapping.
function themeAttributes(themeNumber: PreviewTheme): { bodyClass: string; dataTheme: 'light' | 'dark' } {
  if (themeNumber === 'brik-dark') {
    return { bodyClass: 'body theme-brand-brik', dataTheme: 'dark' };
  }
  if (themeNumber === 'client-sim') {
    return { bodyClass: 'body theme-brand-brik theme-client-sim', dataTheme: 'light' };
  }
  return { bodyClass: 'body theme-brand-brik', dataTheme: 'light' };
}

/**
 * Build the preview iframe's HTML. BDS tokens load first (in the same
 * cascade consumers use), then the atmosphere CSS layers on top. The
 * composite mirrors a compact real-site hero + services grid + CTA so
 * the atmosphere's primary surfaces and ambient hooks (`data-ambient`,
 * `data-spotlight`) actually render.
 */
function buildPreviewHTML(atmosphere: Atmosphere, cssHref: string, themeNumber: PreviewTheme): string {
  const { bodyClass, dataTheme } = themeAttributes(themeNumber);

  return `<!doctype html>
<html data-theme="${dataTheme}">
<head>
<meta charset="utf-8">
<!-- BDS token cascade -->
<link rel="stylesheet" href="${figmaTokensUrl}">
<link rel="stylesheet" href="${figmaTokensDarkUrl}">
<link rel="stylesheet" href="${gapFillsUrl}">
<link rel="stylesheet" href="${themeBrandBrikUrl}">
<!-- Atmosphere layer (cascades on top) -->
<link rel="stylesheet" href="${cssHref}">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: var(--font-family-body, system-ui, sans-serif);
    color: var(--text-primary);
    background: var(--background-primary);
    overflow: hidden;
  }
  .preview-root {
    padding: var(--padding-lg, 16px);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap-md, 12px);
  }
  .preview-hero {
    position: relative;
    border-radius: var(--border-radius-md, 8px);
    padding: var(--padding-lg, 20px);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 140px;
    background: var(--surface-primary);
    border: 1px solid var(--border-primary);
  }
  .preview-eyebrow {
    font-family: var(--font-family-label, system-ui, sans-serif);
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-brand-primary);
    margin-bottom: var(--gap-xs, 8px);
  }
  .preview-h1 {
    font-family: var(--font-family-heading, Georgia, serif);
    font-size: 22px;
    line-height: 1.15;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    max-width: 22ch;
  }
  .preview-h1 em {
    color: var(--text-brand-primary);
    font-style: italic;
  }
  .preview-sub {
    margin-top: var(--gap-xs, 8px);
    font-size: 12px;
    color: var(--text-secondary);
    font-family: var(--font-family-body, system-ui, sans-serif);
  }
  .preview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap-sm, 12px);
    flex: 1;
  }
  .preview-card {
    position: relative;
    border-radius: var(--border-radius-sm, 6px);
    padding: var(--padding-md, 14px);
    border: 1px solid var(--border-muted);
    background: var(--surface-secondary);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .preview-card-icon {
    width: 22px;
    height: 22px;
    border-radius: var(--border-radius-xs, 4px);
    border: 1px solid var(--border-brand-primary);
    margin-bottom: var(--gap-xs, 8px);
  }
  .preview-card h3 {
    font-family: var(--font-family-heading, Georgia, serif);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .preview-card p {
    font-family: var(--font-family-body, system-ui, sans-serif);
    font-size: 10px;
    line-height: 1.4;
    color: var(--text-secondary);
  }
  .preview-cta {
    border-radius: var(--border-radius-sm, 6px);
    padding: 12px 16px;
    text-align: center;
    background: var(--background-brand-primary);
    color: var(--text-inverse, #fff);
    font-family: var(--font-family-label, system-ui, sans-serif);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
</style>
</head>
<body class="${bodyClass}">
<div class="preview-root">
  <section class="preview-hero" data-ambient="top-right">
    <div class="preview-eyebrow">${atmosphere}</div>
    <h1 class="preview-h1">Dentistry designed to make you <em>feel good</em> about your smile.</h1>
    <p class="preview-sub">Two doctors. One practice. Find the fit that's right for you.</p>
  </section>

  <section class="preview-grid" data-ambient="split">
    <div class="preview-card" data-spotlight>
      <div class="preview-card-icon"></div>
      <h3>Veneers</h3>
      <p>Porcelain restorations photographed every stage.</p>
    </div>
    <div class="preview-card">
      <div class="preview-card-icon"></div>
      <h3>Preventive</h3>
      <p>Cleanings, exams, family care.</p>
    </div>
    <div class="preview-card">
      <div class="preview-card-icon"></div>
      <h3>Restorative</h3>
      <p>Crowns, bridges, full-mouth rehab.</p>
    </div>
  </section>

  <div class="preview-cta">Request Your Appointment</div>
</div>
</body>
</html>`;
}
