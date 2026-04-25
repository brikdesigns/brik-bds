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
 * @summary Helper or error text below a Sheet field
 *
 * Small hint or error text in a Sheet body. Label family, `--label-xs`,
 * regular weight, muted text. Always smaller than `<SheetFieldLabel>`, so
 * the reading order is preserved: section title → field label → value →
 * helper.
 *
 * Use for:
 *   - Helper captions ("Comma-separated list")
 *   - Validation errors (`tone="error"`)
 *   - Per-field provenance chips ("Seeded from industry pack")
 *
 * @see docs/LAYOUT-CONTEXTS.md for the typography-tier rules.
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
