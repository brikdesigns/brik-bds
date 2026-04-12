import { type ReactNode, type HTMLAttributes, useState, useRef, useCallback } from 'react';
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
  /** Delay in ms before showing the tooltip (default: 0 = instant) */
  delay?: number;
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
  delay = 0,
  children,
  className = '',
  style,
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const show = useCallback(() => {
    clearTimer();
    if (delay > 0) {
      timerRef.current = setTimeout(() => setIsVisible(true), delay);
    } else {
      setIsVisible(true);
    }
  }, [delay, clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    setIsVisible(false);
  }, [clearTimer]);

  return (
    <div
      className={bdsClass('bds-tooltip', className)}
      style={style}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
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
