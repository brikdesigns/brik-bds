import type { HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Dot.css';

export type DotStatus = 'default' | 'positive' | 'warning' | 'error' | 'info' | 'neutral';
export type DotSize = 'sm' | 'md' | 'lg';

export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status variant */
  status?: DotStatus;
  /** Size variant */
  size?: DotSize;
}

/**
 * Dot - Small status indicator circle.
 *
 * @example
 * ```tsx
 * <Dot status="positive" />
 * <Dot status="error" size="lg" />
 * ```
 */
export function Dot({
  status = 'default',
  size = 'md',
  className,
  style,
  ...props
}: DotProps) {
  return (
    <span
      role="status"
      aria-label={`${status} status`}
      className={bdsClass('bds-dot', `bds-dot--${size}`, `bds-dot--${status}`, className)}
      style={style}
      {...props}
    />
  );
}

export default Dot;
