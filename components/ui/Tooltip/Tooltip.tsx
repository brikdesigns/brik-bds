import { type ReactNode, type HTMLAttributes, useState } from 'react';
import { bdsClass } from '../../utils';
import './Tooltip.css';

/**
 * Tooltip placement positions
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip component props
 */
export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Tooltip content to display */
  content: ReactNode;
  /** Placement position relative to children */
  placement?: TooltipPlacement;
  /** Children (trigger element) */
  children: ReactNode;
}

/**
 * Tooltip - BDS themed tooltip component
 *
 * Shows contextual information on hover/focus.
 * Positioned relative to trigger element with arrow indicator.
 *
 * @example
 * ```tsx
 * <Tooltip content="Click to edit">
 *   <button>Edit</button>
 * </Tooltip>
 *
 * <Tooltip content="Helpful info" placement="right">
 *   <span>?</span>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  placement = 'top',
  children,
  className = '',
  style,
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={bdsClass('bds-tooltip', className)}
      style={style}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      {...props}
    >
      {children}
      <div
        role="tooltip"
        className={bdsClass(
          'bds-tooltip__bubble',
          `bds-tooltip__bubble--${placement}`,
          isVisible && 'bds-tooltip__bubble--visible',
        )}
      >
        {content}
        <div className={bdsClass('bds-tooltip__arrow', `bds-tooltip__arrow--${placement}`)} />
      </div>
    </div>
  );
}

export default Tooltip;
