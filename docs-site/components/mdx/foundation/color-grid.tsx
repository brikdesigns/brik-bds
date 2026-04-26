'use client';

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
      requestAnimationFrame(() => {
        setResolved(getComputedStyle(document.body).getPropertyValue(cssVar).trim());
      });
    };
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
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
          backgroundColor: isText
            ? 'var(--surface-primary, #ffffff)'
            : `var(${cssVar})`,
          borderRadius: 'var(--border-radius-sm, 2px)',
          border: '1px solid var(--border-secondary, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isText && (
          <span style={{ color: `var(${cssVar})`, fontWeight: 700, fontSize: '1.5rem' }}>
            Aa
          </span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary, #111827)',
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
            color: copied
              ? 'var(--text-brand-primary, #e35335)'
              : 'var(--text-muted, #6b7280)',
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

/**
 * Live grid of resolved color tokens. Each swatch is click-to-copy and updates
 * when the docs theme changes.
 */
export function ColorGrid({ title, colors, columns = 6 }: ColorGridProps) {
  return (
    <div className="my-6">
      {title && (
        <h3 className="mb-2 text-base font-semibold">{title}</h3>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${Math.floor(600 / columns)}px, 1fr))`,
          gap: '8px',
        }}
      >
        {colors.map((c) => (
          <ColorSwatch key={c.cssVar} {...c} />
        ))}
      </div>
    </div>
  );
}

interface PaletteGridProps {
  title?: string;
  palette: Record<string, string>;
  prefix: string;
  columns?: number;
}

/**
 * Render a flat palette object (grayscale, poppy, tan, etc.) as static swatches.
 * The hex values are baked at build time — useful for primitive scales whose
 * values don't change across themes.
 */
export function PaletteGrid({ title, palette, prefix, columns = 8 }: PaletteGridProps) {
  const colors = Object.entries(palette).map(([name, hex]) => ({
    name,
    cssVar: `${prefix}-${name}`,
    hex,
  }));

  return (
    <div className="my-6">
      {title && (
        <h3 className="mb-2 text-base font-semibold">{title}</h3>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${Math.floor(600 / columns)}px, 1fr))`,
          gap: '8px',
        }}
      >
        {colors.map((c) => (
          <div key={c.cssVar} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: c.hex,
                borderRadius: 'var(--border-radius-sm, 2px)',
                border: '1px solid var(--border-secondary, #e5e7eb)',
              }}
            />
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-primary, #111827)',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {c.cssVar}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted, #6b7280)',
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
