import { type HTMLAttributes, type ReactNode } from 'react';
import './CardControl.css';
export type CardControlActionAlign = 'center' | 'top';
export interface CardControlProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    badge?: ReactNode;
    action?: ReactNode;
    /** Vertical alignment of the action slot. `top` anchors the CTA to the upper-right corner. */
    actionAlign?: CardControlActionAlign;
}
/**
 * CardControl — settings control card with badge, title, description, and action.
 */
export declare function CardControl({ title, description, badge, action, actionAlign, className, style, ...props }: CardControlProps): import("react/jsx-runtime").JSX.Element;
export default CardControl;
