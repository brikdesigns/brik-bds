import {
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  type ButtonHTMLAttributes,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';

// ─── SidebarNavigation (wrapper) ───────────────────────────────────

/**
 * Navigation item data
 */
export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Font Awesome icon */
  icon: IconDefinition;
  /** Display label */
  label: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * SidebarNavigation component props
 */
export interface SidebarNavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Navigation items */
  items: NavItem[];
  /** Active item ID */
  activeId?: string;
  /** Logo element (optional) */
  logo?: ReactNode;
  /** Footer content (optional) */
  footer?: ReactNode;
  /** Width of sidebar */
  width?: number;
}

/**
 * Base sidebar styles using BDS tokens
 *
 * Token reference:
 * - --_color---surface--nav (navigation surface background)
 * - --_space---lg = 32px (main padding)
 * - --_space---xl = 24px (gap between sections)
 */
const sidebarStyles: CSSProperties = {
  backgroundColor: 'var(--_color---surface--nav)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  paddingLeft: 'var(--_space---lg)',
  paddingRight: 0,
  paddingTop: 'var(--_space---lg)',
  paddingBottom: 'var(--_space---lg)',
};

/**
 * SidebarNavigation - Main navigation sidebar component
 *
 * Provides vertical navigation with logo, menu items, and optional footer.
 * Supports active state indication with brand-colored border and text.
 *
 * @example
 * ```tsx
 * <SidebarNavigation
 *   items={[
 *     { id: '1', icon: faHome, label: 'Home', onClick: () => {} },
 *     { id: '2', icon: faFolder, label: 'Projects', onClick: () => {} },
 *   ]}
 *   activeId="1"
 *   logo={<img src="/logo.svg" alt="Logo" />}
 * />
 * ```
 */
export function SidebarNavigation({
  items,
  activeId,
  logo,
  footer,
  width = 246,
  className = '',
  style,
  ...props
}: SidebarNavigationProps) {
  const combinedStyles: CSSProperties = {
    ...sidebarStyles,
    width: `${width}px`,
    ...style,
  };

  return (
    <nav
      className={className || undefined}
      style={combinedStyles}
      aria-label="Sidebar navigation"
      {...props}
    >
      {/* Top section: Logo + Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {/* Logo */}
        {logo && (
          <div style={{ width: '140px', overflow: 'hidden' }}>
            {logo}
          </div>
        )}

        {/* Navigation items */}
        <nav aria-label="Main navigation" style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item) => (
            <SidebarNavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={item.id === activeId}
              onClick={item.onClick}
            />
          ))}
        </nav>
      </div>

      {/* Footer section */}
      {footer && (
        <div style={{ paddingRight: 'var(--_space---lg)' }}>
          {footer}
        </div>
      )}
    </nav>
  );
}

// ─── SidebarNavItem ────────────────────────────────────────────────

/**
 * Navigation item props
 */
export interface SidebarNavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Font Awesome icon */
  icon: IconDefinition;
  /** Display label */
  label: string;
  /** Active state */
  active?: boolean;
}

/**
 * Base navigation item styles using BDS tokens
 *
 * Token reference:
 * - --_color---background--primary (item background)
 * - --_color---text--primary (text color)
 * - --_space---gap--sm = 4px (gap between icon and text)
 * - --_space---md = 8px (vertical padding - 24px total with Spacious mode)
 * - --_typography---font-family--icon (icon font)
 * - --_typography---icon--small (icon size)
 * - --_typography---font-family--label (label font)
 * - --_typography---label--md-base (label size)
 */
const navItemStyles: CSSProperties = {
  backgroundColor: 'var(--_color---background--primary)',
  color: 'var(--_color---text--primary)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--sm)',
  paddingTop: 'var(--_space---md)',
  paddingBottom: 'var(--_space---md)',
  paddingLeft: 0,
  paddingRight: 0,
  border: 'none',
  borderRight: '3px solid transparent',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--md-base)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
};

/**
 * Active state styles using BDS tokens
 *
 * Token reference:
 * - --_color---text--brand (brand text color)
 * - --_color---border--brand (brand border color)
 */
const navItemActiveStyles: CSSProperties = {
  color: 'var(--_color---text--brand)',
  borderRightColor: 'var(--_color---border--brand)',
};

/**
 * Icon wrapper styles
 *
 * Token reference:
 * - --_typography---icon--small (icon size)
 */
const iconStyles: CSSProperties = {
  fontSize: 'var(--_typography---icon--small)',
  width: '14px',
  textAlign: 'center',
  flexShrink: 0,
};

/**
 * SidebarNavItem - Individual navigation item
 *
 * Displays an icon and label, with active state indicated by brand color
 * border on the right and brand-colored text.
 *
 * @example
 * ```tsx
 * <SidebarNavItem
 *   icon={faHome}
 *   label="Home"
 *   active={true}
 *   onClick={() => console.log('clicked')}
 * />
 * ```
 */
export function SidebarNavItem({
  icon,
  label,
  active = false,
  className = '',
  style,
  ...props
}: SidebarNavItemProps) {
  const combinedStyles: CSSProperties = {
    ...navItemStyles,
    ...(active ? navItemActiveStyles : {}),
    ...style,
  };

  return (
    <button
      type="button"
      className={className || undefined}
      style={combinedStyles}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      <span style={iconStyles}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <span>{label}</span>
    </button>
  );
}

export default SidebarNavigation;
