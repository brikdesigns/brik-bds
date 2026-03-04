import { useState, useEffect } from 'react';

interface ColorSwatchProps {
  name: string;
  cssVar: string;
  isText?: boolean;
}

function ColorSwatch({ name, cssVar, isText }: ColorSwatchProps) {
  const [resolved, setResolved] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const resolve = () => {
      const body = document.querySelector('body.body') || document.body;
      setResolved(getComputedStyle(body).getPropertyValue(cssVar).trim());
    };
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [cssVar]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`var(${cssVar})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      onClick={handleCopy}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
      }}
      title={`Click to copy var(${cssVar})`}
    >
      <div
        style={{
          width: '100%',
          height: '56px',
          backgroundColor: isText ? 'var(--_color---surface--primary)' : `var(${cssVar})`,
          borderRadius: 'var(--_border-radius---sm, 2px)',
          border: '1px solid var(--_color---border--secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'box-shadow 150ms',
        }}
      >
        {isText && (
          <span style={{ color: `var(${cssVar})`, fontWeight: 700, fontSize: '1.5rem' }}>Aa</span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--_color---text--primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: copied ? 'var(--_color---text--brand)' : 'var(--_color---text--muted)',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'Copied!' : resolved || '...'}
        </div>
      </div>
    </div>
  );
}

interface ColorGridProps {
  title?: string;
  colors: Array<{ name: string; cssVar: string; isText?: boolean }>;
  columns?: number;
}

export function ColorGrid({ title, colors, columns = 6 }: ColorGridProps) {
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${Math.floor(600 / columns)}px, 1fr))`,
          gap: 'var(--_space---gap--md, 8px)',
        }}
      >
        {colors.map((c) => (
          <ColorSwatch key={c.cssVar} {...c} />
        ))}
      </div>
    </div>
  );
}

/**
 * Render a flat object of color values as swatches.
 * Useful for primitives like grayscale, theme palettes.
 */
interface PaletteGridProps {
  title?: string;
  palette: Record<string, string>;
  prefix: string;
  columns?: number;
}

export function PaletteGrid({ title, palette, prefix, columns = 8 }: PaletteGridProps) {
  const colors = Object.entries(palette).map(([name, hex]) => ({
    name,
    cssVar: `${prefix}--${name}`,
    hex,
  }));

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${Math.floor(600 / columns)}px, 1fr))`,
          gap: 'var(--_space---gap--md, 8px)',
        }}
      >
        {colors.map((c) => (
          <div key={c.cssVar} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: c.hex,
                borderRadius: 'var(--_border-radius---sm, 2px)',
                border: '1px solid var(--_color---border--secondary)',
              }}
            />
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--_color---text--primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--_color---text--muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              }}
            >
              {c.hex}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
