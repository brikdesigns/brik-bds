import React from 'react';
import { themeMetadata, type ThemeNumber } from '../../../tokens';

const THEME_KEYS: ThemeNumber[] = ['brik', '1', '2', '3', '4', '5', '6', '7', '8'];

interface ThemeComparisonProps {
  /** CSS variable names to compare across themes (without var()) */
  tokens?: string[];
}

export function ThemeComparison({
  tokens = [
    '--_color---page--primary',
    '--_color---surface--primary',
    '--_color---background--brand-primary',
    '--_color---text--primary',
    '--_color---text--brand',
    '--_color---border--brand',
  ],
}: ThemeComparisonProps) {
  return (
    <div style={{ marginBottom: 'var(--_space---xl, 32px)', overflowX: 'auto' }}>
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
                  {token.replace('--_color---', '')}
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
        border: '1px solid var(--_color---border--secondary)',
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
        gap: 'var(--_space---gap--md, 8px)',
        marginBottom: 'var(--_space---xl, 32px)',
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
              borderRadius: 'var(--_border-radius---md, 4px)',
              backgroundColor: 'var(--_color---page--primary)',
              border: '1px solid var(--_color---border--secondary)',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--_color---text--primary)',
                marginBottom: '4px',
              }}
            >
              {meta?.name || key}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--_color---text--muted)',
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
                  backgroundColor: 'var(--_color---background--brand-primary)',
                  border: '1px solid var(--_color---border--secondary)',
                }}
              />
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--_color---surface--secondary)',
                  border: '1px solid var(--_color---border--secondary)',
                }}
              />
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--_color---text--brand)',
                  border: '1px solid var(--_color---border--secondary)',
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
  borderBottom: '2px solid var(--_color---border--secondary)',
  color: 'var(--_color---text--muted)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--_color---border--muted, #e0e0e0)',
  verticalAlign: 'middle',
};
