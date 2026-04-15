import { type HTMLAttributes, type ReactNode } from 'react';
import type { ButtonProps } from '../Button';
import './EmptyState.css';
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Heading text */
    title: string;
    /** Optional description below the title */
    description?: string;
    /** Optional button props — renders a primary Button when provided */
    buttonProps?: Pick<ButtonProps, 'children' | 'onClick' | 'iconBefore' | 'iconAfter'>;
    /** Optional custom content below the text (replaces button) */
    children?: ReactNode;
}
/**
 * EmptyState — feedback component for empty content areas
 *
 * Displays a centered title, optional description, and optional
 * action button within a bordered surface container.
 */
export declare function EmptyState({ title, description, buttonProps, children, className, style, ...props }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export default EmptyState;
