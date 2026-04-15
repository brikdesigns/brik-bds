import { type ReactNode } from 'react';
import './SidebarNavigation.css';
export interface SidebarNavItem {
    label: string;
    href: string;
    active?: boolean;
    icon?: ReactNode;
}
export interface SidebarNavigationProps {
    logo: ReactNode;
    navItems: SidebarNavItem[];
    footerActions?: ReactNode;
    userSection?: ReactNode;
    /** Custom width (default: 260px) — runtime-configurable, stays inline */
    width?: string;
}
/**
 * SidebarNavigation — fixed sidebar with logo, nav items, footer, and user section.
 *
 * Width is a runtime prop passed via inline style.
 */
export declare function SidebarNavigation({ logo, navItems, footerActions, userSection, width, }: SidebarNavigationProps): import("react/jsx-runtime").JSX.Element;
export default SidebarNavigation;
