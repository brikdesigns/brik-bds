import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Spinner.css';

export type SpinnerSize = 'sm' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size variant */
  size?: SpinnerSize;
}

/**
 * Spinner — circular loading indicator with CSS animation
 *
 * Uses BDS tokens for colors and follows the existing animation pattern.
 */
export function Spinner({
  size = 'sm',
  className,
  style,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={bdsClass('bds-spinner', `bds-spinner--${size}`, className)}
      style={style}
      {...props}
    />
  );
}

export default Spinner;
