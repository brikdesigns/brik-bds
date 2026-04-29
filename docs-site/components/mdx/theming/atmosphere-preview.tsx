import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ATMOSPHERE_MANIFEST,
  type Atmosphere,
} from '@brikdesigns/bds/content-system';

/**
 * Server component. Renders a sandboxed iframe preview of an atmosphere
 * by inlining the BDS token cascade + the atmosphere CSS into the
 * iframe's srcDoc at SSG time. The iframe isolates atmosphere rules
 * from the docs shell — atmosphere CSS targets :root, body, and
 * data-* selectors on sections, which would otherwise restyle the
 * whole docs page.
 *
 * Resolves the BDS package via the conventional node_modules path
 * relative to docs-site cwd at build time. Works for local + Netlify
 * builds (both run `npm run build` from docs-site).
 */

// turbopackIgnore: process.cwd() is intentional — this server component reads
// CSS at SSG time and the cwd is docs-site/ in both local + Netlify builds.
const bdsRoot = join(
  /* turbopackIgnore: true */ process.cwd(),
  'node_modules',
  '@brikdesigns',
  'bds',
);

// Cache token CSS — read once per process.
const tokensCss = readFileSync(join(bdsRoot, 'dist/tokens.css'), 'utf8');

const atmosphereCssCache = new Map<Atmosphere, string>();
function getAtmosphereCss(slug: Atmosphere): string {
  let css = atmosphereCssCache.get(slug);
  if (!css) {
    css = readFileSync(join(bdsRoot, `content-system/atmospheres/${slug}.css`), 'utf8');
    atmosphereCssCache.set(slug, css);
  }
  return css;
}

const COMPOSITE_STYLES = `
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
    color: var(--text-on-color-dark);
    font-family: var(--font-family-label, system-ui, sans-serif);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

function buildSrcDoc(slug: Atmosphere, atmosphereCss: string): string {
  const dataTheme =
    ATMOSPHERE_MANIFEST[slug].themeMode === 'dark' ? 'dark' : 'light';

  return `<!doctype html>
<html data-theme="${dataTheme}">
<head>
<meta charset="utf-8">
<style>${tokensCss}</style>
<style>${atmosphereCss}</style>
<style>${COMPOSITE_STYLES}</style>
</head>
<body class="theme-brand-brik">
<div class="preview-root">
  <section class="preview-hero" data-ambient="top-right">
    <div class="preview-eyebrow">${slug}</div>
    <h1 class="preview-h1">Dentistry designed to make you <em>feel good</em> about your smile.</h1>
    <p class="preview-sub">Two doctors. One practice. Find the fit that&apos;s right for you.</p>
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

export interface AtmospherePreviewProps {
  atmosphere: Atmosphere;
}

export function AtmospherePreview({ atmosphere }: AtmospherePreviewProps) {
  const entry = ATMOSPHERE_MANIFEST[atmosphere];
  const atmosphereCss = getAtmosphereCss(atmosphere);
  const srcDoc = buildSrcDoc(atmosphere, atmosphereCss);

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
            border: '1px solid var(--border-primary)',
            overflow: 'hidden',
            minHeight: 380,
          }}
        >
          <iframe
            title={`${atmosphere} atmosphere preview`}
            sandbox="allow-same-origin"
            srcDoc={srcDoc}
            style={{ width: '100%', height: 380, border: 'none', display: 'block' }}
          />
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            margin: 0,
          }}
        >
          <tbody>
            <Row label="Slug" mono>{entry.slug}</Row>
            <Row label="Theme mode" mono>{entry.themeMode ?? '(any)'}</Row>
            <Row label="Blurb">{entry.blurb}</Row>
            <Row label="Natural fit">{entry.naturalFit.join('  ·  ')}</Row>
            <Row label="Surface profile" mono>{entry.surfaceProfile}</Row>
            <Row label="Import" mono>{entry.cssPath}</Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  const cellStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderBottom: '1px solid var(--border-muted)',
    verticalAlign: 'top',
  };
  return (
    <tr>
      <td style={{ ...cellStyle, fontWeight: 600 }}>{label}</td>
      <td
        style={{
          ...cellStyle,
          fontFamily: mono
            ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
            : 'inherit',
          fontSize: mono ? 12 : 'inherit',
        }}
      >
        {children}
      </td>
    </tr>
  );
}
