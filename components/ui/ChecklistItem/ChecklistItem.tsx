import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './ChecklistItem.css';

export interface ChecklistItemProps
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> {
  /** Item label — rendered next to the toggle. ReactNode so a marked-up label is supported. */
  label: ReactNode;
  /** Completion state. */
  checked: boolean;
  /** Called with the new state when the row is clicked. */
  onCheckedChange: (checked: boolean) => void;
  /** Disabled — locks the toggle and applies muted styling. Use during async save or read-only items. */
  disabled?: boolean;
}

/**
 * ChecklistItem — row-style completion control. Pairs `CompletionToggle`'s
 * circular visual with a native `<label>` + `<input type="checkbox">` so
 * the **entire row** is the click target. Native `Space` / `Enter` toggle
 * for free; no manual `onKeyDown` needed.
 *
 * When the item is checked, the label gets `text-decoration: line-through`
 * and a muted color. The row gains a subtle completion background.
 *
 * Distinct from `Checkbox` — same shape, different visual + semantics.
 * Use this for "task checklist," "clinical procedure," "compliance
 * checks" — anywhere the box represents a *completion* on a discrete
 * unit of work, not a *selection*.
 *
 * @example
 * ```tsx
 * <ChecklistItem
 *   label="Restock surgical gloves"
 *   checked={item.completed}
 *   onCheckedChange={(next) => save(item.id, next)}
 *   disabled={saving}
 * />
 * ```
 *
 * @summary Completion-state row with circular toggle + label
 */
export const ChecklistItem = forwardRef<HTMLLabelElement, ChecklistItemProps>(
  (
    {
      label,
      checked,
      onCheckedChange,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <label
        ref={ref}
        className={bdsClass(
          'bds-checklist-item',
          checked && 'bds-checklist-item--checked',
          disabled && 'bds-checklist-item--disabled',
          className,
        )}
        {...props}
      >
        <input
          type="checkbox"
          className="bds-checklist-item__input"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <span
          className={bdsClass(
            'bds-completion-toggle',
            checked && 'bds-completion-toggle--checked',
            disabled && 'bds-completion-toggle--disabled',
            'bds-checklist-item__toggle',
          )}
          aria-hidden="true"
        >
          {checked && <span className="bds-completion-toggle__icon" />}
        </span>
        <span className="bds-checklist-item__label">{label}</span>
      </label>
    );
  },
);

ChecklistItem.displayName = 'ChecklistItem';

export default ChecklistItem;
