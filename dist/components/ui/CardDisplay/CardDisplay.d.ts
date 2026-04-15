import { type HTMLAttributes, type ReactNode } from 'react';
import './CardDisplay.css';
export interface CardDisplayProps extends HTMLAttributes<HTMLDivElement> {
    imageSrc?: string;
    imageAlt?: string;
    title: string;
    description?: string;
    badge?: ReactNode;
    action?: ReactNode;
    href?: string;
}
/**
 * CardDisplay — content display card with image, badge, title, description, and action.
 */
export declare function CardDisplay({ imageSrc, imageAlt, title, description, badge, action, href, className, style, ...props }: CardDisplayProps): import("react/jsx-runtime").JSX.Element;
export default CardDisplay;
