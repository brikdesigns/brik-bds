import { type HTMLAttributes, type ReactNode } from 'react';
import './CardControl.css';
export interface CardControlProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    badge?: ReactNode;
    action?: ReactNode;
}
/**
 * CardControl — settings control card with badge, title, description, and action.
 */
export declare function CardControl({ title, description, badge, action, className, style, ...props }: CardControlProps): import("react/jsx-runtime").JSX.Element;
export default CardControl;
