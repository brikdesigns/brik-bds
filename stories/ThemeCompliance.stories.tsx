import { type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useThemeCompliance, type ThemeResult } from './_components/useThemeCompliance';
import { docTable, docTd } from './foundation/_components/docTableStyles';

// ─── Styles ─────────────────────────────────────────────────────────

const heading: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-primary)',
  margin: '0 0 var(--gap-md)',
};

const sectionLabel: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-secondary)',
  margin: '0 0 var(--gap-sm)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const swatch = (color: string): CSSProperties => ({
  width: 20, // bds-lint-ignore — swatch size
  height: 20, // bds-lint-ignore — swatch size
  borderRadius: 'var(--border-radius-sm)',
  backgroundColor: color,
  border: '1px solid var(--border-muted)', // bds-lint-ignore
  display: 'inline-block',
  verticalAlign: 'middle',
  marginRight: 'var(--gap-xs)',
});

const passBadge: CSSProperties = {
  padding: '1px 6px', // bds-lint-ignore — tight badge
  borderRadius: 'var(--border-radius-sm)',
  fontSize: 'var(--body-xs)',
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
};

// ─── Components ─────────────────────────────────────────────────────

function ThemeCard({ theme }: { theme: ThemeResult }) {
  const icon = theme.hasFailures ? '⚠️' : '✅';

  return (
    <div style={{
      padding: 'var(--padding-md)',
      backgroundColor: 'var(--surface-primary)',
      borderRadius: 'var(--border-radius-md)',
      border: '1px solid var(--border-muted)', // bds-lint-ignore
    }}>
      <h3 style={{
        fontFamily: 'var(--font-family-heading)',
        fontSize: 'var(--heading-sm)',
        color: 'var(--text-primary)',
        margin: '0 0 var(--gap-md)',
      }}>
        {icon} {theme.name}
      </h3>

      {/* Contrast pairs */}
      <table style={{ ...docTable, marginBottom: 'var(--gap-md)' }}>
        <tbody>
          {theme.contrastPairs.map((pair) => (
            <tr key={pair.label}>
              <td style={docTd}>
                <span style={swatch(pair.bgValue || 'transparent')} />
                <span style={swatch(pair.textValue || 'transparent')} />
                {pair.label}
              </td>
              <td style={{ ...docTd, textAlign: 'right' }}>
                <span style={{
                  ...passBadge,
                  backgroundColor: pair.pass ? 'var(--color-system-green)' : 'var(--color-system-red)',
                  color: '#fff', // bds-lint-ignore — badge text
                }}>
                  {pair.ratio > 0 ? `${pair.ratio}:1` : 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Font families */}
      <div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)' }}>
        {Object.entries(theme.fonts).map(([token, value]) => (
          <div key={token}>
            {token.replace('--font-family-', '')}: <strong style={{ color: 'var(--text-secondary)' }}>{value || 'unset'}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeComplianceDashboard() {
  const results = useThemeCompliance();

  if (results.length === 0) {
    return <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', color: 'var(--text-muted)' }}>Evaluating themes...</div>;
  }

  const passing = results.filter(r => !r.hasFailures).length;
  const total = results.length;

  return (
    <div style={{ padding: 'var(--padding-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', maxWidth: 1200 }}>
      <div>
        <h1 style={heading}>Theme Compliance</h1>
        <div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-secondary)' }}>
          WCAG AA contrast validation (4.5:1 minimum) across all {total} theme configurations.
          {' '}<strong>{passing}/{total}</strong> themes fully compliant.
        </div>
      </div>

      <div>
        <h2 style={sectionLabel}>Contrast Matrix</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--gap-md)' }}>
          {results.map(theme => (
            <ThemeCard key={theme.name} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof ThemeComplianceDashboard> = {
  title: 'Overview/Health/Theme Compliance',
  component: ThemeComplianceDashboard,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ThemeComplianceDashboard>;

export const Default: Story = {};
