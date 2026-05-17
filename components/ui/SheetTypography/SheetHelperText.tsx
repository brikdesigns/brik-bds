import type { HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './SheetTypography.css';

export type SheetHelperTextTone = 'neutral' | 'error';

export interface SheetHelperTextProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual tone. `neutral` — muted gray hint/caption text (default).
   * `error` — error-state red for validation messages under an input.
   */
  tone?: SheetHelperTextTone;
}

/**
 * @deprecated Use `<Field helper="..." helperTone="error" />` instead.
 * The `tone` prop maps to `Field.helperTone`.
 *
 * @summary Helper or error text below a Sheet field
 */
export function SheetHelperText({
  tone = 'neutral',
  className,
  children,
  ...props
}: SheetHelperTextProps) {
  return (
    <span
      className={bdsClass(
        'bds-sheet-helper-text',
        tone === 'error' && 'bds-sheet-helper-text--error',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default SheetHelperText;
