import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Divider spacing sizes
 */
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

/**
 * Divider component props
 */
export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Orientation of the divider line */
  orientation?: DividerOrientation;
  /** Spacing (margin) above and below (or left/right for vertical) */
  spacing?: DividerSpacing;
}

/**
 * Spacing values using BDS spacing tokens
 *
 * Token reference:
 * - --padding-none = 0px
 * - --padding-sm = 12px
 * - --padding-md = 16px
 * - --padding-lg = 24px
 */
const spacingValues: Record<DividerSpacing, string> = {
  none: 'var(--padding-none)',
  sm: 'var(--padding-sm)',
  md: 'var(--padding-md)',
  lg: 'var(--padding-lg)',
};

/**
 * Divider - BDS themed visual separator
 *
 * A simple horizontal or vertical line for dividing content sections.
 * Uses BDS border tokens for color and weight.
 *
 * Token reference:
 * - --border-muted (line color — subtle separator)
 * - --border-width-sm (line thickness — thinnest visible)
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
  className = '',
  style,
  ...props
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';
  const spacingValue = spacingValues[spacing];

  const dividerStyles: CSSProperties = {
    border: 'none',
    margin: 0,
    ...(isHorizontal
      ? {
          width: '100%',
          height: 0,
          borderTop: 'var(--border-width-sm) solid var(--border-muted)',
          marginTop: spacingValue,
          marginBottom: spacingValue,
        }
      : {
          width: 0,
          height: '100%',
          alignSelf: 'stretch',
          borderLeft: 'var(--border-width-sm) solid var(--border-muted)',
          marginLeft: spacingValue,
          marginRight: spacingValue,
        }),
    ...style,
  };

  return (
    <hr
      className={bdsClass('bds-divider', className)}
      style={dividerStyles}
      role={isHorizontal ? 'separator' : 'separator'}
      aria-orientation={orientation}
      {...props}
    />
  );
}

export default Divider;
