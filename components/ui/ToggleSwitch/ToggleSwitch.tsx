import {
  type InputHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useState,
  useCallback,
} from 'react';
import { bdsClass } from '../../utils';
import './ToggleSwitch.css';

export type ToggleSwitchSize = 'lg' | 'md' | 'sm';

export type ToggleSwitchVariant = 'default' | 'accent-knob';

export interface ToggleSwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  size?: ToggleSwitchSize;
  /**
   * Visual variant. `default` carries state on the track (brand-fill when on,
   * neutral when off) with a surface knob. `accent-knob` keeps the track a
   * neutral gray in both states and carries state on the knob instead
   * (brand-fill when on, muted-gray when off) — used where a subtler track
   * reads better, e.g. an inline theme toggle. Default: `default`.
   */
  variant?: ToggleSwitchVariant;
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
 * ToggleSwitch — toggle control for binary on/off states.
 *
 * Track/knob dimensions are size-dependent (runtime-calculated inline styles).
 * Colors and typography are in ToggleSwitch.css.
 *
 * @summary Toggle control for binary on/off states
 */
export function ToggleSwitch({
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
}: ToggleSwitchProps) {
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

  // Size-dependent, Figma-driven dimensions stay inline (runtime-calculated).
  // State colors (track brand/neutral, accent-knob fill) live in ToggleSwitch.css,
  // driven by :checked + the .bds-toggle-switch--accent-knob modifier.
  const trackStyle: CSSProperties = {
    width: `${s.trackW}px`,
    height: `${s.trackH}px`,
  };

  const knobStyle: CSSProperties = {
    top: `${s.pad}px`,
    left: `${s.pad}px`,
    width: `${s.knob}px`,
    height: `${s.knob}px`,
    transform: isChecked ? `translateX(${s.travel}px)` : 'translateX(0)',
  };

  return (
    <label
      className={bdsClass(
        'bds-toggle-switch',
        isAccentKnob && 'bds-toggle-switch--accent-knob',
        disabled && 'bds-toggle-switch--disabled',
        className,
      )}
      style={style}
    >
      <input
        type="checkbox"
        role="switch"
        className="bds-toggle-switch__input"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <span className="bds-toggle-switch__track" style={trackStyle}>
        <span className="bds-toggle-switch__knob" style={knobStyle} />
      </span>
      {label && (
        <span className={bdsClass('bds-toggle-switch__label', `bds-toggle-switch__label--${size}`)}>
          {label}
        </span>
      )}
    </label>
  );
}

export default ToggleSwitch;
