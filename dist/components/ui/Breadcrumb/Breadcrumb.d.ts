import { type HTMLAttributes } from 'react';
import './Breadcrumb.css';
export interface BreadcrumbItem {
    label: string;
    href?: string;
}
export type BreadcrumbSeparator = 'slash' | 'chevron';
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
    items: BreadcrumbItem[];
    separator?: BreadcrumbSeparator;
}
/**
 * Breadcrumb — navigation breadcrumb trail with separator variants.
 */
export declare function Breadcrumb({ items, separator, className, style, ...props }: BreadcrumbProps): import("react/jsx-runtime").JSX.Element;
export default Breadcrumb;
