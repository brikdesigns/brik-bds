import { type TextInputProps } from '../TextInput/TextInput';
/**
 * EmailInput component props
 *
 * Extends TextInput props. The `type` and `iconBefore` props are omitted —
 * `type` is always "email" and the envelope icon is built in.
 */
export type EmailInputProps = Omit<TextInputProps, 'type' | 'iconBefore'>;
/**
 * EmailInput — TextInput wrapper for email address fields.
 *
 * Sets `type="email"`, `autocomplete="email"`, and renders an envelope icon
 * in the leading slot. Password managers (1Password, LastPass) recognise this
 * combination and show their autofill popover.
 *
 * All TextInput props (label, size, error, helperText, fullWidth, iconAfter,
 * etc.) are forwarded as-is. The `type` and `iconBefore` props are reserved.
 *
 * @example
 * ```tsx
 * <EmailInput label="Email" placeholder="you@example.com" fullWidth />
 * <EmailInput label="Email" size="sm" error="Invalid email address" />
 * ```
 */
export declare const EmailInput: import("react").ForwardRefExoticComponent<EmailInputProps & import("react").RefAttributes<HTMLInputElement>>;
export default EmailInput;
