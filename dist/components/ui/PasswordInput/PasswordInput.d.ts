import { type TextInputProps } from '../TextInput/TextInput';
import './PasswordInput.css';
/**
 * PasswordInput component props
 *
 * Extends TextInput props. The `type` prop is omitted — it is controlled
 * internally by the show/hide toggle.
 */
export type PasswordInputProps = Omit<TextInputProps, 'type' | 'iconAfter'>;
/**
 * PasswordInput — TextInput wrapper with show/hide password toggle.
 *
 * Manages `type="password"` vs `type="text"` state internally.
 * The toggle is a proper `<button type="button">` with an `aria-label`
 * that reflects the current state.
 *
 * All TextInput props (label, size, error, helperText, fullWidth, etc.)
 * are forwarded as-is. The `type` and `iconAfter` props are reserved.
 *
 * @example
 * ```tsx
 * <PasswordInput label="Password" placeholder="Enter password" />
 * <PasswordInput label="Password" size="sm" helperText="Must be at least 8 characters" />
 * <PasswordInput label="Password" error="Password is required" fullWidth />
 * ```
 */
export declare const PasswordInput: {
    ({ id, ...props }: PasswordInputProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export default PasswordInput;
