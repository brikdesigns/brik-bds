import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './CompletionToggle.css';

export interface CompletionToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onChange'> {
  /** Current completion state. */
  checked: boolean;
  /** Called with the new state when the toggle is clicked. */
  onCheckedChange: (checked: boolean) => void;
  /** Disabled — locks the toggle and applies muted styling. */
  disabled?: boolean;
}

/**
 * CompletionToggle — circular completion control.
 *
 * Atomic primitive distinct from `Checkbox` (which is rectangular and
 * intended for form selections like "I agree to terms"). Use this
 * wherever a discrete unit of work has a "complete / not complete"
 * state — task cards, checklist rows, completion-state lists.
 *
 * Renders as a `<button>` so it is a self-contained click target.
 * For row-style use where the entire row is the click target (label +
 * toggle), use `Checklist` instead — it shares this control's
 * visual and pairs it with a native `<label>` + `<input>`.
 *
 * @example
 * ```tsx
 * <CompletionToggle
 *   checked={task.completed}
 *   onCheckedChange={(next) => mark(task.id, next)}
 * />
 * ```
 *
 * @summary Circular completion toggle for task / item completion state
 */
export const CompletionToggle = forwardRef<HTMLButtonElement, CompletionToggleProps>(
  (
    {
      checked,
      onCheckedChange,
      disabled = false,
      className,
      'aria-label': ariaLabel,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={bdsClass(
          'bds-completion-toggle',
          checked && 'bds-completion-toggle--checked',
          disabled && 'bds-completion-toggle--disabled',
          className,
        )}
        disabled={disabled}
        aria-pressed={checked}
        aria-label={ariaLabel ?? (checked ? 'Mark incomplete' : 'Mark complete')}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
          if (!e.defaultPrevented) onCheckedChange(!checked);
        }}
        {...props}
      >
        {checked && <span className="bds-completion-toggle__icon" aria-hidden="true" />}
      </button>
    );
  },
);

CompletionToggle.displayName = 'CompletionToggle';

export default CompletionToggle;
