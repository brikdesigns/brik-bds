import { useState, useEffect, useCallback, type CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Shared: live CSS variable reader with theme-change reactivity
// ---------------------------------------------------------------------------

function useComputedVar(cssVar: string): string {
  const [value, setValue] = useState('');

  const read = useCallback(() => {
    const raw = getComputedStyle(document.body).getPropertyValue(cssVar).trim();
    setValue(raw);
  }, [cssVar]);

  useEffect(() => {
    read();
    // Re-read whenever theme class changes on <body>
    const observer = new MutationObserver(read);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [read]);

  return value;
}

/** Read multiple CSS vars at once, re-reads on theme change */
function useComputedVars(cssVars: string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});

  const read = useCallback(() => {
    const style = getComputedStyle(document.body);
    const next: Record<string, string> = {};
    for (const v of cssVars) {
      next[v] = style.getPropertyValue(v).trim();
    }
    setValues(next);
  }, [cssVars.join(',')]);

  useEffect(() => {
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [read]);

  return values;
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const tokenLabel: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: '11.5px',
  lineHeight: '1.4',
  color: 'var(--text-muted)',
  wordBreak: 'break-all',
};

const valueLabel: CSSProperties = {
  ...tokenLabel,
  fontSize: '11px',
  color: 'var(--text-secondary)',
};

const sectionHeading: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-sm)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-primary)',
  margin: '0 0 var(--gap-lg) 0',
};

// ---------------------------------------------------------------------------
// PaletteGrid — primitive color scale display
// ---------------------------------------------------------------------------

interface PaletteGridProps {
  title?: string;
  palette: Record<string, string>;
  prefix: string;
  columns?: number;
}

