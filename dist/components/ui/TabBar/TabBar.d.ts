import { type HTMLAttributes } from 'react';
import './TabBar.css';
/**
 * Tab item
 */
export interface TabItem {
    /** Tab label */
    label: string;
    /** Whether this tab is currently active */
    active?: boolean;
    /** Whether this tab is disabled */
    disabled?: boolean;
    /** Click handler */
    onClick?: () => void;
}
/** Visual variant matching Figma spec */
export type TabBarVariant = 'text' | 'tab' | 'box';
/**
 * TabBar component props
 */
export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Tab items */
    items: TabItem[];
    /** Visual variant */
    variant?: TabBarVariant;
    /**
     * On-color mode — for use on brand/dark backgrounds.
     * Switches text and border colors to on-color-dark tokens
     * for legibility against colored surfaces.
     */
    onColor?: boolean;
}
/**
 * TabBar — BDS horizontal tab navigation
 *
 * Three visual variants matching Figma:
 * - **text** (default): plain text links with brand color for active
 * - **tab**: underline indicator with bottom border
 * - **box**: filled background for active, bordered for inactive
 *
 * Use `onColor` for placement on dark/brand backgrounds.
 *
 * @example
 * ```tsx
 * <TabBar
 *   variant="tab"
 *   items={[
 *     { label: 'Overview', active: true },
 *     { label: 'Billing', onClick: () => setTab('billing') },
 *     { label: 'Security', onClick: () => setTab('security') },
 *   ]}
 * />
 * ```
 */
export declare function TabBar({ items, variant, onColor, className, style, ...props }: TabBarProps): import("react/jsx-runtime").JSX.Element;
export default TabBar;
