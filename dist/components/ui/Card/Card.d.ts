import { type HTMLAttributes, type ReactNode } from 'react';
import './Card.css';
export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    children: ReactNode;
    interactive?: boolean;
    href?: string;
    padding?: CardPadding;
}
/**
 * Card — flexible content container with variant styles
 */
export declare function Card({ variant, children, interactive, href, padding, className, style, ...props }: CardProps): import("react/jsx-runtime").JSX.Element;
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    as?: 'h2' | 'h3' | 'h4';
}
export declare function CardTitle({ children, as: Tag, className, style, ...props }: CardTitleProps): import("react/jsx-runtime").JSX.Element;
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
    children: ReactNode;
}
export declare function CardDescription({ children, className, style, ...props }: CardDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
export declare function CardFooter({ children, className, style, ...props }: CardFooterProps): import("react/jsx-runtime").JSX.Element;
export default Card;
