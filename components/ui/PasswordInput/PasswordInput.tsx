import { useState, useId } from 'react';
import { TextInput, type TextInputProps } from '../TextInput/TextInput';
import './PasswordInput.css';

/**
 * PasswordInput component props
 *
 * Extends TextInput props. The `type` prop is omitted — it is controlled
 * internally by the show/hide toggle.
 */
export type PasswordInputProps = Omit<TextInputProps, 'type' | 'iconAfter'>;

/**
 * Inline SVG: eye-open icon (16x16).
 * Standard eye shape — elliptical outline + filled pupil circle.
 */
const EyeOpenIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="2" fill="currentColor" />
  </svg>
);

/**
 * Inline SVG: eye-closed icon (16x16).
 * Eye shape with a diagonal slash through it.
 */
const EyeClosedIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M2 2L14 14"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M6.5 5.09C7 4.71 7.48 4.5 8 4.5C10.49 4.5 12.5 7 12.5 7C12.5 7 12.14 7.52 11.5 8.13"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M4.8 5.8C3.64 6.56 2.72 7.5 2.72 7.5C2.72 7.5 4.73 10 7.22 10.44M9.5 9.5C9.07 9.82 8.56 10 8 10C6.62 10 5.5 8.88 5.5 7.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

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
export const PasswordInput = ({
  id,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id ?? `password-input-${generatedId}`;

  const toggleButton = (
    <button
      type="button"
      className="bds-password-toggle"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      onClick={() => setShowPassword((prev) => !prev)}
      tabIndex={0}
    >
      {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
    </button>
  );

  return (
    <TextInput
      id={inputId}
      type={showPassword ? 'text' : 'password'}
      iconAfter={toggleButton}
      {...props}
    />
  );
};

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
