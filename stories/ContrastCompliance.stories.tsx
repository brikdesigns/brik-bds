import { useLayoutEffect, useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardFrame, DashboardSection } from './_components/DashboardFrame';
import { contrastRatio } from './_components/wcag-contrast';
import { getAllThemes } from '../tokens/theme-registry';
import pairingData from '../tokens/contrast-pairings.json';

// Themes under test come from the registry — BDS ships 3 built-ins, and
// consumer Storybooks can extend the probe via `registerClientTheme()`
// from `tokens/theme-registry`. No hand-editing this file per new client.

// ─── Contrast pairs to evaluate ─────────────────────────────────────
// Sourced from the canonical dataset (tokens/contrast-pairings.json) — the
// SAME set the CI gate (scripts/validate-themes.js) and the foundation doc
// use. The visual pass/fail bar is the WCAG AA floor (3:1 for large/muted,
// 4.5:1 otherwise); AAA is the documented body-text aim shown in the note.

const AA_FLOOR = pairingData.thresholds['AA'];
const AA_LARGE = pairingData.thresholds['AA-large'];

const CONTRAST_PAIRS: {
  label: string;
  text: string;
  bg: string;
  threshold: number;
  note?: string;
}[] = pairingData.pairings.map((p) => ({
  label: p.label,
  text: p.fg,
  bg: p.bg,
  threshold: p.thresholdType === 'AA-large' ? AA_LARGE : AA_FLOOR,
  note:
    p.thresholdType === 'AAA'
      ? 'AAA body aim (7:1); AA floor enforced'
      : p.thresholdType === 'AA-large'
        ? 'AA large / UI component (3:1 minimum)'
        : 'darkException' in p
          ? 'service pairing — dark gap tracked in #823'
          : undefined,
}));

const FONT_TOKENS = ['--bds-font-family-heading', '--bds-font-family-body', '--bds-font-family-label'];

// ─── Types ──────────────────────────────────────────────────────────

interface PairResult {
  label: string;
  textToken: string;
  bgToken: string;
  textValue: string;
  bgValue: string;
  ratio: number;
  threshold: number;
  pass: boolean;
  note?: string;
}

interface ThemeResult {
  key: string;
  name: string;
  description: string;
  pairs: PairResult[];
  fonts: Record<string, string>;
  failing: number;
}

// ─── Probe ──────────────────────────────────────────────────────────

function probeThemes(): ThemeResult[] {
  const body = document.body;
  const html = document.documentElement;
  const origBodyClasses = body.className;
  const origDataTheme = html.getAttribute('data-theme');

  const results: ThemeResult[] = [];

  for (const theme of getAllThemes()) {
    body.className = '';
    for (const c of theme.bodyClasses) body.classList.add(c);
    html.setAttribute('data-theme', theme.dataTheme);

    const style = getComputedStyle(body);
    const read = (token: string) => style.getPropertyValue(token).trim();

    const pairs: PairResult[] = CONTRAST_PAIRS.map((pair) => {
      const textValue = read(pair.text);
      const bgValue = read(pair.bg);
      const ratio = Math.round(contrastRatio(textValue, bgValue) * 100) / 100;
      return {
        label: pair.label,
        textToken: pair.text,
        bgToken: pair.bg,
        textValue,
        bgValue,
        ratio,
        threshold: pair.threshold,
        pass: ratio >= pair.threshold,
        note: pair.note,
      };
    });

    const fonts: Record<string, string> = {};
    for (const t of FONT_TOKENS) fonts[t] = read(t) || 'unset';

    results.push({
      key: theme.key,
      name: theme.name,
      description: theme.description,
      pairs,
      fonts,
      failing: pairs.filter((p) => !p.pass).length,
    });
  }

  // Restore original state
  body.className = origBodyClasses;
  if (origDataTheme) html.setAttribute('data-theme', origDataTheme);
  else html.removeAttribute('data-theme');

  return results;
}

// ─── Styles ─────────────────────────────────────────────────────────

const card: CSSProperties = {
  padding: 'var(--bds-padding-md)',
  backgroundColor: 'var(--bds-surface-primary)',
  borderRadius: 'var(--bds-border-radius-md)',
  border: '1px solid var(--bds-border-muted)', // bds-lint-ignore — card border
};

const tableCell: CSSProperties = {
  padding: 'var(--bds-gap-xs) var(--bds-gap-sm)',
  fontFamily: 'var(--bds-font-family-body)',
  fontSize: 'var(--bds-body-sm)',
  borderBottom: '1px solid var(--bds-border-muted)', // bds-lint-ignore — table border
  verticalAlign: 'top',
};

const swatch = (value: string): CSSProperties => ({
  display: 'inline-block',
  width: 14,                                         // bds-lint-ignore — swatch size
  height: 14,                                        // bds-lint-ignore — swatch size
  borderRadius: 'var(--bds-border-radius-sm)',
  backgroundColor: value || 'transparent',
  border: '1px solid var(--bds-border-muted)',           // bds-lint-ignore — swatch border
  marginRight: 'var(--bds-gap-xs)',
  verticalAlign: 'middle',
});

const ratioBadge = (pass: boolean): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',                                // bds-lint-ignore — badge padding
  borderRadius: 'var(--bds-border-radius-sm)',
  fontSize: 'var(--bds-body-xs)',
  fontFamily: 'var(--bds-font-family-label)',
  fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number,
  backgroundColor: pass ? 'var(--bds-color-system-green)' : 'var(--bds-color-system-red)',
  color: '#FFFFFF',                                  // bds-lint-ignore — badge text always white for max contrast
});

// ─── Components ─────────────────────────────────────────────────────

