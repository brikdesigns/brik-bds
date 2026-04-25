import {
  type InputHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useState,
  useCallback,
} from 'react';
import { bdsClass } from '../../utils';
import './Switch.css';

export type SwitchSize = 'lg' | 'md' | 'sm';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  size?: SwitchSize;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Size dimensions from Figma — runtime-calculated, stays inline.
 */
const sizes = {
  lg: { trackW: 56, trackH: 32, knob: 28, travel: 24, pad: 2 },
  md: { trackW: 32, trackH: 18, knob: 14, travel: 14, pad: 2 },
  sm: { trackW: 28, trackH: 16, knob: 12, travel: 12, pad: 2 },
} as const;

/**
 * Switch — toggle control for binary on/off states.
 *
 * Track/knob dimensions are size-dependent (runtime-calculated inline styles).
 * Colors and typography are in Switch.css.
 *
 * @summary Toggle control for binary on/off states
 */
export function Switch({
  label,
  size = 'lg',
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  className,
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

  const s = sizes[size];

  // Runtime-calculated track dimensions
  const trackStyle: CSSProperties = {
    width: `${s.trackW}px`, // bds-lint-ignore — Figma-driven switch dimensions
    height: `${s.trackH}px`, // bds-lint-ignore
    backgroundColor: isChecked
      ? 'var(--background-brand-primary)'
      : 'var(--border-muted)', // bds-lint-ignore — no semantic switch-track-inactive token
  };

  // Runtime-calculated knob dimensions + position
  const knobStyle: CSSProperties = {
    top: `${s.pad}px`, // bds-lint-ignore
    left: `${s.pad}px`, // bds-lint-ignore
    width: `${s.knob}px`, // bds-lint-ignore
    height: `${s.knob}px`, // bds-lint-ignore
    transform: isChecked ? `translateX(${s.travel}px)` : 'translateX(0)',
  };

  return (
    <label
      className={bdsClass('bds-switch', disabled && 'bds-switch--disabled', className)}
      style={style}
    >
      <input
        type="checkbox"
        role="switch"
        className="bds-switch__input"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <span className="bds-switch__track" style={trackStyle}>
        <span className="bds-switch__knob" style={knobStyle} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Switch;
