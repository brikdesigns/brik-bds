import { type TextareaHTMLAttributes } from 'react';
import './TextArea.css';
/**
 * TextArea size variants — matches TextInput sizes
 */
export type TextAreaSize = 'sm' | 'md' | 'lg';
/**
 * TextArea component props
 */
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Size variant (controls font-size, matching TextInput) */
    size?: TextAreaSize;
    /** Placeholder text */
    placeholder?: string;
    /** Number of visible text rows */
    rows?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Value (controlled) */
    value?: string;
    /** Default value (uncontrolled) */
    defaultValue?: string;
    /** Change handler */
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    /** Allow resize */
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
    /** Optional label text */
    label?: string;
    /** Helper text shown below textarea */
    helperText?: string;
    /** Error message (shows error state when provided) */
    error?: string;
    /** Full width textarea */
    fullWidth?: boolean;
}
/**
 * TextArea - BDS themed multi-line text input component
 *
 * Uses identical border, radius, background, and typography tokens as
 * TextInput, SearchInput, and AddressInput for consistent form styling.
 *
 * @example
 * ```tsx
 * <TextArea label="Notes" placeholder="Enter your message..." rows={4} fullWidth />
 * <TextArea label="Description" error="Required" rows={3} fullWidth />
 * <TextArea placeholder="Comments" rows={6} resize="none" />
 * ```
 */
export declare function TextArea({ size, placeholder, rows, disabled, value, defaultValue, onChange, resize, label, helperText, error, fullWidth, id, className, style, ...props }: TextAreaProps): import("react/jsx-runtime").JSX.Element;
export default TextArea;
