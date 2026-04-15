import { type ReactNode, type HTMLAttributes } from 'react';
import './Banner.css';
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Bold title text */
    title: ReactNode;
    /** Description text beside the title */
    description?: ReactNode;
    /** Action element (e.g. Button) aligned to the right */
    action?: ReactNode;
    /** Dismissible — shows close button and calls onDismiss */
    onDismiss?: () => void;
}
/**
 * Banner — full-width branded banner for announcements
 *
 * Uses brand-primary surface with inverse text. Ideal for
 * announcements, promotions, or site-wide notices.
 */
export declare function Banner({ title, description, action, onDismiss, className, style, ...props }: BannerProps): import("react/jsx-runtime").JSX.Element;
export default Banner;
