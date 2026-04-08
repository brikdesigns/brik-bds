import React from 'react';

interface SpacingScaleProps {
  title?: string;
  scale: Record<string, string>;
  prefix: string;
}

export function SpacingScale({ title, scale, prefix }: SpacingScaleProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-sm, 20px)',
            marginBottom: 'var(--gap-md, 8px)',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {entries.map(([step, value]) => {
          const px = parseFloat(value);
          return (
            <div
              key={step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '4px 0',
              }}
            >
              <code
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '12px',
                  width: '160px',
                  flexShrink: 0,
                  color: 'var(--text-muted)',
                }}
              >
                {prefix}--{step}
              </code>
              <div
                style={{
                  width: `${Math.min(px, 300)}px`,
                  height: '20px',
                  backgroundColor: 'var(--background-brand-primary)',
                  borderRadius: '2px',
                  opacity: 0.7,
                  transition: 'width 200ms ease',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  flexShrink: 0,
                }}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SemanticSpacingProps {
  title?: string;
  tokens: Record<string, string>;
  varPrefix: string;
}

export function SemanticSpacing({ title, tokens, varPrefix }: SemanticSpacingProps) {
  const entries = Object.entries(tokens);

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-sm, 20px)',
            marginBottom: 'var(--gap-md, 8px)',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h3>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Preview</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Token</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>CSS Variable</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Maps to</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, value]) => {
            const fullVar = `${varPrefix}---${name}`;
            return (
              <tr key={name}>
                <td style={{ ...tdStyle, width: '120px' }}>
                  <div
                    style={{
                      width: `var(${fullVar}, 16px)`,
                      maxWidth: '100px',
                      height: '16px',
                      backgroundColor: 'var(--background-brand-primary)',
                      borderRadius: '2px',
                      opacity: 0.7,
                    }}
                  />
                </td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600 }}>{name}</span>
                </td>
                <td style={tdStyle}>
                  <code style={codeStyle}>{fullVar}</code>
                </td>
                <td style={tdStyle}>
                  <code style={codeStyle}>{value}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid var(--border-secondary)',
  color: 'var(--text-muted)',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-muted)',
  verticalAlign: 'middle',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: '12px',
  background: 'var(--surface-secondary)',
  padding: '2px 6px',
  borderRadius: '3px',
};
