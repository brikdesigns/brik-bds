import type { HTMLAttributes, ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './SheetTypography.css';

export interface SheetFieldValueProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Placeholder rendered when `children` is null, undefined, or an empty
   * string. Defaults to `Not set`. Pass `null` to suppress the fallback
   * entirely and render nothing when the value is empty.
   */
  empty?: ReactNode;
}

/**
 * @deprecated Use `<Field tier="compact" label="..." />` instead — pass
 * the value as children. The `empty` prop maps to `Field.empty`.
 *
 * @summary Read-mode display of a field value in a Sheet
 */
export function SheetFieldValue({
  empty = 'Not set',
  className,
  children,
  ...props
}: SheetFieldValueProps) {
  const isEmpty =
    children === null || children === undefined || children === '';
  if (isEmpty && empty === null) return null;
  return (
    <div
      className={bdsClass(
        'bds-sheet-field-value',
        isEmpty && 'bds-sheet-field-value--empty',
        className,
      )}
      {...props}
    >
      {isEmpty ? empty : children}
    </div>
  );
}

export default SheetFieldValue;
