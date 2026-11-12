import {
  type ReactNode,
  type HTMLAttributes,
  isValidElement,
  useState,
  useCallback,
} from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
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
  /** Accessible name for the `role="dialog"` panel. Always supply one — a dialog without a name is announced as just "dialog". */
  panelLabel?: string;
  /** Controlled open state */
  isOpen?: boolean;
  /** Controlled change handler */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Popover — floating content panel anchored to a trigger element.
 *
 * Supports click or hover triggering, 4 placements, and controlled/uncontrolled modes.
 * Built on Radix Popover: the click trigger carries `aria-haspopup`/`aria-expanded`,
 * focus moves into the panel on open and returns to the trigger on close.
 *
 * @summary Floating content panel anchored to a trigger
 */
export function Popover({
  children,
  content,
  placement = 'bottom',
  trigger = 'click',
  panelLabel,
  isOpen: controlledOpen,
  onOpenChange,
  className = '',
  style,
  ...props
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) setInternalOpen(open);
      if (onOpenChange) onOpenChange(open);
    },
    [isControlled, onOpenChange],
  );

  const isHover = trigger === 'hover';

  const handleMouseEnter = () => {
    if (isHover) setOpen(true);
  };

  const handleMouseLeave = () => {
    if (isHover) setOpen(false);
  };

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={setOpen}>
      <div
        className={bdsClass('bds-popover', className)}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {isHover ? (
          // Hover opens by pointer, not by activation — an Anchor keeps Radix's
          // click-toggle (and its aria-expanded) off the trigger.
          <RadixPopover.Anchor className="bds-popover__trigger">{children}</RadixPopover.Anchor>
        ) : (
          <div className="bds-popover__trigger">
            <RadixPopover.Trigger asChild={isValidElement(children)}>{children}</RadixPopover.Trigger>
          </div>
        )}
      </div>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={bdsClass('bds-popover__panel')}
          side={placement}
          sideOffset={4}
          role="dialog"
          aria-label={panelLabel}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onOpenAutoFocus={isHover ? (e) => e.preventDefault() : undefined}
          onCloseAutoFocus={isHover ? (e) => e.preventDefault() : undefined}
        >
          {content}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

export default Popover;
