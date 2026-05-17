import { useState, useId } from 'react';
import { Icon } from '@iconify/react';
import { Eye, EyeSlash } from '../../icons';
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
 *
 * @summary TextInput with show/hide password toggle
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
      <Icon icon={showPassword ? EyeSlash : Eye} />
    </button>
  );

  return (
    <TextInput
      id={inputId}
      type={showPassword ? 'text' : 'password'}
      iconAfter={toggleButton}
      data-1p-ignore={undefined}
      data-lpignore={undefined}
      {...props}
    />
  );
};

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
