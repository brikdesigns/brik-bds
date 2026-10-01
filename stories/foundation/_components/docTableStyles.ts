import type { CSSProperties } from 'react';

/**
 * Shared table styles for Storybook documentation pages.
 * Use these in all TSX story files to maintain a consistent table look.
 *
 * For MDX docs, use markdown tables instead (they get Storybook's built-in styling).
 */

export const docTable: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--bds-font-family-body)',
  fontSize: 'var(--bds-body-sm)',
};

export const docTh: CSSProperties = {
  padding: 'var(--bds-gap-xs) var(--bds-gap-sm)',
  textAlign: 'left',
  color: 'var(--bds-text-secondary)',
  fontFamily: 'var(--bds-font-family-label)',
  fontSize: 'var(--bds-body-xs)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  borderBottom: '2px solid var(--bds-border-primary)',
};

export const docTd: CSSProperties = {
  padding: 'var(--bds-gap-xs) var(--bds-gap-sm)',
  fontFamily: 'var(--bds-font-family-body)',
  fontSize: 'var(--bds-body-sm)',
  borderBottom: '1px solid var(--bds-border-muted)',
  color: 'var(--bds-text-primary)',
};

export const docTdMono: CSSProperties = {
  ...docTd,
  fontFamily: 'var(--bds-font-family-system, monospace)',
  fontSize: 'var(--bds-body-xs)',
};

export const docTdMuted: CSSProperties = {
  ...docTd,
  fontSize: 'var(--bds-body-xs)',
  color: 'var(--bds-text-muted)',
};

export const docTdRight: CSSProperties = {
  ...docTd,
  textAlign: 'right',
};
