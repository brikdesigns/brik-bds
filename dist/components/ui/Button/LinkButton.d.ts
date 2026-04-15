import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { ButtonVariant, ButtonSize } from './Button';
import './Button.css';
/** LinkButton props — href is required */
export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    /** Visual style variant */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Full width */
    fullWidth?: boolean;
    /** Link destination (required) */
    href: string;
    /** Button content */
    children: ReactNode;
    /** Optional icon before text */
    iconBefore?: ReactNode;
    /** Optional icon after text */
    iconAfter?: ReactNode;
}
/**
 * LinkButton — a link (`<a>`) styled as a button
 *
 * Use this instead of Button when the action navigates to a URL.
 * The `href` prop is required — TypeScript enforces this.
 *
 * @example
 * ```tsx
 * <LinkButton href="/docs" variant="outline">Read docs</LinkButton>
 * <LinkButton href="/signup" variant="primary" size="lg">Get started</LinkButton>
 * ```
 */
export declare const LinkButton: import("react").ForwardRefExoticComponent<LinkButtonProps & import("react").RefAttributes<HTMLAnchorElement>>;
export default LinkButton;
