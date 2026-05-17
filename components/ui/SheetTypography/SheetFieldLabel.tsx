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
 * @deprecated Use `<Field tier="compact" label="..." />` for read-mode
 * label + value pairs. For standalone labels above form controls, pass
 * `label` directly to the control (TextInput, Select, etc.) — they
 * render their own accessible label element.
 *
 * @summary Field label above a Sheet value or input
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
