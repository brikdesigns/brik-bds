import type { HTMLAttributes, LabelHTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './SheetTypography.css';

export interface SheetFieldLabelProps
  extends Omit<HTMLAttributes<HTMLElement>, 'htmlFor'> {
  /**
   * When present, the component renders a `<label>` element with the given
   * `for` attribute so the label is programmatically associated with its
   * input. When absent, a `<span>` is used — correct for read-mode field
   * labels where no input exists.
   */
  htmlFor?: string;
}

/**
 * @summary Field label above a Sheet value or input
 *
 * Field label inside a Sheet body. Sits one tier below `<SheetSectionTitle>`
 * — label family, `--label-sm`, semibold, muted text, Title Case transform.
 * Use above `<SheetFieldValue>` in read mode, or above a `<TextInput>` /
 * `<CatalogPicker>` / other editor in edit mode.
 *
 * Renders as `<label>` when `htmlFor` is provided so screen readers can
 * associate it with the input; falls back to `<span>` for read-only
 * displays where no input exists.
 *
 * @see docs/LAYOUT-CONTEXTS.md for the typography-tier rules.
 */
export function SheetFieldLabel({
  htmlFor,
  className,
  children,
  ...props
}: SheetFieldLabelProps) {
  if (htmlFor) {
    const labelProps = props as LabelHTMLAttributes<HTMLLabelElement>;
    return (
      <label
        htmlFor={htmlFor}
        className={bdsClass('bds-sheet-field-label', className)}
        {...labelProps}
      >
        {children}
      </label>
    );
  }
  return (
    <span
      className={bdsClass('bds-sheet-field-label', className)}
      {...(props as HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
    </span>
  );
}

export default SheetFieldLabel;
