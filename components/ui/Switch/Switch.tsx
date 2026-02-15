import { type InputHTMLAttributes, type ReactNode, type CSSProperties } from 'react';

/**
 * Switch component props
 */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text for the switch */
  label?: ReactNode;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Label wrapper styles using BDS tokens
 *
 * Token reference:
 * - --_space---gap--sm = 4px (spacing between switch and label)
 */
const labelStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  cursor: 'pointer',
  userSelect: 'none',
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  color: 'var(--_color---text--primary)',
};

const labelDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

/**
 * Hidden input styles
 * Visually hidden but accessible
 */
const inputStyles: CSSProperties = {
  position: 'absolute',
  opacity: 0,
  width: 0,
  height: 0,
};

/**
 * Switch track styles using BDS tokens
 *
 * Token reference:
 * - --_color---background--brand-primary (checked background)
 * - --grayscale--light (unchecked background)
 * - --_border-radius---pill (rounded track)
 */
const trackBaseStyles: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  width: '44px',
  height: '24px',
  backgroundColor: 'var(--grayscale--light, #bdbdbd)',
  borderRadius: '12px',
  transition: 'background-color 0.2s ease',
  flexShrink: 0,
};

const trackCheckedStyles: CSSProperties = {
  backgroundColor: 'var(--_color---background--brand-primary)',
};

/**
 * Switch knob styles
 */
const knobBaseStyles: CSSProperties = {
  position: 'absolute',
  top: '2px',
  left: '2px',
  width: '20px',
  height: '20px',
  backgroundColor: 'var(--grayscale--white, #fff)',
  borderRadius: '50%',
  transition: 'transform 0.2s ease',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
};

const knobCheckedStyles: CSSProperties = {
  transform: 'translateX(20px)',
};

/**
 * Switch - BDS themed toggle switch component
 *
 * A toggle control for binary on/off states.
 * Uses smooth animation for state transitions and BDS tokens for theming.
 *
 * @example
 * ```tsx
 * // Controlled
 * <Switch
 *   label="Enable notifications"
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 * />
 *
 * // Uncontrolled
 * <Switch label="Remember me" defaultChecked />
 * ```
 */
export function Switch({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  className = '',
  style,
  ...props
}: SwitchProps) {
  const combinedLabelStyles: CSSProperties = {
    ...labelStyles,
    ...(disabled ? labelDisabledStyles : {}),
    ...style,
  };

  return (
    <label className={className || undefined} style={combinedLabelStyles}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        style={inputStyles}
        {...props}
      />
      <span
        style={{
          ...trackBaseStyles,
          ...(checked ? trackCheckedStyles : {}),
        }}
      >
        <span
          style={{
            ...knobBaseStyles,
            ...(checked ? knobCheckedStyles : {}),
          }}
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Switch;
