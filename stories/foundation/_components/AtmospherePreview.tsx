import { useEffect, useRef } from 'react';
import type { Atmosphere } from '../../../content-system/vocabularies/atmosphere';
import type { AtmosphereManifestEntry } from '../../../content-system/atmospheres';
import { docTable, docTd, docTdMono } from './docTableStyles';

interface Props {
  atmosphere: Atmosphere;
  entry: AtmosphereManifestEntry;
  /** Relative URL to the atmosphere CSS file (so Storybook can load it). */
  cssHref: string;
}

/**
 * AtmospherePreview — renders a live 640x380 preview iframe for a given
 * atmosphere, alongside a data table with its metadata (theme mode,
 * natural-fit verticals, CSS import path).
 *
 * Why an iframe: atmosphere CSS sets `:root`, `body`, and `section[data-*]`
 * selectors — loading it into the Storybook docs page directly would
 * globally restyle the docs shell. The iframe isolates each atmosphere
 * to its own document so previews can coexist on one page without
 * fighting each other (or Storybook's own UI).
 *
 * The iframe body is a compact composite — hero section + service
 * grid + CTA — that exercises the atmosphere's primary surfaces and
 * ambient attributes without depending on full component implementations.
 */
export function AtmospherePreview({ atmosphere, entry, cssHref }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = buildPreviewHTML(atmosphere, cssHref);
    iframe.srcdoc = html;
  }, [atmosphere, cssHref]);

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
            title={`${atmosphere} preview`}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Build the preview iframe's HTML. Mirrors the Birdwell home composition
 * at a small scale: hero + services-bento-style grid + CTA. Each
 * section carries a `data-ambient` attribute so atmospheres that honor
 * the contract (editorial-luxury, cinematic-dramatic) visibly emit
 * their orbs/glows.
 */
function buildPreviewHTML(atmosphere: Atmosphere, cssHref: string): string {
  // For light-mode atmospheres, inject a higher-contrast text color so
  // the preview reads correctly on white. Dark-mode atmospheres already
  // set --surface + --background vars, so we inherit white text.
  const isLight = atmosphere === 'minimal-clinical'
    || atmosphere === 'warm-soft'
    || atmosphere === 'clean-bright'
    || atmosphere === 'organic-textured';

  const textColor = isLight ? '#0a0a0a' : '#f5f5f0';
  const mutedColor = isLight ? '#5a5a5a' : '#b8b8b0';
  const goldColor = '#c49a2f';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${cssHref}">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: ui-serif, Georgia, 'Libre Baskerville', serif;
    color: ${textColor};
    overflow: hidden;
  }
  .preview-root { padding: 24px; height: 100%; display: flex; flex-direction: column; gap: 16px; }
  .preview-hero {
    position: relative;
    border-radius: 8px;
    padding: 24px;
    display: flex; flex-direction: column; justify-content: flex-end;
    min-height: 140px;
    background: ${isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'};
    border: 1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'};
  }
  .preview-eyebrow {
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${goldColor};
    margin-bottom: 8px;
  }
  .preview-h1 {
    font-family: ui-serif, 'Libre Baskerville', Georgia, serif;
    font-size: 24px;
    line-height: 1.15;
    font-weight: 400;
    letter-spacing: -0.01em;
    max-width: 22ch;
  }
  .preview-h1 em { color: ${goldColor}; font-style: italic; }
  .preview-sub {
    margin-top: 8px;
    font-size: 12px;
    color: ${mutedColor};
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
  .preview-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    flex: 1;
  }
  .preview-card {
    position: relative;
    border-radius: 6px;
    padding: 14px;
    border: 1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(196,154,47,0.14)'};
    background: ${isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.02)'};
    display: flex; flex-direction: column; justify-content: flex-start;
  }
  .preview-card-icon {
    width: 22px; height: 22px; border-radius: 4px;
    border: 1px solid ${goldColor};
    margin-bottom: 8px;
  }
  .preview-card h3 {
    font-family: ui-serif, 'Libre Baskerville', Georgia, serif;
    font-size: 12px;
    font-weight: 400;
    margin-bottom: 4px;
  }
  .preview-card p {
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 10px;
    line-height: 1.4;
    color: ${mutedColor};
  }
  .preview-cta {
    border-radius: 6px;
    padding: 14px 16px;
    text-align: center;
    background: ${goldColor};
    color: ${isLight ? '#0a0a0a' : '#0a0a0a'};
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
</style>
</head>
<body>
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
