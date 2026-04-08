import React from 'react';
import { themeMetadata, type ThemeNumber } from '../../../tokens';

const THEME_KEYS: ThemeNumber[] = ['brik', 'brik-dark', 'client-sim'];

interface ThemeComparisonProps {
  /** CSS variable names to compare across themes (without var()) */
  tokens?: string[];
}

export function ThemeComparison({
  tokens = [
    '--page-primary',
    '--surface-primary',
    '--background-brand-primary',
    '--text-primary',
    '--text-brand-primary',
    '--border-brand-primary',
  ],
}: ThemeComparisonProps) {
  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Token</th>
            {THEME_KEYS.map((key) => (
              <th key={key} style={{ ...thStyle, textAlign: 'center', minWidth: '80px' }}>
                {themeMetadata[key]?.name || key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token}>
              <td style={tdStyle}>
                <code
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: '11px',
                  }}
                >
                  {token.replace(/^--/, '')}
                </code>
              </td>
              {THEME_KEYS.map((key) => (
                <td key={key} style={{ ...tdStyle, textAlign: 'center' }}>
                  <ThemeColorCell themeKey={key} cssVar={token} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThemeColorCell({ themeKey, cssVar }: { themeKey: ThemeNumber; cssVar: string }) {
  return (
    <div
      className={`body theme-${themeKey}`}
      style={{
        display: 'inline-block',
        width: '32px',
        height: '32px',
        borderRadius: '4px',
        border: '1px solid var(--border-secondary)',
        backgroundColor: `var(${cssVar})`,
      }}
    />
  );
}

export function ThemeOverview() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--gap-md, 8px)',
        marginBottom: 'var(--padding-xl, 32px)',
      }}
    >
      {THEME_KEYS.map((key) => {
        const meta = themeMetadata[key];
        return (
          <div
            key={key}
            className={`body theme-${key}`}
            style={{
              padding: '16px',
              borderRadius: 'var(--border-radius-md, 4px)',
              backgroundColor: 'var(--page-primary)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              {meta?.name || key}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              {meta?.isDark ? 'Dark' : 'Light'} theme
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--background-brand-primary)',
                  border: '1px solid var(--border-secondary)',
                }}
              />
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-secondary)',
                }}
              />
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-brand-primary)',
                  border: '1px solid var(--border-secondary)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid var(--border-secondary)',
  color: 'var(--text-muted)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-muted, #e0e0e0)',
  verticalAlign: 'middle',
};
