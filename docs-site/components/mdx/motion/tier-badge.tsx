import { type CSSProperties } from 'react';

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 999,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginLeft: 8,
  verticalAlign: 'middle',
};

const TIER_STYLES: Record<TierName, { bg: string; color: string; label: string }> = {
  lightweight: {
    bg: 'var(--background-brand-secondary)',
    color: 'var(--text-on-color-light)',
    label: 'Lightweight',
  },
  gsap: {
    bg: 'var(--background-brand-primary)',
    color: 'var(--text-on-color-dark)',
    label: 'GSAP',
  },
  premium: {
    bg: 'var(--background-status-purple)',
    color: 'var(--text-on-color-dark)',
    label: 'Premium',
  },
};

export type TierName = 'lightweight' | 'gsap' | 'premium';

export function TierBadge({ tier }: { tier: TierName }) {
  const t = TIER_STYLES[tier];
  return (
    <span style={{ ...badgeStyle, backgroundColor: t.bg, color: t.color }}>
      {t.label}
    </span>
  );
}
