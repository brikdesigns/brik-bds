import { type HTMLAttributes } from 'react';
import './CardSummary.css';
export type CardSummaryType = 'numeric' | 'price';
export interface CardSummaryTextLink {
    label: string;
    href?: string;
    onClick?: () => void;
}
export interface CardSummaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    label: string;
    value: string | number;
    type?: CardSummaryType;
    textLink?: CardSummaryTextLink;
}
/**
 * CardSummary — compact metric/stat card with label, large value, and optional text link.
 */
export declare function CardSummary({ label, value, type, textLink, className, style, ...props }: CardSummaryProps): import("react/jsx-runtime").JSX.Element;
export default CardSummary;
