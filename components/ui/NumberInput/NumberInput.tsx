import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import { Icon } from '@iconify/react';
import { CaretUpBold, CaretDownBold } from '../../icons';
import { TextInput, type TextInputProps } from '../TextInput/TextInput';
import './NumberInput.css';

/**
 * NumberInput component props.
 *
 * `type` and `iconAfter` are reserved — the component sets `type="number"`
 * and manages the stepper buttons internally.
 */
export interface NumberInputProps
  extends Omit<TextInputProps, 'type' | 'iconAfter'> {
  /** Minimum allowed value. Forwarded to the native input. */
  min?: number;
  /** Maximum allowed value. Forwarded to the native input. */
  max?: number;
  /** Step increment / decrement amount. Defaults to 1. */
  step?: number;
}

/**
 * Dispatch a synthetic input event so React's onChange fires when
 * the stepper buttons mutate the DOM value directly.
 */
function fireInputEvent(input: HTMLInputElement, newValue: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;
  setter?.call(input, newValue);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * NumberInput — TextInput with BDS-styled increment / decrement steppers.
 *
 * Hides the native browser spinners and replaces them with BDS caret
 * buttons. Respects `min`, `max`, and `step`. Works in both controlled
 * (`value` + `onChange`) and uncontrolled (`defaultValue`) modes.
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * <NumberInput label="Quantity" defaultValue={1} min={1} max={99} />
 *
 * // Controlled
 * <NumberInput label="Quantity" value={qty} onChange={e => setQty(Number(e.target.value))} min={1} max={99} />
 * ```
 *
 * @summary Numeric input with increment / decrement stepper buttons
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min, max, step = 1, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `number-input-${generatedId}`;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const clamp = (value: number) => {
      let v = value;
      if (min !== undefined) v = Math.max(min, v);
      if (max !== undefined) v = Math.min(max, v);
      return v;
    };

    const handleStep = (direction: 1 | -1) => {
      const input = innerRef.current;
      if (!input) return;
      const current = parseFloat(input.value) || 0;
      const next = clamp(current + direction * step);
      fireInputEvent(input, String(next));
    };

    const steppers = (
      <div className="bds-number-input__steppers">
        <button
          type="button"
          className="bds-number-input__step"
          aria-label="Increment"
          tabIndex={-1}
          onClick={() => handleStep(1)}
        >
          <Icon icon={CaretUpBold} />
        </button>
        <button
          type="button"
          className="bds-number-input__step"
          aria-label="Decrement"
          tabIndex={-1}
          onClick={() => handleStep(-1)}
        >
          <Icon icon={CaretDownBold} />
        </button>
      </div>
    );

    return (
      <TextInput
        ref={innerRef}
        id={inputId}
        type="number"
        iconAfter={steppers}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
