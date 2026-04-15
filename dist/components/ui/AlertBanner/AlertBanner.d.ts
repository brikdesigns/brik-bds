import { type ReactNode, type HTMLAttributes } from 'react';
import './AlertBanner.css';
export type AlertBannerVariant = 'warning' | 'error' | 'information';
export interface AlertBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Bold title text */
    title: ReactNode;
    /** Description text below the title */
    description?: ReactNode;
    /** Variant determines icon and badge color */
    variant?: AlertBannerVariant;
    /** Action element (e.g. Button) aligned to the right */
    action?: ReactNode;
}
/**
 * AlertBanner — contextual banner for important messages
 *
 * Uses a secondary surface background with an icon-only Badge,
 * title, description, and optional action button.
 */
export declare function AlertBanner({ title, description, variant, action, className, style, ...props }: AlertBannerProps): import("react/jsx-runtime").JSX.Element;
export default AlertBanner;