function ThemeCard({ theme }: { theme: ThemeResult }) {
  const icon = theme.failing === 0 ? '✅' : '⚠️';

  return (
    <div style={card}>
      <header style={{ marginBottom: 'var(--bds-gap-md)' }}>
        <h3
          style={{
            fontFamily: 'var(--bds-font-family-heading)',
            fontSize: 'var(--bds-heading-sm)',
            color: 'var(--bds-text-primary)',
            margin: 0,
          }}
        >
          {icon} {theme.name}
        </h3>
        <p
          style={{
            fontFamily: 'var(--bds-font-family-body)',
            fontSize: 'var(--bds-body-xs)',
            color: 'var(--bds-text-muted)',
            margin: 'var(--bds-gap-xs) 0 0',
          }}
        >
          {theme.description}
        </p>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--bds-gap-md)' }}>
        <tbody>
          {theme.pairs.map((pair) => (
            <tr key={pair.label}>
              <td style={tableCell}>
                <span style={swatch(pair.bgValue)} />
                <span style={swatch(pair.textValue)} />
                <span style={{ fontFamily: 'var(--bds-font-family-body)', color: 'var(--bds-text-primary)' }}>{pair.label}</span>
                {pair.note ? (
                  <div style={{ fontSize: 'var(--bds-body-xs)', color: 'var(--bds-text-muted)', marginTop: 2 }}>
                    {pair.note}
                  </div>
                ) : null}
              </td>
              <td style={{ ...tableCell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                <span style={ratioBadge(pair.pass)}>
                  {pair.ratio > 0 ? `${pair.ratio.toFixed(2)}:1` : 'N/A'}
                </span>
                <div style={{ fontSize: 'var(--bds-body-xs)', color: 'var(--bds-text-muted)', marginTop: 2 }}>
                  target {pair.threshold}:1
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          fontFamily: 'var(--bds-font-family-body)',
          fontSize: 'var(--bds-body-xs)',
          color: 'var(--bds-text-muted)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--bds-text-secondary)', fontFamily: 'var(--bds-font-family-label)' }}>Fonts</strong>
        {Object.entries(theme.fonts).map(([token, value]) => (
          <div key={token}>
            <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
              {token.replace('--font-family-', '')}
            </code>
            : <span style={{ color: 'var(--bds-text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContrastComplianceDashboard() {
  const [results, setResults] = useState<ThemeResult[] | null>(null);

  // useLayoutEffect runs synchronously before paint — flipping body classes,
  // reading getComputedStyle, and restoring all happen in one blocking pass.
  // The user never sees an intermediate paint.
  useLayoutEffect(() => {
    setResults(probeThemes());
  }, []);

  if (!results) {
    return (
      <div style={{ padding: 'var(--bds-padding-xl)', fontFamily: 'var(--bds-font-family-body)', color: 'var(--bds-text-muted)' }}>
        Evaluating themes...
      </div>
    );
  }

  const passing = results.filter((r) => r.failing === 0).length;

  return (
    <DashboardFrame
      title="Contrast Compliance"
      subtitle={
        <>
          WCAG contrast validation across the 3 built-in themes. Threshold is 4.5:1 for body text
          (AA) and 3:1 for muted text and UI components (AA large).{' '}
          <strong>
            {passing} of {results.length}
          </strong>{' '}
          themes fully compliant.
        </>
      }
    >
      <DashboardSection
        title="Contrast matrix"
        description="Each card probes the theme by applying its body classes and data-theme attribute, reading semantic token values via getComputedStyle, and computing the pair-wise contrast ratio. Swatches show background then text color."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--bds-gap-md)',
          }}
        >
          {results.map((theme) => (
            <ThemeCard key={theme.key} theme={theme} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        title="How to fix a failing pair"
        description="Failing ratios are almost always caused by a brand color that's too close in luminance to the surface it sits on. Two patterns to try."
      >
        <div style={card}>
          <ol
            style={{
              fontFamily: 'var(--bds-font-family-body)',
              fontSize: 'var(--bds-body-sm)',
              color: 'var(--bds-text-primary)',
              margin: 0,
              paddingLeft: 'var(--bds-padding-md)',
              lineHeight: 1.7,
            }}
          >
            <li>
              If the failure is <code>text-brand-primary</code> on <code>page-primary</code>, darken the brand
              color in the client theme — not the page background. A 10–15% luminance shift is usually enough.
            </li>
            <li>
              If the failure is <code>text-inverse</code> on <code>background-brand-primary</code>, the brand
              color is too light to pair with white. Either darken the brand, or override{' '}
              <code>--bds-text-inverse</code> to a dark color for this brand.
            </li>
            <li>
              Client Sim assigns distinct font families to heading/body/label. A heading element using{' '}
              <code>--bds-font-family-body</code> shows up as Verdana instead of Georgia — that's a semantic token
              misuse, not a contrast issue. Fix it in the component CSS.
            </li>
          </ol>
        </div>
      </DashboardSection>
    </DashboardFrame>
  );
}

// ─── Meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof ContrastComplianceDashboard> = {
  title: 'Overview/Health/Contrast Compliance',
  // Internal audit dashboard — hidden from MCP discovery (#1321).
  tags: ['surface-shared', '!manifest'],
  component: ContrastComplianceDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'WCAG AA contrast audit across every theme in the BDS theme registry. ' +
          "By default that's the 3 built-ins (Brik, Brik Dark, Client Sim); " +
          'consumer Storybooks add their own client themes by calling ' +
          '`registerClientTheme({...})` from `@brikdesigns/bds` in their ' +
          '`.storybook/preview.ts` (alongside the theme CSS import). Once ' +
          'registered, the client theme enters this audit automatically — no ' +
          'hand-edit of this file per new brand.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContrastComplianceDashboard>;

/** @summary Live WCAG contrast audit across token pairings */
export const Default: Story = {};
