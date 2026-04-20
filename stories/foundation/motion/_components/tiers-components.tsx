import { type CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const codeBlock: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  backgroundColor: 'var(--surface-secondary)',
  padding: '12px 16px',
  borderRadius: 'var(--border-radius-sm)',
  overflow: 'auto',
  whiteSpace: 'pre',
  margin: '8px 0',
  border: '1px solid var(--border-muted)',
};

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 999,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

// ---------------------------------------------------------------------------
// TierBadge — shows which tier an effect belongs to
// ---------------------------------------------------------------------------

export function TierBadge({ tier }: { tier: 'lightweight' | 'gsap' | 'premium' }) {
  const colors = {
    lightweight: { bg: 'var(--background-brand-secondary)', color: '#fff' },
    gsap: { bg: 'var(--background-brand-primary)', color: '#fff' },
    premium: { bg: '#7c3aed', color: '#fff' },
  };
  const labels = { lightweight: 'Lightweight', gsap: 'GSAP', premium: 'Premium' };

  return (
    <span style={{ ...badgeStyle, backgroundColor: colors[tier].bg, color: colors[tier].color }}>
      {labels[tier]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CodeSnippet — formatted code display
// ---------------------------------------------------------------------------

export function CodeSnippet({ code }: { code: string }) {
  return <pre style={codeBlock}>{code}</pre>;
}
