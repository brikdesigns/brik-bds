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

export type SwitchVariant = 'default' | 'accent-knob';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  size?: SwitchSize;
  /**
   * Visual variant. `default` carries state on the track (brand-fill when on,
   * neutral when off) with a surface knob. `accent-knob` keeps the track a
   * neutral gray in both states and carries state on the knob instead
   * (brand-fill when on, muted-gray when off) — used where a subtler track
   * reads better, e.g. an inline theme toggle. Default: `default`.
   */
  variant?: SwitchVariant;
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
  variant = 'default',
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
  const isAccentKnob = variant === 'accent-knob';

  // Runtime-calculated track dimensions.
  // default: track carries state (brand-fill on / neutral off).
  // accent-knob: track stays neutral in both states; the knob carries state.
  const trackStyle: CSSProperties = {
    width: `${s.trackW}px`, // bds-lint-ignore — Figma-driven switch dimensions
    height: `${s.trackH}px`, // bds-lint-ignore
    backgroundColor:
      isAccentKnob || !isChecked
        ? 'var(--border-muted)' // bds-lint-ignore — no semantic switch-track-inactive token
        : 'var(--background-brand-primary)',
  };

  // Runtime-calculated knob dimensions + position. For accent-knob the knob
  // carries state (brand-fill on / muted-gray off); default leaves the fill to
  // Switch.css (--surface-primary).
  const knobStyle: CSSProperties = {
    top: `${s.pad}px`, // bds-lint-ignore
    left: `${s.pad}px`, // bds-lint-ignore
    width: `${s.knob}px`, // bds-lint-ignore
    height: `${s.knob}px`, // bds-lint-ignore
    transform: isChecked ? `translateX(${s.travel}px)` : 'translateX(0)',
    ...(isAccentKnob && {
      backgroundColor: isChecked
        ? 'var(--background-brand-primary)'
        : 'var(--text-secondary)',
    }),
  };

  return (
    <label
      className={bdsClass(
        'bds-switch',
        isAccentKnob && 'bds-switch--accent-knob',
        disabled && 'bds-switch--disabled',
        className,
      )}
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
