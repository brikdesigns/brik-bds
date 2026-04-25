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
 * @summary Read-mode display of a field value in a Sheet
 *
 * Read-mode display of a field value inside a Sheet body. Body family,
 * `--body-md`, regular weight, primary text, preserves whitespace so
 * multi-line values render correctly. Pair with `<SheetFieldLabel>` above.
 *
 * When the value is empty (null, undefined, or an empty string), renders
 * the `empty` prop instead — muted, italic — so missing fields read
 * consistently across every sheet without per-consumer placeholder logic.
 *
 * @see docs/LAYOUT-CONTEXTS.md for the typography-tier rules.
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
