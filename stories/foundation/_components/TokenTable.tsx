import React, { useState, useEffect, useCallback } from 'react';

export interface TokenEntry {
  name: string;
  cssVar: string;
  value: string;
  preview?: React.ReactNode;
}

interface TokenTableProps {
  tokens: TokenEntry[];
  title?: string;
  showSearch?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 6px',
        fontSize: '11px',
        color: copied ? 'var(--_color---text--brand)' : 'var(--_color---text--muted)',
        opacity: copied ? 1 : 0.6,
        transition: 'opacity 150ms',
      }}
      title={`Copy ${text}`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function TokenTable({ tokens, title, showSearch = true }: TokenTableProps) {
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? tokens.filter(
        (t) =>
          t.name.toLowerCase().includes(filter.toLowerCase()) ||
          t.cssVar.toLowerCase().includes(filter.toLowerCase())
      )
    : tokens;

  return (
    <div style={{ marginBottom: 'var(--_space---xl, 32px)' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--_typography---font-family--heading)',
            fontSize: 'var(--_typography---heading--small, 20px)',
            marginBottom: 'var(--_space---gap--md, 8px)',
            color: 'var(--_color---text--primary)',
          }}
        >
          {title}
        </h3>
      )}

      {showSearch && tokens.length > 8 && (
        <input
          type="text"
          placeholder="Filter tokens..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '6px 12px',
            marginBottom: 'var(--_space---gap--md, 8px)',
            border: '1px solid var(--_color---border--secondary)',
            borderRadius: 'var(--_border-radius---sm, 2px)',
            background: 'var(--_color---background--primary)',
            color: 'var(--_color---text--primary)',
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: '14px',
            boxSizing: 'border-box' as const,
          }}
        />
      )}

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Preview</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Name</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>CSS Variable</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((token) => (
            <tr key={token.cssVar}>
              <td style={{ ...tdStyle, width: '60px', textAlign: 'center' }}>{token.preview}</td>
              <td style={tdStyle}>
                <span style={{ fontWeight: 600 }}>{token.name}</span>
              </td>
              <td style={tdStyle}>
                <code style={codeStyle}>{token.cssVar}</code>
                <CopyButton text={token.cssVar} />
              </td>
              <td style={tdStyle}>
                <code style={codeStyle}>{token.value}</code>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: 'var(--_color---text--muted)' }}>
                No tokens match "{filter}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid var(--_color---border--secondary)',
  color: 'var(--_color---text--muted)',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--_color---border--muted, #e0e0e0)',
  verticalAlign: 'middle',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  fontSize: '12px',
  background: 'var(--_color---surface--secondary, #f2f2f2)',
  padding: '2px 6px',
  borderRadius: '3px',
  color: 'inherit',
};

/**
 * Hook to resolve CSS variable values after theme changes
 */
export function useResolvedValue(cssVarName: string): string {
  const [value, setValue] = useState('');

  useEffect(() => {
    const resolve = () => {
      const body = document.querySelector('body.body') || document.body;
      const raw = getComputedStyle(body).getPropertyValue(cssVarName).trim();
      setValue(raw);
    };
    resolve();

    // Re-resolve when theme changes (body class mutation)
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [cssVarName]);

  return value;
}
