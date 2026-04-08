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
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
};

export const docTh: CSSProperties = {
  padding: 'var(--gap-xs) var(--gap-sm)',
  textAlign: 'left',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--body-xs)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  borderBottom: '2px solid var(--border-primary)', // bds-lint-ignore
};

export const docTd: CSSProperties = {
  padding: 'var(--gap-xs) var(--gap-sm)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  borderBottom: '1px solid var(--border-muted)', // bds-lint-ignore
  color: 'var(--text-primary)',
};

export const docTdMono: CSSProperties = {
  ...docTd,
  fontFamily: 'var(--font-family-system, monospace)',
  fontSize: 'var(--body-xs)',
};

export const docTdMuted: CSSProperties = {
  ...docTd,
  fontSize: 'var(--body-xs)',
  color: 'var(--text-muted)',
};

export const docTdRight: CSSProperties = {
  ...docTd,
  textAlign: 'right',
};
