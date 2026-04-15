import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';
/**
 * Button variants — visual hierarchy for actions
 *
 * Brand variants (UI hierarchy):
 * - primary: Main CTA (brand fill)
 * - outline: Secondary emphasis (brand border)
 * - secondary: Tertiary/subtle (surface fill)
 * - ghost: Minimal emphasis (no background)
 * - inverse: For dark backgrounds (white fill)
 *
 * System variants (semantic actions):
 * - destructive: Destructive action (system red)
 * - positive: Confirming action (system green)
 * - selected: Active/selected state (brand primary)
 *
 * Legacy (still supported, prefer system variants):
 * - danger: Alias for destructive
 * - danger-outline: Destructive with less emphasis
 * - danger-ghost: Destructive, minimal emphasis
 */
export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost' | 'inverse' | 'danger' | 'danger-outline' | 'danger-ghost' | 'destructive' | 'positive' | 'selected';
/** Button sizes */
export type ButtonSize = 'tiny' | 'sm' | 'md' | 'lg' | 'xl';
/** Button component props */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Full width button */
    fullWidth?: boolean;
    /** Button content */
    children: ReactNode;
    /** Optional icon before text */
    iconBefore?: ReactNode;
    /** Optional icon after text */
    iconAfter?: ReactNode;
    /** Loading state — shows spinner and disables interaction */
    loading?: boolean;
}
/**
 * Button — primary action component
 *
 * For links styled as buttons, use LinkButton.
 * For icon-only buttons, use IconButton.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">Get started</Button>
 * <Button variant="danger" size="md">Delete account</Button>
 * <Button variant="outline" iconAfter={<ArrowRight />}>Continue</Button>
 * ```
 */
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export default Button;
