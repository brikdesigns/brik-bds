import { type ReactNode, type HTMLAttributes, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';
import './Tooltip.css';

/** Gap between trigger and bubble (matches --padding-md fallback) */
const TOOLTIP_GAP = 8;

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
 * Bubble renders via portal to `document.body` so it escapes
 * overflow containers (board columns, scroll areas, etc.).
 *
 * @example
 * ```tsx
 * <Tooltip content="Click to edit">
 *   <button>Edit</button>
 * </Tooltip>
 *
 * <Tooltip content="Helpful info" placement="right" delay={800}>
 *   <span>?</span>
 * </Tooltip>
 * ```
 *
 * @summary Themed hover tooltip anchored to a trigger element
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
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

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
    setPos(null);
  }, [clearTimer]);

  // Calculate fixed position once the bubble is mounted and measurable
  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current || !bubbleRef.current) return;

    const tr = triggerRef.current.getBoundingClientRect();
    const br = bubbleRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = tr.top - br.height - TOOLTIP_GAP;
        left = tr.left + tr.width / 2 - br.width / 2;
        break;
      case 'bottom':
        top = tr.bottom + TOOLTIP_GAP;
        left = tr.left + tr.width / 2 - br.width / 2;
        break;
      case 'left':
        top = tr.top + tr.height / 2 - br.height / 2;
        left = tr.left - br.width - TOOLTIP_GAP;
        break;
      case 'right':
        top = tr.top + tr.height / 2 - br.height / 2;
        left = tr.right + TOOLTIP_GAP;
        break;
    }

    setPos({ top, left });
  }, [isVisible, placement]);

  // Portal bubble — fixed positioning escapes all overflow boundaries
  const bubble = (
    <div
      ref={bubbleRef}
      role="tooltip"
      className={bdsClass(
        'bds-tooltip__bubble',
        'bds-tooltip__bubble--portal',
        isVisible && pos && 'bds-tooltip__bubble--visible',
      )}
      style={pos
        ? { position: 'fixed', top: pos.top, left: pos.left }
        : { position: 'fixed', opacity: 0, pointerEvents: 'none' as const }
      }
    >
      {content}
      <div className={bdsClass('bds-tooltip__arrow', `bds-tooltip__arrow--${placement}`)} />
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className={bdsClass('bds-tooltip', className)}
      style={style}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
      {isVisible && typeof document !== 'undefined' && createPortal(bubble, document.body)}
    </div>
  );
}

export default Tooltip;
