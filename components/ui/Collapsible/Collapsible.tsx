'use client';

import { type ReactNode, type HTMLAttributes } from 'react';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { Icon } from '@iconify/react';
import { Plus, Minus } from '../../icons';
import { bdsClass } from '../../utils';
import './Collapsible.css';

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Section label displayed above the title (e.g. "Section 01") */
  sectionLabel?: string;
  /** Title shown in the trigger header */
  title: string;
  /** Content revealed when expanded */
  children: ReactNode;
  /** Controlled: whether the section is expanded */
  isOpen?: boolean;
  /** Callback fired when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Additional actions rendered in the header alongside the toggle */
  headerActions?: ReactNode;
}

/**
 * Progressive disclosure primitive — expandable content section with a
 * clickable header (section label + title + +/− toggle). Wraps
 * `@radix-ui/react-collapsible` for correct `aria-expanded`, keyboard
 * handling, and focus management.
 *
 * Supports both uncontrolled (`defaultOpen`) and controlled
 * (`isOpen` + `onOpenChange`) modes.
 *
 * @summary Expandable content section with header toggle
 */
export function Collapsible({
  sectionLabel,
  title,
  children,
  isOpen,
  onOpenChange,
  defaultOpen = false,
  headerActions,
  className,
  style,
  ...props
}: CollapsibleProps) {
  return (
    <RadixCollapsible.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      className={bdsClass('bds-collapsible', className)}
      style={style}
      {...props}
    >
      <RadixCollapsible.Trigger className="bds-collapsible__header">
        <div className="bds-collapsible__header-left">
          {sectionLabel && (
            <span className="bds-collapsible__section-label">{sectionLabel}</span>
          )}
          <h3 className="bds-collapsible__title">{title}</h3>
        </div>
        <div className="bds-collapsible__header-right">
          {headerActions}
          <span className="bds-collapsible__toggle" aria-hidden="true">
            <span className="bds-collapsible__icon bds-collapsible__icon--plus">
              <Icon icon={Plus} />
            </span>
            <span className="bds-collapsible__icon bds-collapsible__icon--minus">
              <Icon icon={Minus} />
            </span>
          </span>
        </div>
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content className="bds-collapsible__content">
        {children}
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
}

export default Collapsible;