export function PaletteGrid({ title, palette, prefix, columns = 6 }: PaletteGridProps) {
  return (
    <div style={{ marginBottom: 'var(--padding-lg)' }}>
      {title && <h4 style={sectionHeading}>{title}</h4>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 'var(--gap-md)',
        }}
      >
        {Object.entries(palette).map(([name, hex]) => (
          <div key={name}>
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: hex,
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-muted)',
              }}
            />
            <div style={{ ...tokenLabel, marginTop: '6px' }}>{prefix}--{name}</div>
            <div style={valueLabel}>{hex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColorGrid — semantic color tokens (live from CSS)
// ---------------------------------------------------------------------------

interface ColorDef {
  name: string;
  cssVar: string;
  isText?: boolean;
}

interface ColorGridProps {
  colors: ColorDef[];
  columns?: number;
}

export function ColorGrid({ colors, columns = 4 }: ColorGridProps) {
  const vars = colors.map((c) => c.cssVar);
  const resolved = useComputedVars(vars);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--gap-lg)',
        marginBottom: 'var(--padding-lg)',
      }}
    >
      {colors.map((color) => {
        const hex = resolved[color.cssVar] || '';
        return (
          <div key={color.cssVar}>
            <div
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: color.isText ? 'var(--surface-primary)' : `var(${color.cssVar})`,
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {color.isText && (
                <span
                  style={{
                    color: `var(${color.cssVar})`,
                    fontWeight: 'var(--font-weight-bold)' as unknown as number,
                    fontSize: 'var(--body-lg)',
                    fontFamily: 'var(--font-family-body)',
                  }}
                >
                  Aa
                </span>
              )}
            </div>
            <div style={{ ...tokenLabel, marginTop: '6px' }}>{color.name}</div>
            <div style={{ ...tokenLabel, fontSize: '10.5px' }}>{color.cssVar}</div>
            <div style={valueLabel}>{hex}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ThemeComparison — shows key tokens across all themes (removed, replaced by dynamic)
// ---------------------------------------------------------------------------

export function ThemeComparison() {
  return (
    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)' }}>
      Switch themes in the toolbar to see how semantic tokens resolve to different values.
    </p>
  );
}

// ---------------------------------------------------------------------------
// ThemeOverview — overview of all themes for DesignTokens.mdx
// ---------------------------------------------------------------------------

export function ThemeOverview() {
  const themes = [
    { num: 'brik', name: 'Brik Brand', fonts: 'Poppins', mode: 'Light' },
    { num: '1', name: 'Default', fonts: 'Droid Sans / Open Sans', mode: 'Light' },
    { num: '2', name: 'Dark', fonts: 'Geist / Geist Mono', mode: 'Dark' },
    { num: '3', name: 'Blue', fonts: 'IBM Plex Sans / Source Sans 3', mode: 'Light' },
    { num: '4', name: 'Gold', fonts: 'Lato / Hind', mode: 'Light' },
    { num: '5', name: 'Peach', fonts: 'Newsreader / Open Sans', mode: 'Light' },
    { num: '6', name: 'Minimal', fonts: 'IBM Plex Sans / Source Sans 3', mode: 'Light' },
    { num: '7', name: 'Warm', fonts: 'Lato / Hind', mode: 'Light' },
    { num: '8', name: 'Vibrant', fonts: 'Playfair Display / Hind', mode: 'Light' },
  ];

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-sm)',
      }}
    >
      <thead>
        <tr>
          {['#', 'Name', 'Fonts', 'Mode'].map((h) => (
            <th
              key={h}
              style={{
                textAlign: 'left',
                padding: 'var(--gap-sm) var(--gap-md)',
                borderBottom: '2px solid var(--border-secondary)',
                fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
                color: 'var(--text-primary)',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {themes.map((t) => (
          <tr key={t.num}>
            <td style={{ padding: 'var(--gap-sm) var(--gap-md)', borderBottom: '1px solid var(--border-muted)', fontFamily: tokenLabel.fontFamily }}>{t.num}</td>
            <td style={{ padding: 'var(--gap-sm) var(--gap-md)', borderBottom: '1px solid var(--border-muted)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number }}>{t.name}</td>
            <td style={{ padding: 'var(--gap-sm) var(--gap-md)', borderBottom: '1px solid var(--border-muted)' }}>{t.fonts}</td>
            <td style={{ padding: 'var(--gap-sm) var(--gap-md)', borderBottom: '1px solid var(--border-muted)' }}>{t.mode}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// TypographyScale — font size primitive scale
// ---------------------------------------------------------------------------

interface TypographyScaleProps {
  scale: Record<string, string>;
  prefix: string;
}

export function TypographyScale({ scale, prefix }: TypographyScaleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
      {Object.entries(scale)
        .filter(([, v]) => parseFloat(v) <= 72)
        .map(([step, value]) => (
          <div
            key={step}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 80px 1fr',
              alignItems: 'baseline',
              gap: 'var(--gap-md)',
              padding: 'var(--gap-xs) 0',
              borderBottom: '1px solid var(--border-muted)',
            }}
          >
            <span style={tokenLabel}>{prefix}-{step}</span>
            <span style={valueLabel}>{value}</span>
            <span
              style={{
                fontSize: value,
                fontFamily: 'var(--font-family-body)',
                lineHeight: '1.2',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              The quick brown fox
            </span>
          </div>
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FontFamilyShowcase — live font family display
// ---------------------------------------------------------------------------

interface FontFamilyDef {
  name: string;
  cssVar: string;
  value: string;
}

interface FontFamilyShowcaseProps {
  families: FontFamilyDef[];
}

export function FontFamilyShowcase({ families }: FontFamilyShowcaseProps) {
  const vars = families.map((f) => f.cssVar);
  const resolved = useComputedVars(vars);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', marginBottom: 'var(--padding-lg)' }}>
      {families.map((f) => {
        const liveValue = resolved[f.cssVar] || f.value;
        return (
          <div
            key={f.cssVar}
            style={{
              padding: 'var(--padding-md)',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-muted)',
              backgroundColor: 'var(--surface-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--gap-sm)' }}>
              <span
                style={{
                  fontFamily: 'var(--font-family-label)',
                  fontSize: 'var(--label-md)',
                  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {f.name}
              </span>
              <span style={tokenLabel}>{f.cssVar}</span>
            </div>
            <div
              style={{
                fontFamily: `var(${f.cssVar})`,
                fontSize: 'var(--heading-lg)',
                color: 'var(--text-primary)',
                lineHeight: '1.3',
                marginBottom: 'var(--gap-xs)',
              }}
            >
              The quick brown fox jumps over the lazy dog
            </div>
            <div style={valueLabel}>{liveValue}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SemanticTypographyTable — heading/body/label/display size table
// ---------------------------------------------------------------------------

interface SemanticTypographyTableProps {
  title: string;
  tokens: Record<string, string>;
  category: string;
}

export function SemanticTypographyTable({ tokens, category }: SemanticTypographyTableProps) {
  const entries = Object.entries(tokens).filter(([key]) => key.startsWith(`${category}--`) || key.startsWith(`${category}-`));
  if (entries.length === 0) return null;

  // Determine font family var for this category
  const fontFamilyVar = category === 'icon'
    ? '--font-family-icon'
    : `--font-family-${category === 'body' || category === 'label' ? category : 'heading'}`;

  return (
    <div style={{ marginBottom: 'var(--padding-lg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {entries.map(([key, refValue]) => {
          const cssVar = `--${key}`;
          return (
            <div
              key={key}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 160px 1fr',
                alignItems: 'baseline',
                gap: 'var(--gap-md)',
                padding: 'var(--gap-md) 0',
                borderBottom: '1px solid var(--border-muted)',
              }}
            >
              <span style={tokenLabel}>{cssVar}</span>
              <span style={valueLabel}>{refValue}</span>
              <span
                style={{
                  fontSize: `var(${cssVar})`,
                  fontFamily: `var(${fontFamilyVar})`,
                  lineHeight: '1.3',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {category === 'icon' ? '\uf015 \uf007 \uf0e0' : 'The quick brown fox'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FontWeightShowcase
// ---------------------------------------------------------------------------

interface FontWeightShowcaseProps {
  weights: Record<string, string>;
}

export function FontWeightShowcase({ weights }: FontWeightShowcaseProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: 'var(--padding-lg)' }}>
      {Object.entries(weights).map(([name, value]) => (
        <div
          key={name}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 60px 1fr',
            alignItems: 'baseline',
            gap: 'var(--gap-md)',
            padding: 'var(--gap-md) 0',
            borderBottom: '1px solid var(--border-muted)',
          }}
        >
          <span style={tokenLabel}>--font-weight-{name}</span>
          <span style={valueLabel}>{value}</span>
          <span
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-lg)',
              fontWeight: parseInt(value, 10),
              color: 'var(--text-primary)',
            }}
          >
            The quick brown fox jumps over the lazy dog
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SpacingScale — space/size primitive scale
// ---------------------------------------------------------------------------

interface SpacingScaleProps {
  scale: Record<string, string>;
  prefix: string;
}

export function SpacingScale({ scale, prefix }: SpacingScaleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: 'var(--padding-lg)' }}>
      {Object.entries(scale).map(([step, value]) => {
        const px = parseFloat(value);
        return (
          <div
            key={step}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 80px 1fr',
              alignItems: 'center',
              gap: 'var(--gap-md)',
              padding: 'var(--gap-xs) 0',
              borderBottom: '1px solid var(--border-muted)',
            }}
          >
            <span style={tokenLabel}>{prefix}-{step}</span>
            <span style={valueLabel}>{value}</span>
            <div
              style={{
                width: `${Math.min(px, 300)}px`,
                height: '12px',
                backgroundColor: 'var(--background-brand-primary)',
                borderRadius: 'var(--border-radius-sm)',
                opacity: 0.7,
                minWidth: '2px',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SemanticSpacing — semantic padding/gap tokens
// ---------------------------------------------------------------------------

interface SemanticSpacingProps {
  title: string;
  tokens: Record<string, string>;
  varPrefix: string;
}

export function SemanticSpacing({ tokens }: SemanticSpacingProps) {
  return (
    <div style={{ marginBottom: 'var(--padding-lg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {Object.entries(tokens).map(([name, refValue]) => {
          const cssVar = `--${name}`;
          return (
            <LiveSpacingRow key={name} cssVar={cssVar} refValue={refValue} />
          );
        })}
      </div>
    </div>
  );
}

function LiveSpacingRow({ cssVar, refValue }: { cssVar: string; refValue: string }) {
  const resolved = useComputedVar(cssVar);
  const px = parseFloat(resolved) || 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 160px 80px 1fr',
        alignItems: 'center',
        gap: 'var(--gap-md)',
        padding: 'var(--gap-xs) 0',
        borderBottom: '1px solid var(--border-muted)',
      }}
    >
      <span style={tokenLabel}>{cssVar}</span>
      <span style={valueLabel}>{refValue}</span>
      <span style={valueLabel}>{resolved || '—'}</span>
      <div
        style={{
          width: `${Math.min(px, 200)}px`,
          height: '12px',
          backgroundColor: 'var(--background-brand-primary)',
          borderRadius: 'var(--border-radius-sm)',
          opacity: 0.7,
          minWidth: px > 0 ? '2px' : '0',
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// BorderRadiusPreview — border radius scale
// ---------------------------------------------------------------------------

interface BorderRadiusPreviewProps {
  scale: Record<string, string>;
  prefix: string;
}

export function BorderRadiusPreview({ scale, prefix }: BorderRadiusPreviewProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 'var(--gap-lg)',
        marginBottom: 'var(--padding-lg)',
      }}
    >
      {Object.entries(scale).map(([step, value]) => (
        <div key={step} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--background-brand-primary)',
              borderRadius: value,
              margin: '0 auto var(--gap-sm)',
              opacity: 0.8,
            }}
          />
          <div style={tokenLabel}>{prefix}-{step}</div>
          <div style={valueLabel}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BorderWidthPreview — border width scale
// ---------------------------------------------------------------------------

interface BorderWidthPreviewProps {
  scale: Record<string, string>;
  prefix: string;
}

export function BorderWidthPreview({ scale, prefix }: BorderWidthPreviewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: 'var(--padding-lg)' }}>
      {Object.entries(scale).map(([step, value]) => (
        <div
          key={step}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 80px 1fr',
            alignItems: 'center',
            gap: 'var(--gap-md)',
            padding: 'var(--gap-md) 0',
            borderBottom: '1px solid var(--border-muted)',
          }}
        >
          <span style={tokenLabel}>{prefix}-{step}</span>
          <span style={valueLabel}>{value}</span>
          <div
            style={{
              height: '0',
              borderTop: `${value} solid var(--border-primary)`,
              width: '100%',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShadowScale — shadow blur/spread scale
// ---------------------------------------------------------------------------

interface ShadowScaleProps {
  scale: Record<string, string>;
  prefix: string;
  label: string;
}

export function ShadowScale({ scale, prefix, label }: ShadowScaleProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 'var(--gap-lg)',
        marginBottom: 'var(--padding-lg)',
      }}
    >
      {Object.entries(scale).map(([step, value]) => {
        const px = parseFloat(value);
        const shadow =
          label === 'blur'
            ? `0 2px ${value} 0 rgba(0,0,0,0.15)`
            : `0 0 4px ${value} rgba(0,0,0,0.12)`;
        return (
          <div key={step} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--surface-primary)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: px > 0 ? shadow : 'none',
                border: px === 0 ? '1px solid var(--border-muted)' : 'none',
                margin: '0 auto var(--gap-sm)',
              }}
            />
            <div style={tokenLabel}>--{prefix}-{step}</div>
            <div style={valueLabel}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}
