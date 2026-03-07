'use client';

import {
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
  useState,
  useCallback,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';

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
 * Card container styles
 *
 * Token reference:
 * - --_color---surface--primary (card background)
 * - --_space---lg = 24px (padding)
 * - --_border-radius---md = 4px (corners)
 */
const cardStyles: CSSProperties = {
  backgroundColor: 'var(--_color---surface--primary)',
  padding: 'var(--_space---lg)',
  borderRadius: 'var(--_border-radius---md)',
  width: '100%',
  boxSizing: 'border-box',
};

/**
 * Header row styles — section label + title on left, actions + toggle on right
 */
const headerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  cursor: 'pointer',
  gap: 'var(--_space---gap--lg)',
};

/**
 * Section label styles (uppercase muted text)
 *
 * Token reference:
 * - --_typography---font-family--heading (heading font)
 * - --font-weight--semi-bold
 * - --_typography---heading--xsmall = font-size-50 ≈ 11.54px
 * - --_color---text--secondary (muted gray)
 */
const sectionLabelStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--heading)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  fontSize: 'var(--_typography---heading--tiny)',
  color: 'var(--_color---text--secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  lineHeight: 'var(--font-line-height--100)',
  margin: 0,
};

/**
 * Title styles
 *
 * Token reference:
 * - --_typography---font-family--heading (heading font)
 * - --font-weight--bold = 700
 * - --_typography---heading--small = font-size-400 ≈ 22.5px
 * - --_color---text--primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--heading)',
  fontWeight: 'var(--font-weight--bold)' as unknown as number,
  fontSize: 'var(--_typography---heading--small)',
  color: 'var(--_color---text--primary)',
  lineHeight: 'var(--font-line-height--100)',
  margin: 0,
};

/**
 * Icon button styles
 *
 * Token reference:
 * - --_color---background--secondary (dark button background)
 * - --_border-radius---md = 4px
 * - --_color---text--primary (icon color)
 */
const iconButtonStyles: CSSProperties = {
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--_color---background--secondary)',
  borderRadius: 'var(--_border-radius---md)',
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  color: 'var(--_color---text--primary)',
  fontSize: 'var(--_typography---body--lg)', // bds-lint-ignore — icon sizing, not text
};

/**
 * Content area styles (expanded body)
 *
 * Token reference:
 * - --_space---lg = 24px (top margin)
 */
const contentStyles: CSSProperties = {
  marginTop: 'var(--_space---lg)',
};

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
      style={{ ...cardStyles, ...style }}
      {...props}
    >
      <div
        style={headerStyles}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---lg)', flex: 1, minWidth: 0 }}>
          {sectionLabel && (
            <span style={sectionLabelStyles}>{sectionLabel}</span>
          )}
          <h3 style={titleStyles}>{title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--_space---gap--md)' }}>
          {headerActions}
          <span style={iconButtonStyles} aria-hidden="true">
            <FontAwesomeIcon icon={open ? faMinus : faPlus} />
          </span>
        </div>
      </div>

      {open && (
        <div className="bds-collapsible-card-content" style={contentStyles}>
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleCard;
