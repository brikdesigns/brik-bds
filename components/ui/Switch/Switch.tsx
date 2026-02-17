import {
  type InputHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useState,
  useCallback,
} from 'react';

/**
 * Switch size variants matching Figma specs
 */
export type SwitchSize = 'lg' | 'md' | 'sm';

/**
 * Switch component props
 */
export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Label text for the switch */
  label?: ReactNode;
  /** Size variant */
  size?: SwitchSize;
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
 * Size dimensions from Figma
 *
 * lg: track 56x32, knob 28px, travel 24px
 * md: track 32x18, knob 14px, travel 14px
 * sm: track 28x16, knob 12px, travel 12px
 */
const sizes = {
  lg: { trackW: 56, trackH: 32, knob: 28, travel: 24, pad: 2 },
  md: { trackW: 32, trackH: 18, knob: 14, travel: 14, pad: 2 },
  sm: { trackW: 28, trackH: 16, knob: 12, travel: 12, pad: 2 },
} as const;

/**
 * Hidden input styles — visually hidden but accessible
 */
const inputStyles: CSSProperties = {
  position: 'absolute',
  opacity: 0,
  width: 0,
  height: 0,
};

function getTrackStyles(size: SwitchSize, isChecked: boolean): CSSProperties {
  const s = sizes[size];
  return {
    position: 'relative',
    display: 'inline-block',
    width: `${s.trackW}px`,
    height: `${s.trackH}px`,
    backgroundColor: isChecked
      ? 'var(--_color---background--brand-primary)'
      : 'var(--grayscale--light, #bdbdbd)',
    borderRadius: '9999px',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
    cursor: 'inherit',
  };
}

function getKnobStyles(size: SwitchSize, isChecked: boolean): CSSProperties {
  const s = sizes[size];
  return {
    position: 'absolute',
    top: `${s.pad}px`,
    left: `${s.pad}px`,
    width: `${s.knob}px`,
    height: `${s.knob}px`,
    backgroundColor: 'var(--grayscale--white, #fff)',
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
    transform: isChecked ? `translateX(${s.travel}px)` : 'translateX(0)',
  };
}

/**
 * Switch - BDS themed toggle switch component
 *
 * An interactive toggle control for binary on/off states.
 * Supports lg, md, and sm sizes from the Figma spec.
 * Works in both controlled and uncontrolled modes.
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
 *
 * // Size variants
 * <Switch size="sm" label="Compact" />
 * ```
 */
export function Switch({
  label,
  size = 'lg',
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  className = '',
  style,
  ...props
}: SwitchProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    },
    [isControlled, onChange],
  );

  const labelStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--_space---gap--md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    fontFamily: 'var(--_typography---font-family--body)',
    fontSize: 'var(--_typography---body--md-base)',
    color: 'var(--_color---text--primary)',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  return (
    <label className={className || undefined} style={labelStyles}>
      <input
        type="checkbox"
        role="switch"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        style={inputStyles}
        {...props}
      />
      <span style={getTrackStyles(size, isChecked)}>
        <span style={getKnobStyles(size, isChecked)} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Switch;
