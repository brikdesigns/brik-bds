'use client';

import {
  type ReactNode,
  type HTMLAttributes,
  useState,
  useCallback,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
import './CollapsibleCard.css';

/**
 * CollapsibleCard component props
 */
export interface CollapsibleCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Section label displayed above the title (e.g. "Section 01") */
  sectionLabel?: string;
  /** Card title */
  title: string;
  /** Content revealed when expanded */
  children: ReactNode;
  /** Controlled: whether the card is expanded */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Additional action buttons rendered next to the toggle */
  headerActions?: ReactNode;
}

/**
 * CollapsibleCard - BDS composite component
 *
 * A card with a collapsible content area, section label, title,
 * and icon button toggle (+/−). Designed for proposal sections,
 * settings panels, or any content that benefits from progressive disclosure.
 *
 * Composes: Card surface + icon button + collapse state
 *
 * @example
 * ```tsx
 * <CollapsibleCard
 *   sectionLabel="Section 01"
 *   title="Overview and Goals"
 *   defaultOpen={false}
 * >
 *   <p>Content goes here</p>
 * </CollapsibleCard>
 * ```
 */
export function CollapsibleCard({
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
}: CollapsibleCardProps) {
  const isControlled = isOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? isOpen : internalOpen;

  const handleToggle = useCallback(() => {
    const next = !open;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);

  return (
    <div
      className={bdsClass('bds-collapsible-card', className)}
      style={style}
      {...props}
    >
      <div
        className="bds-collapsible-card__header"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="bds-collapsible-card__header-left">
          {sectionLabel && (
            <span className="bds-collapsible-card__section-label">{sectionLabel}</span>
          )}
          <h3 className="bds-collapsible-card__title">{title}</h3>
        </div>
        <div className="bds-collapsible-card__header-right">
          {headerActions}
          <span className="bds-collapsible-card__toggle" aria-hidden="true">
            <FontAwesomeIcon icon={open ? faMinus : faPlus} />
          </span>
        </div>
      </div>

      {open && (
        <div className="bds-collapsible-card__content">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleCard;
