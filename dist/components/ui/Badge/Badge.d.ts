import { type HTMLAttributes, type ReactNode } from 'react';
import './Badge.css';
/** Badge status variants */
export type BadgeStatus = 'positive' | 'warning' | 'error' | 'info' | 'progress' | 'brand';
/** Badge size variants — shared scale with Tag */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
/** Badge visual style — dark (saturated bg) or light (pastel bg) */
export type BadgeVariant = 'dark' | 'light';
/** Badge component props */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** Status variant */
    status?: BadgeStatus;
    /** Size variant — xs is icon-only (no text) */
    size?: BadgeSize;
    /** Visual style — dark uses saturated bg, light uses pastel bg */
    variant?: BadgeVariant;
    /** Children content (optional for xs/icon-only size) */
    children?: ReactNode;
    /** Optional icon before text (required for xs size) */
    icon?: ReactNode;
}
/**
 * Badge — status indicator with semantic colors.
 *
 * Pill-shaped label for communicating status, category, or count.
 * Uses BDS system color tokens for consistent status semantics.
 * Sizing scale is shared with Tag for side-by-side alignment.
 *
 * **Indicator, not action.** Badge is non-interactive. Render it as a
 * `<span>` reflecting state; never attach `onClick` or wrap it to
 * navigate. For clickable pills use `Chip` (filters, selections) or
 * `Button` / `LinkButton` (primary actions). See the "Indicators vs
 * Actions" section of Badge.mdx for the full decision tree.
 *
 * @example
 * ```tsx
 * <Badge status="positive">Success</Badge>
 * <Badge status="warning" size="sm">Pending</Badge>
 * <Badge status="error" size="lg">Failed</Badge>
 * ```
 */
export declare function Badge({ status, size, variant, children, icon, className, style, ...props }: BadgeProps): import("react/jsx-runtime").JSX.Element;
export default Badge;
