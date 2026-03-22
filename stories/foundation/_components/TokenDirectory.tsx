import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Vite raw import — gets the CSS file as a string at build time
// Uses webflow-tokens.css (the locally-available token source)
// figma-tokens.css is CI-generated and may not exist locally
import figmaTokensRaw from '../../../tokens/webflow-tokens.css?raw';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedToken {
  /** CSS custom property name, e.g. "--text-primary" */
  name: string;
  /** Raw authored value, e.g. "var(--color-grayscale-darkest)" or "#333333" */
  rawValue: string;
  /** Category slug for filtering */
  category: string;
  /** Human-readable category label */
  categoryLabel: string;
  /** Tier: "primitive" or "semantic" */
  tier: 'primitive' | 'semantic';
}

interface CategoryDef {
  slug: string;
  label: string;
  match: (name: string, rawValue: string) => boolean;
  tier: 'primitive' | 'semantic';
}

// ---------------------------------------------------------------------------
// Category definitions (order matters — first match wins)
// ---------------------------------------------------------------------------

const categories: CategoryDef[] = [
  // Semantic (alias) tokens — these reference other tokens via var()
  { slug: 'page', label: 'Page', match: (n) => n.startsWith('--page-'), tier: 'semantic' },
  { slug: 'background', label: 'Background', match: (n) => n.startsWith('--background-'), tier: 'semantic' },
  { slug: 'surface', label: 'Surface', match: (n) => n.startsWith('--surface-'), tier: 'semantic' },
  { slug: 'text', label: 'Text', match: (n) => n.startsWith('--text-'), tier: 'semantic' },
  { slug: 'border-semantic', label: 'Border', match: (n) => /^--border-(primary|secondary|brand|inverse|muted|on-color|input)/.test(n), tier: 'semantic' },
  { slug: 'icon-size', label: 'Icon Size', match: (n) => /^--icon-(tiny|xs|sm|md|lg|xl|huge)$/.test(n), tier: 'semantic' },
  { slug: 'padding', label: 'Padding', match: (n) => n.startsWith('--padding-'), tier: 'semantic' },
  { slug: 'gap', label: 'Gap', match: (n) => n.startsWith('--gap-'), tier: 'semantic' },
  { slug: 'heading', label: 'Heading', match: (n) => n.startsWith('--heading-'), tier: 'semantic' },
  { slug: 'body', label: 'Body', match: (n) => n.startsWith('--body-'), tier: 'semantic' },
  { slug: 'label', label: 'Label', match: (n) => n.startsWith('--label-'), tier: 'semantic' },
  { slug: 'display', label: 'Display', match: (n) => n.startsWith('--display-'), tier: 'semantic' },
  { slug: 'subtitle', label: 'Subtitle', match: (n) => n.startsWith('--subtitle-'), tier: 'semantic' },
  { slug: 'border-radius-semantic', label: 'Border Radius', match: (n) => /^--border-radius-(sm|md|lg|none)$/.test(n), tier: 'semantic' },
  { slug: 'blur-radius', label: 'Blur Radius', match: (n) => n.startsWith('--blur-radius-'), tier: 'semantic' },
  { slug: 'box-shadow', label: 'Box Shadow', match: (n) => n.startsWith('--box-shadow-'), tier: 'semantic' },

  // Primitives
  { slug: 'color-grayscale', label: 'Grayscale', match: (n) => n.startsWith('--color-grayscale-'), tier: 'primitive' },
  { slug: 'color-system', label: 'System Colors', match: (n) => n.startsWith('--color-system-'), tier: 'primitive' },
  { slug: 'color-annotation', label: 'Annotation Colors', match: (n) => n.startsWith('--color-annotation-'), tier: 'primitive' },
  { slug: 'theme-color', label: 'Theme Colors', match: (n) => n.startsWith('--theme-'), tier: 'primitive' },
  { slug: 'font-weight', label: 'Font Weight', match: (n) => n.startsWith('--font-weight-'), tier: 'primitive' },
  { slug: 'font-family', label: 'Font Family', match: (n) => n.startsWith('--font-family-'), tier: 'primitive' },
  { slug: 'font-size', label: 'Font Size Scale', match: (n) => n.startsWith('--font-size-'), tier: 'primitive' },
  { slug: 'font-line-height', label: 'Line Height', match: (n) => n.startsWith('--font-line-height-'), tier: 'primitive' },
  { slug: 'space', label: 'Space Scale', match: (n) => n.startsWith('--space-'), tier: 'primitive' },
  { slug: 'size', label: 'Size Scale', match: (n) => n.startsWith('--size-'), tier: 'primitive' },
  { slug: 'border-radius-scale', label: 'Border Radius Scale', match: (n) => n.startsWith('--border-radius-'), tier: 'primitive' },
  { slug: 'border-width', label: 'Border Width', match: (n) => n.startsWith('--border-width-'), tier: 'primitive' },
  { slug: 'shadow', label: 'Shadow Primitives', match: (n) => n.startsWith('--shadow-'), tier: 'primitive' },
  { slug: 'animation', label: 'Animation', match: (n) => /^--(easing|delay|iteration|duration)-/.test(n), tier: 'primitive' },
  { slug: 'breakpoint', label: 'Breakpoints', match: (n) => n.startsWith('--breakpoint-'), tier: 'primitive' },
  { slug: 'icon-font', label: 'Icon Fonts', match: (n) => /^--icon-(logo|icon)$/.test(n), tier: 'primitive' },
];

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseTokens(css: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  // Match lines like "  --name: value;" inside :root { }
  const re = /^\s*(--[\w-]+)\s*:\s*(.+?)\s*;/gm;
  let match: RegExpExecArray | null;

  while ((match = re.exec(css)) !== null) {
    const name = match[1];
    const rawValue = match[2];

    let cat: CategoryDef | undefined;
    for (const c of categories) {
      if (c.match(name, rawValue)) {
        cat = c;
        break;
      }
    }

    tokens.push({
      name,
      rawValue,
      category: cat?.slug ?? 'other',
      categoryLabel: cat?.label ?? 'Other',
      tier: cat?.tier ?? 'primitive',
    });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Live CSS value resolver
// ---------------------------------------------------------------------------

function useResolvedValues(tokenNames: string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});
  const key = tokenNames.join(',');

  const resolve = useCallback(() => {
    const body = document.querySelector('body.body') || document.body;
    const style = getComputedStyle(body);
    const next: Record<string, string> = {};
    for (const n of tokenNames) {
      next[n] = style.getPropertyValue(n).trim();
    }
    setValues(next);
  }, [key]);

  useEffect(() => {
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [resolve]);

  return values;
}

// ---------------------------------------------------------------------------
// Preview renderers
// ---------------------------------------------------------------------------

function isColor(value: string): boolean {
  return /^#[0-9a-f]{3,8}$/i.test(value) || /^rgb/i.test(value);
}

function TokenPreview({ token, resolvedValue }: { token: ParsedToken; resolvedValue: string }) {
  const cat = token.category;

  // Color swatch
  if (
    cat.startsWith('color-') ||
    cat === 'theme-color' ||
    cat === 'page' ||
    cat === 'background' ||
    cat === 'surface' ||
    cat === 'text' ||
    cat === 'border-semantic'
  ) {
    const color = isColor(resolvedValue) ? resolvedValue : `var(${token.name})`;
    const isText = cat === 'text';
    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          border: '1px solid var(--border-muted)',
          backgroundColor: isText ? 'var(--surface-primary)' : color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isText && (
          <span style={{ color, fontWeight: 700, fontSize: 13 }}>Aa</span>
        )}
      </div>
    );
  }

  // Spacing / size / padding / gap bar
  if (['space', 'size', 'padding', 'gap'].includes(cat)) {
    const px = parseFloat(resolvedValue) || 0;
    return (
      <div
        style={{
          width: Math.min(Math.max(px, 2), 80),
          height: 12,
          borderRadius: 3,
          backgroundColor: 'var(--background-brand-primary)',
          opacity: 0.7,
        }}
      />
    );
  }

  // Border radius
  if (cat.startsWith('border-radius')) {
    return (
      <div
        style={{
          width: 32,
          height: 32,
          backgroundColor: 'var(--background-brand-primary)',
          borderRadius: resolvedValue || token.rawValue,
          opacity: 0.7,
        }}
      />
    );
  }

  // Border width
  if (cat === 'border-width') {
    return (
      <div
        style={{
          width: 40,
          borderTop: `${resolvedValue || token.rawValue} solid var(--border-primary)`,
        }}
      />
    );
  }

  // Font size
  if (cat === 'font-size' || cat === 'heading' || cat === 'body' || cat === 'label' || cat === 'display' || cat === 'subtitle') {
    const px = parseFloat(resolvedValue);
    if (px && px <= 48) {
      return (
        <span
          style={{
            fontSize: `var(${token.name})`,
            fontFamily: 'var(--font-family-body)',
            lineHeight: 1,
            color: 'var(--text-primary)',
          }}
        >
          Aa
        </span>
      );
    }
  }

  // Font weight
  if (cat === 'font-weight') {
    return (
      <span
        style={{
          fontWeight: parseInt(resolvedValue || token.rawValue, 10),
          fontSize: 13,
          fontFamily: 'var(--font-family-body)',
          color: 'var(--text-primary)',
        }}
      >
        Aa
      </span>
    );
  }

  return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>;
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(`var(${text})`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 6px',
        fontSize: 11,
        color: copied ? 'var(--text-brand-primary)' : 'var(--text-muted)',
        opacity: copied ? 1 : 0.6,
        transition: 'opacity 150ms',
        whiteSpace: 'nowrap',
      }}
      title={`Copy var(${text})`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TIERS = ['all', 'semantic', 'primitive'] as const;
type Tier = (typeof TIERS)[number];

export function TokenDirectory() {
  const allTokens = useMemo(() => parseTokens(figmaTokensRaw), []);

  const [search, setSearch] = useState('');
  const [activeTier, setActiveTier] = useState<Tier>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Build unique category list from parsed tokens
  const categoryList = useMemo(() => {
    const seen = new Map<string, { slug: string; label: string; tier: string; count: number }>();
    for (const t of allTokens) {
      const existing = seen.get(t.category);
      if (existing) {
        existing.count++;
      } else {
        seen.set(t.category, { slug: t.category, label: t.categoryLabel, tier: t.tier, count: 1 });
      }
    }
    return Array.from(seen.values());
  }, [allTokens]);

  // Filter
  const filtered = useMemo(() => {
    return allTokens.filter((t) => {
      if (activeTier !== 'all' && t.tier !== activeTier) return false;
      if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.rawValue.toLowerCase().includes(q) || t.categoryLabel.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allTokens, search, activeTier, activeCategory]);

  // Resolve live values for visible tokens
  const visibleNames = useMemo(() => filtered.map((t) => t.name), [filtered]);
  const resolved = useResolvedValues(visibleNames);

  // Visible categories based on tier filter
  const visibleCategories = useMemo(() => {
    if (activeTier === 'all') return categoryList;
    return categoryList.filter((c) => c.tier === activeTier);
  }, [categoryList, activeTier]);

  // Reset category when tier changes
  useEffect(() => {
    setActiveCategory('all');
  }, [activeTier]);

  return (
    <div style={{ fontFamily: 'var(--font-family-body)', color: 'var(--text-primary)' }}>
      {/* Header stats */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--gap-lg)',
          marginBottom: 'var(--padding-lg)',
          flexWrap: 'wrap',
        }}
      >
        <Stat label="Total tokens" value={allTokens.length} />
        <Stat label="Semantic" value={allTokens.filter((t) => t.tier === 'semantic').length} />
        <Stat label="Primitive" value={allTokens.filter((t) => t.tier === 'primitive').length} />
        <Stat label="Categories" value={categoryList.length} />
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tokens by name, value, or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '8px 12px',
          marginBottom: 'var(--padding-md)',
          border: '1px solid var(--border-input)',
          borderRadius: 'var(--border-radius-sm)',
          background: 'var(--background-input)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-family-body)',
          fontSize: 14,
          boxSizing: 'border-box' as const,
        }}
      />

      {/* Tier tabs */}
      <div style={{ display: 'flex', gap: 'var(--gap-xs)', marginBottom: 'var(--gap-md)', flexWrap: 'wrap' }}>
        {TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            style={{
              ...pillStyle,
              background: activeTier === tier ? 'var(--background-brand-primary)' : 'var(--surface-secondary)',
              color: activeTier === tier ? 'var(--text-on-color-dark)' : 'var(--text-secondary)',
              fontWeight: activeTier === tier ? 600 : 400,
            }}
          >
            {tier === 'all' ? 'All tokens' : tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--gap-xs)',
          marginBottom: 'var(--padding-md)',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            ...pillStyle,
            background: activeCategory === 'all' ? 'var(--text-primary)' : 'var(--surface-secondary)',
            color: activeCategory === 'all' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            fontWeight: activeCategory === 'all' ? 600 : 400,
          }}
        >
          All ({filtered.length})
        </button>
        {visibleCategories.map((cat) => {
          const catCount = allTokens.filter(
            (t) => t.category === cat.slug && (activeTier === 'all' || t.tier === activeTier)
          ).length;
          return (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              style={{
                ...pillStyle,
                background: activeCategory === cat.slug ? 'var(--text-primary)' : 'var(--surface-secondary)',
                color: activeCategory === cat.slug ? 'var(--text-inverse)' : 'var(--text-secondary)',
                fontWeight: activeCategory === cat.slug ? 600 : 400,
              }}
            >
              {cat.label} ({catCount})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 'var(--gap-md)',
        }}
      >
        Showing {filtered.length} of {allTokens.length} tokens
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 56 }}>Preview</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Token</th>
              <th style={{ ...thStyle, textAlign: 'left', width: 120 }}>Category</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Value (authored)</th>
              <th style={{ ...thStyle, textAlign: 'left', width: 120 }}>Resolved</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((token) => {
              const resolvedVal = resolved[token.name] || '';
              return (
                <tr key={token.name} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <TokenPreview token={token} resolvedValue={resolvedVal} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <code style={codeStyle}>{token.name}</code>
                      <CopyButton text={token.name} />
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(token.tier)}>{token.categoryLabel}</span>
                  </td>
                  <td style={tdStyle}>
                    <code style={{ ...codeStyle, fontSize: 11.5 }}>{token.rawValue}</code>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: monoFont, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      {resolvedVal || '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '32px 12px' }}>
                  No tokens match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: '12px 20px',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--border-muted)',
        backgroundColor: 'var(--surface-secondary)',
        minWidth: 100,
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: 'var(--font-family-heading)',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const monoFont = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid var(--border-secondary)',
  color: 'var(--text-muted)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  verticalAlign: 'middle',
};

const codeStyle: React.CSSProperties = {
  fontFamily: monoFont,
  fontSize: 12,
  background: 'var(--surface-secondary)',
  padding: '2px 6px',
  borderRadius: 3,
  color: 'inherit',
  wordBreak: 'break-all',
};

const pillStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 999,
  padding: '4px 12px',
  fontSize: 12,
  cursor: 'pointer',
  transition: 'all 150ms',
  whiteSpace: 'nowrap',
};

function badgeStyle(tier: 'primitive' | 'semantic'): React.CSSProperties {
  return {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    backgroundColor: tier === 'semantic' ? 'var(--background-accent-blue)' : 'var(--surface-secondary)',
    color: tier === 'semantic' ? 'var(--text-on-color-dark)' : 'var(--text-secondary)',
  };
}
