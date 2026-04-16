import { type HTMLAttributes, type ReactNode } from 'react';
import './CardList.css';
export type CardListOrientation = 'vertical' | 'horizontal';
export type CardListGap = 'sm' | 'md' | 'lg' | 'xl';
export interface CardListProps extends HTMLAttributes<HTMLUListElement> {
    orientation?: CardListOrientation;
    gap?: CardListGap;
    /** Horizontal only — when true, items size to their content instead of filling equal columns */
    fitContent?: boolean;
    children: ReactNode;
}
/**
 * CardList — layout wrapper that stacks card components vertically or horizontally.
 */
export declare function CardList({ orientation, gap, fitContent, children, className, style, ...props }: CardListProps): import("react/jsx-runtime").JSX.Element;
export default CardList;
