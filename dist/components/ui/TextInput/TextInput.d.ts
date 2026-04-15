import { type InputHTMLAttributes, type ReactNode } from 'react';
import './TextInput.css';
/**
 * TextInput size variants (per Figma bds-text-input)
 */
export type TextInputSize = 'sm' | 'md' | 'lg';
/**
 * TextInput component props
 */
export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Size variant (per Figma design specs) */
    size?: TextInputSize;
    /** Optional label text */
    label?: string;
    /** Helper text shown below input */
    helperText?: string;
    /** Error message (shows error state when provided) */
    error?: string;
    /** Full width input */
    fullWidth?: boolean;
    /** Optional icon before input */
    iconBefore?: ReactNode;
    /** Optional icon after input */
    iconAfter?: ReactNode;
}
/**
 * TextInput - BDS themed text input component
 *
 * Fully token-based — all styles reference BDS semantic design tokens.
 * Matches Figma component: bds-text-input (sizes sm/md/lg)
 *
 * @example
 * ```tsx
 * <TextInput size="sm" label="Email" placeholder="Enter your email" />
 * <TextInput size="md" label="Password" type="password" helperText="Must be at least 8 characters" />
 * <TextInput size="lg" label="Search" error="Required field" />
 * ```
 */
export declare const TextInput: import("react").ForwardRefExoticComponent<TextInputProps & import("react").RefAttributes<HTMLInputElement>>;
export default TextInput;
