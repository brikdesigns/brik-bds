import { type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useThemeCompliance, type ThemeResult } from './_components/useThemeCompliance';
import { DashboardFrame, DashboardSection } from './_components/DashboardFrame';

// ─── Styles ─────────────────────────────────────────────────────────

const tableCell: CSSProperties = {
  padding: 'var(--gap-xs) var(--gap-sm)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  borderBottom: '1px solid var(--border-muted)', // bds-lint-ignore
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
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--gap-md)' }}>
        <tbody>
          {theme.contrastPairs.map((pair) => (
            <tr key={pair.label}>
              <td style={tableCell}>
                <span style={swatch(pair.bgValue || 'transparent')} />
                <span style={swatch(pair.textValue || 'transparent')} />
                {pair.label}
              </td>
              <td style={{ ...tableCell, textAlign: 'right' }}>
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
    <DashboardFrame
      title="Theme Compliance"
      subtitle={
        <>
          WCAG AA contrast validation (4.5:1 minimum) across all {total} theme configurations.{' '}
          <strong>{passing}/{total}</strong> themes fully compliant.
        </>
      }
    >
      <DashboardSection title="Contrast matrix">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--gap-md)' }}>
          {results.map(theme => (
            <ThemeCard key={theme.name} theme={theme} />
          ))}
        </div>
      </DashboardSection>
    </DashboardFrame>
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
