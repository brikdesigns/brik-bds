import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Spinner size variants
 */
export type SpinnerSize = 'sm' | 'lg';

/**
 * Spinner component props
 */
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size variant */
  size?: SpinnerSize;
}

/**
 * Size-based dimensions
 *
 * Based on Figma specs:
 * - sm: 16x16px (node 26776:8169)
 * - lg: 48x48px (node 26776:8168)
 */
const sizeStyles: Record<SpinnerSize, CSSProperties> = {
  sm: {
    width: '16px', // bds-lint-ignore — Figma-driven spinner dimensions
    height: '16px', // bds-lint-ignore
    borderWidth: 'var(--border-width-lg)',
  },
  lg: {
    width: '48px', // bds-lint-ignore — Figma-driven spinner dimensions
    height: '48px', // bds-lint-ignore
    borderWidth: 'var(--border-width-huge)',
  },
};

/**
 * Spin animation keyframes
 * Matches existing BDS animation pattern from css/animations.css
 */
const spinKeyframes = `
  @keyframes bds-spinner-spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * Base spinner styles using BDS tokens
 *
 * Token reference:
 * - --color-grayscale-lighter = #e0e0e0 (light border)
 * - --theme-blue-blue-light (theme-aware primary color)
 */
const baseStyles: CSSProperties = {
  display: 'inline-block',
  borderRadius: '50%',
  borderStyle: 'solid',
  borderColor: 'var(--border-primary)',
  borderTopColor: 'var(--border-brand-primary)',
  animation: 'bds-spinner-spin 0.8s linear infinite',
};

/**
 * Spinner - BDS themed loading spinner component
 *
 * A simple circular loading indicator with CSS animation.
 * Uses BDS tokens for colors and follows the existing animation pattern.
 *
 * @example
 * ```tsx
 * <Spinner size="sm" />
 * <Spinner size="lg" />
 * ```
 */
export function Spinner({
  size = 'sm',
  className = '',
  style,
  ...props
}: SpinnerProps) {
  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...style,
  };

  return (
    <>
      <style>{spinKeyframes}</style>
      <div
        role="status"
        aria-label="Loading"
        className={bdsClass('bds-spinner', className)}
        style={combinedStyles}
        {...props}
      />
    </>
  );
}

export default Spinner;
