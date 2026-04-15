import { type HTMLAttributes, type ReactNode } from 'react';
import './NavBar.css';
/**
 * Navigation link item
 */
export interface NavBarLink {
    /** Display label */
    label: string;
    /** Link URL */
    href: string;
    /** Whether this link is currently active */
    active?: boolean;
}
/**
 * NavBar component props
 */
export interface NavBarProps extends HTMLAttributes<HTMLElement> {
    /** Logo element (image, SVG, or text) */
    logo: ReactNode;
    /** Navigation links */
    links?: NavBarLink[];
    /** Right-side actions (buttons, dropdowns) */
    actions?: ReactNode;
    /** Sticky positioning */
    sticky?: boolean;
}
/**
 * NavBar - BDS horizontal top navigation bar
 *
 * A responsive navigation bar with logo, links, and optional action area.
 * Matches the Webflow .navbar component structure.
 *
 * @example
 * ```tsx
 * <NavBar
 *   logo={<img src="/logo.svg" alt="Logo" height={32} />}
 *   links={[
 *     { label: 'Home', href: '/', active: true },
 *     { label: 'Features', href: '/features' },
 *     { label: 'Pricing', href: '/pricing' },
 *   ]}
 *   actions={<Button size="sm">Get Started</Button>}
 * />
 * ```
 */
export declare function NavBar({ logo, links, actions, sticky, className, style, ...props }: NavBarProps): import("react/jsx-runtime").JSX.Element;
export default NavBar;
