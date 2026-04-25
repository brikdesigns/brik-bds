import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { bdsClass } from '../../utils';
import { Button, type ButtonSize } from '../Button';
import { IconButton } from '../Button';
import './AddableFieldRowList.css';

export type AddableFieldRowListSize = 'sm' | 'md' | 'lg';

/**
 * Render context passed to the children render-prop on each row.
 */
export interface AddableFieldRowContext<T> {
  /** Current row data */
  row: T;
  /** Zero-indexed row position */
  index: number;
  /** Patch the row — merges into the current row data */
  update: (patch: Partial<T>) => void;
}

export interface AddableFieldRowListProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** Current list of rows */
  values: T[];
  /** Called when rows change (add / update / remove) */
  onChange: (next: T[]) => void;
  /**
   * Factory for a new empty row when the user clicks "Add".
   * Called once per add — the returned object is appended to `values`.
   */
  newRow: () => T;
  /**
   * Render-prop for the row's field markup. Receives the current row,
   * its index, and an `update` helper for patching the row. The remove
   * IconButton is rendered automatically by the primitive.
   */
  children: (ctx: AddableFieldRowContext<T>) => ReactNode;
  /**
   * CSS `grid-template-columns` value for the row's field columns.
   * The primitive appends an `auto` track for the remove button. Default `1fr`.
   *
   * @example "1fr 1fr 160px"   (3-text + Select)
   * @example "1fr"             (single full-width field)
   */
  columns?: string;
  /** Optional field label rendered above the list */
  label?: string;
  /** Optional helper text rendered below the list */
  helperText?: string;
  /** Empty-state message shown when `values.length === 0` */
  emptyLabel?: string;
  /** Add button label (default "Add row") */
  addLabel?: string;
  /** Accessible label for the per-row remove button (default "Remove row") */
  removeLabel?: string;
  /**
   * Maximum number of rows. When reached, the Add button is hidden.
   * Omitted = unlimited.
   */
  maxItems?: number;
  /** Size variant — controls Button + IconButton sizing. Default `md`. */
  size?: AddableFieldRowListSize;
}

const BUTTON_SIZE: Record<AddableFieldRowListSize, ButtonSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

/**
 * AddableFieldRowList — multi-field row collection primitive.
 *
 * Replaces hand-rolled "add/remove rows of structured data" patterns with a
 * type-safe render-prop API. The consumer supplies the per-row field markup
 * (TextInput, Select, Checkbox, etc.); the primitive owns add/remove
 * handlers, grid layout, and the per-row remove IconButton.
 *
 * Per ADR-005, this is the canonical primitive for the multi-field row
 * shape — distinct from `AddableTextList` (single-string tag list),
 * `AddableComboList` (suggestion-driven tag list), and `AddableEntryList`
 * (title + description card).
 *
 * @example Phone System / Other Tools (3-text + Select)
 * ```tsx
 * <AddableFieldRowList<Tool>
 *   values={tools}
 *   onChange={setTools}
 *   newRow={() => ({ name: '', purpose: '', category: 'other' })}
 *   columns="1fr 1fr 160px"
 *   addLabel="Add Phone System"
 *   removeLabel="Remove tool"
 * >
 *   {({ row, update }) => (
 *     <>
 *       <TextInput value={row.name} onChange={(e) => update({ name: e.target.value })} />
 *       <TextInput value={row.purpose} onChange={(e) => update({ purpose: e.target.value })} />
 *       <Select value={row.category} options={CATEGORY_OPTIONS}
 *         onChange={(e) => update({ category: e.target.value as ToolCategory })} />
 *     </>
 *   )}
 * </AddableFieldRowList>
 * ```
 *
 * @example Holiday hours with cross-field disabling
 * ```tsx
 * <AddableFieldRowList<Holiday>
 *   values={holidays}
 *   onChange={setHolidays}
 *   newRow={() => ({ open: '', close: '', closed: false })}
 *   columns="1fr 1fr 100px"
 *   addLabel="Add Holiday"
 * >
 *   {({ row, update }) => (
 *     <>
 *       <TextInput type="time" value={row.open}
 *         onChange={(e) => update({ open: e.target.value })}
 *         disabled={row.closed} />
 *       <TextInput type="time" value={row.close}
 *         onChange={(e) => update({ close: e.target.value })}
 *         disabled={row.closed} />
 *       <Checkbox label="Closed" checked={row.closed}
 *         onChange={(e) => update({ closed: e.target.checked })} />
 *     </>
 *   )}
 * </AddableFieldRowList>
 * ```
 *
 * @summary Add-edit list of multi-field rows
 */
export function AddableFieldRowList<T>({
  values,
  onChange,
  newRow,
  children,
  columns = '1fr',
  label,
  helperText,
  emptyLabel,
  addLabel = 'Add row',
  removeLabel = 'Remove row',
  maxItems,
  size = 'md',
  className,
  style,
  ...props
}: AddableFieldRowListProps<T>) {
  const atLimit = typeof maxItems === 'number' && values.length >= maxItems;

  const update = (index: number, patch: Partial<T>) => {
    onChange(values.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const append = () => {
    onChange([...values, newRow()]);
  };

  const showEmpty = values.length === 0 && emptyLabel;

  // Each row is a CSS grid: consumer columns + auto track for the remove button.
  const rowStyle: CSSProperties = {
    gridTemplateColumns: `${columns} auto`,
  };

  return (
    <div
      className={bdsClass('bds-addable-field-row-list', className)}
      style={style}
      {...props}
    >
      {label && <span className="bds-addable-field-row-list__label">{label}</span>}

      {values.length > 0 && (
        <ul className="bds-addable-field-row-list__rows" role="list">
          {values.map((row, index) => (
            <li
              key={index}
              className="bds-addable-field-row-list__row"
              style={rowStyle}
              role="listitem"
            >
              {children({
                row,
                index,
                update: (patch) => update(index, patch),
              })}
              <IconButton
                size={BUTTON_SIZE[size]}
                variant="ghost"
                icon={<Icon icon="ph:dash-circle" />}
                label={removeLabel}
                onClick={() => remove(index)}
              />
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <span className="bds-addable-field-row-list__empty">{emptyLabel}</span>
      )}

      {!atLimit && (
        <div>
          <Button size={BUTTON_SIZE[size]} variant="secondary" onClick={append}>
            {addLabel}
          </Button>
        </div>
      )}

      {helperText && (
        <span className="bds-addable-field-row-list__helper">{helperText}</span>
      )}
    </div>
  );
}

export default AddableFieldRowList;
