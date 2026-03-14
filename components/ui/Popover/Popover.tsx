import {
  type ReactNode,
  type HTMLAttributes,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { bdsClass } from '../../utils';
import './Popover.css';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PopoverTrigger = 'click' | 'hover';

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** The trigger element */
  children: ReactNode;
  /** Popover content */
  content: ReactNode;
  /** Placement relative to trigger */
  placement?: PopoverPlacement;
  /** How to trigger the popover */
  trigger?: PopoverTrigger;
  /** Controlled open state */
  isOpen?: boolean;
  /** Controlled change handler */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Popover — floating content panel anchored to a trigger element.
 *
 * Supports click or hover triggering, 4 placements, and controlled/uncontrolled modes.
 * Uses click-outside pattern from Menu and positioning from Tooltip.
 */
export function Popover({
  children,
  content,
  placement = 'bottom',
  trigger = 'click',
  isOpen: controlledOpen,
  onOpenChange,
  className = '',
  style,
  ...props
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) setInternalOpen(open);
      if (onOpenChange) onOpenChange(open);
    },
    [isControlled, onOpenChange],
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    },
    [setOpen],
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    },
    [setOpen],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClickOutside, handleEscape]);

  const handleClick = () => {
    if (trigger === 'click') setOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') setOpen(true);
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={bdsClass('bds-popover', className)}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="bds-popover__trigger" onClick={handleClick}>
        {children}
      </div>
      {isOpen && (
        <div
          className={bdsClass('bds-popover__panel', `bds-popover__panel--${placement}`)}
          role="dialog"
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default Popover;
