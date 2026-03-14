import type { HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Orientation of the divider line */
  orientation?: DividerOrientation;
  /** Spacing (margin) above and below (or left/right for vertical) */
  spacing?: DividerSpacing;
}

/**
 * Divider - Visual separator for content sections.
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider spacing="lg" />
 * <Divider orientation="vertical" />
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  spacing = 'none',
  className,
  style,
  ...props
}: DividerProps) {
  return (
    <hr
      className={bdsClass(
        'bds-divider',
        `bds-divider--${orientation}`,
        spacing !== 'none' && `bds-divider--spacing-${spacing}`,
        className,
      )}
      style={style}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}

export default Divider;
