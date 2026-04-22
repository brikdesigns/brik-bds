import { useLayoutEffect, useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardFrame, DashboardSection } from './_components/DashboardFrame';
import { contrastRatio } from './_components/wcag-contrast';

// ─── Themes under test ──────────────────────────────────────────────

interface ThemeSpec {
  key: string;
  name: string;
  description: string;
  bodyClasses: string[];
  dataTheme: 'light' | 'dark';
}

const THEMES: ThemeSpec[] = [
  {
    key: 'brik',
    name: 'Brik',
    description: 'Default brand — poppy on white, light mode',
    bodyClasses: ['body', 'theme-brand-brik'],
    dataTheme: 'light',
  },
  {
    key: 'brik-dark',
    name: 'Brik Dark',
    description: 'Default brand — poppy on near-black, dark mode',
    bodyClasses: ['body', 'theme-brand-brik'],
    dataTheme: 'dark',
  },
  {
    key: 'client-sim',
    name: 'Client Sim',
    description: 'Font-audit theme — Georgia / Verdana / Courier New to expose family misuse',
    bodyClasses: ['body', 'theme-brand-brik', 'theme-client-sim'],
    dataTheme: 'light',
  },
];

// ─── Contrast pairs to evaluate ─────────────────────────────────────

const CONTRAST_PAIRS: {
  label: string;
  text: string;
  bg: string;
  threshold: number;
  note?: string;
}[] = [
  { label: 'Body text on page',      text: '--text-primary',       bg: '--page-primary',           threshold: 4.5 },
  { label: 'Body text on surface',   text: '--text-primary',       bg: '--surface-primary',        threshold: 4.5 },
  { label: 'Secondary on page',      text: '--text-secondary',     bg: '--page-primary',           threshold: 4.5 },
  { label: 'Muted on page',          text: '--text-muted',         bg: '--page-primary',           threshold: 3.0, note: 'AA large / UI component (3:1 minimum)' },
  { label: 'Brand text on page',     text: '--text-brand-primary', bg: '--page-primary',           threshold: 4.5 },
  { label: 'Inverse on brand fill',  text: '--text-inverse',       bg: '--background-brand-primary', threshold: 4.5, note: 'Primary button label' },
];

const FONT_TOKENS = ['--font-family-heading', '--font-family-body', '--font-family-label'];

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

  for (const theme of THEMES) {
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
  padding: 'var(--padding-md)',
  backgroundColor: 'var(--surface-primary)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border-muted)', // bds-lint-ignore — card border
};

const tableCell: CSSProperties = {
  padding: 'var(--gap-xs) var(--gap-sm)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  borderBottom: '1px solid var(--border-muted)', // bds-lint-ignore — table border
  verticalAlign: 'top',
};

const swatch = (value: string): CSSProperties => ({
  display: 'inline-block',
  width: 14,                                         // bds-lint-ignore — swatch size
  height: 14,                                        // bds-lint-ignore — swatch size
  borderRadius: 'var(--border-radius-sm)',
  backgroundColor: value || 'transparent',
  border: '1px solid var(--border-muted)',           // bds-lint-ignore — swatch border
  marginRight: 'var(--gap-xs)',
  verticalAlign: 'middle',
});

const ratioBadge = (pass: boolean): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',                                // bds-lint-ignore — badge padding
  borderRadius: 'var(--border-radius-sm)',
  fontSize: 'var(--body-xs)',
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  backgroundColor: pass ? 'var(--color-system-green)' : 'var(--color-system-red)',
  color: '#FFFFFF',                                  // bds-lint-ignore — badge text always white for max contrast
});

// ─── Components ─────────────────────────────────────────────────────

function ThemeCard({ theme }: { theme: ThemeResult }) {
  const icon = theme.failing === 0 ? '✅' : '⚠️';

  return (
    <div style={card}>
      <header style={{ marginBottom: 'var(--gap-md)' }}>
        <h3
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-sm)',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {icon} {theme.name}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-xs)',
            color: 'var(--text-muted)',
            margin: 'var(--gap-xs) 0 0',
          }}
        >
          {theme.description}
        </p>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--gap-md)' }}>
        <tbody>
          {theme.pairs.map((pair) => (
            <tr key={pair.label}>
              <td style={tableCell}>
                <span style={swatch(pair.bgValue)} />
                <span style={swatch(pair.textValue)} />
                <span style={{ fontFamily: 'var(--font-family-body)', color: 'var(--text-primary)' }}>{pair.label}</span>
                {pair.note ? (
                  <div style={{ fontSize: 'var(--body-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                    {pair.note}
                  </div>
                ) : null}
              </td>
              <td style={{ ...tableCell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                <span style={ratioBadge(pair.pass)}>
                  {pair.ratio > 0 ? `${pair.ratio.toFixed(2)}:1` : 'N/A'}
                </span>
                <div style={{ fontSize: 'var(--body-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                  target {pair.threshold}:1
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-xs)',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family-label)' }}>Fonts</strong>
        {Object.entries(theme.fonts).map(([token, value]) => (
          <div key={token}>
            <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
              {token.replace('--font-family-', '')}
            </code>
            : <span style={{ color: 'var(--text-primary)' }}>{value}</span>
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
      <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', color: 'var(--text-muted)' }}>
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
            gap: 'var(--gap-md)',
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
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-sm)',
              color: 'var(--text-primary)',
              margin: 0,
              paddingLeft: 'var(--padding-md)',
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
              <code>--text-inverse</code> to a dark color for this brand.
            </li>
            <li>
              Client Sim assigns distinct font families to heading/body/label. A heading element using{' '}
              <code>--font-family-body</code> shows up as Verdana instead of Georgia — that's a semantic token
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
  component: ContrastComplianceDashboard,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ContrastComplianceDashboard>;

export const Default: Story = {};
