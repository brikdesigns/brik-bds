import { type ReactNode } from 'react';
import { Checklist } from '../Checklist';
import { bdsClass } from '../../utils';
import './ChecklistGroup.css';

export interface ChecklistGroupItem {
  /** Stable identity for the row. */
  id: string;
  /** Row label. */
  label: ReactNode;
  /** Completion state. */
  checked: boolean;
  /** Lock this row (async save, read-only). */
  disabled?: boolean;
}

export interface ChecklistGroupProps {
  /** Group heading rendered above the rows. */
  title: ReactNode;
  /** Rows in render order. */
  items: ChecklistGroupItem[];
  /** Called with the row id + its new completion state when a row is clicked. */
  onItemChange: (id: string, checked: boolean) => void;
  /** Show the running `n of N completed` counter under the title. Default `true`. */
  showCounter?: boolean;
  /** Extra class on the wrapping `<section>`. */
  className?: string;
}

/**
 * ChecklistGroup — a titled stack of [`Checklist`](/?path=/docs/components-checklist--docs)
 * completion rows with a running `n of N completed` counter. Owns the title +
 * counter + row layout; each row stays an atomic `Checklist`. The value of a
 * checklist comes from the interaction *between* rows, which this component
 * makes a first-class thing rather than a hand-rolled story wrapper.
 *
 * @example
 * ```tsx
 * <ChecklistGroup
 *   title="Daily maintenance"
 *   items={items}
 *   onItemChange={(id, checked) => save(id, checked)}
 * />
 * ```
 *
 * @summary Titled checklist with running completion counter
 */
export function ChecklistGroup({
  title,
  items,
  onItemChange,
  showCounter = true,
  className,
}: ChecklistGroupProps) {
  const completed = items.filter((item) => item.checked).length;

  return (
    <section className={bdsClass('bds-checklist-group', className)}>
      <div className="bds-checklist-group__header">
        <h3 className="bds-checklist-group__title">{title}</h3>
        {showCounter && (
          <span className="bds-checklist-group__counter">
            {completed} of {items.length} completed
          </span>
        )}
      </div>
      <div className="bds-checklist-group__items">
        {items.map((item) => (
          <Checklist
            key={item.id}
            label={item.label}
            checked={item.checked}
            disabled={item.disabled}
            onCheckedChange={(next) => onItemChange(item.id, next)}
          />
        ))}
      </div>
    </section>
  );
}

export default ChecklistGroup;
