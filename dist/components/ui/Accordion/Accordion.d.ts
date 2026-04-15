import { type HTMLAttributes, type ReactNode } from 'react';
import './Accordion.css';
export interface AccordionItemData {
    id: string;
    title: ReactNode;
    content: ReactNode;
}
export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
    items: AccordionItemData[];
    allowMultiple?: boolean;
    openItems?: string[];
    onOpenChange?: (openItems: string[]) => void;
    defaultOpenItems?: string[];
}
/**
 * Accordion — collapsible content sections with plus/minus icons.
 */
export declare function Accordion({ items, allowMultiple, openItems, onOpenChange, defaultOpenItems, className, style, ...props }: AccordionProps): import("react/jsx-runtime").JSX.Element;
export default Accordion;
