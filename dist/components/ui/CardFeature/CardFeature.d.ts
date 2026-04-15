import { type HTMLAttributes, type ReactNode } from 'react';
import './CardFeature.css';
export type CardFeatureAlignment = 'left' | 'center';
export interface CardFeatureProps extends HTMLAttributes<HTMLDivElement> {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    align?: CardFeatureAlignment;
}
/**
 * CardFeature — feature showcase card with icon, title, description, and action.
 */
export declare function CardFeature({ icon, title, description, action, align, className, style, ...props }: CardFeatureProps): import("react/jsx-runtime").JSX.Element;
export default CardFeature;
