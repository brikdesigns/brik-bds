import { type ReactNode, type CSSProperties } from 'react';

/**
 * Navigation item configuration
 */
export interface SidebarNavItem {
  /** Item label */
  label: string;
  /** Link href */
  href: string;
  /** Whether this item is currently active */
  active?: boolean;
  /** Optional icon element */
  icon?: ReactNode;
}

/**
 * SidebarNavigation component props
 */
export interface SidebarNavigationProps {
  /** Logo element to display at top */
  logo: ReactNode;
  /** Navigation items */
  navItems: SidebarNavItem[];
  /** Footer actions (buttons, links) */
  footerActions?: ReactNode;
  /** User info section */
  userSection?: ReactNode;
  /** Optional custom width (default: 260px) */
  width?: string;
}

/**
 * Container styles
 *
 * Token reference:
 * - --_color---surface--primary (sidebar background)
 * - --_color---border--secondary (sidebar border)
 */
const containerStyles: CSSProperties = {
  backgroundColor: 'var(--_color---surface--primary)',
  borderRight: '1px solid var(--_color---border--secondary)',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 10,
};

/**
 * Logo section styles
 *
 * Token reference:
 * - --_color---border--secondary (bottom border)
 */
const logoSectionStyles: CSSProperties = {
  padding: '24px 24px 20px',
  borderBottom: '1px solid var(--_color---border--secondary)',
};

/**
 * Navigation section styles
 */
const navSectionStyles: CSSProperties = {
  flex: 1,
  padding: '16px 12px',
  overflowY: 'auto',
};

/**
 * Navigation item base styles
 *
 * Token reference:
 * - --_typography---font-family--body (nav font)
 * - --_color---text--secondary (default text)
 */
const navItemBaseStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '6px',
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: '14px',
  fontWeight: 400,
  color: 'var(--_color---text--secondary)',
  backgroundColor: 'transparent',
  textDecoration: 'none',
  marginBottom: '4px',
  transition: 'background-color 0.15s, color 0.15s',
  cursor: 'pointer',
};

/**
 * Active navigation item styles
 *
 * Token reference:
 * - --_color---text--primary (active text)
 * - --_color---page--secondary (active background)
 */
const navItemActiveStyles: CSSProperties = {
  fontWeight: 600,
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---page--secondary)',
};

/**
 * Navigation item indicator dot
 *
 * Token reference:
 * - --brand--primary (active indicator)
 * - --_color---border--secondary (inactive indicator)
 */
const indicatorStyles = (active: boolean): CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '2px',
  backgroundColor: active ? 'var(--brand--primary)' : 'var(--_color---border--secondary)',
  flexShrink: 0,
});

/**
 * Footer section styles
 *
 * Token reference:
 * - --_color---border--secondary (top border)
 */
const footerSectionStyles: CSSProperties = {
  padding: '12px 24px',
  borderTop: '1px solid var(--_color---border--secondary)',
};

/**
 * User section styles
 *
 * Token reference:
 * - --_color---border--secondary (top border)
 */
const userSectionStyles: CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid var(--_color---border--secondary)',
};

/**
 * SidebarNavigation - BDS themed sidebar navigation component
 *
 * Provides a fixed-position sidebar with logo, navigation items, footer actions,
 * and user section. Uses BDS tokens for consistent theming.
 *
 * @example
 * ```tsx
 * <SidebarNavigation
 *   logo={<img src="/logo.svg" alt="Logo" />}
 *   navItems={[
 *     { label: 'Dashboard', href: '/dashboard', active: true },
 *     { label: 'Settings', href: '/settings' },
 *   ]}
 *   footerActions={<Button>Action</Button>}
 *   userSection={<UserInfo name="John Doe" />}
 * />
 * ```
 */
export function SidebarNavigation({
  logo,
  navItems,
  footerActions,
  userSection,
  width = '260px',
}: SidebarNavigationProps) {
  return (
    <aside style={{ ...containerStyles, width }}>
      {/* Logo Section */}
      <div style={logoSectionStyles}>{logo}</div>

      {/* Navigation */}
      <nav style={navSectionStyles}>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              ...navItemBaseStyles,
              ...(item.active ? navItemActiveStyles : {}),
            }}
          >
            {item.icon ? (
              item.icon
            ) : (
              <span style={indicatorStyles(item.active || false)} />
            )}
            {item.label}
          </a>
        ))}
      </nav>

      {/* Footer Actions */}
      {footerActions && <div style={footerSectionStyles}>{footerActions}</div>}

      {/* User Section */}
      {userSection && <div style={userSectionStyles}>{userSection}</div>}
    </aside>
  );
}

export default SidebarNavigation;
