import type { HTMLAttributes } from 'react';
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
export declare function SheetHelperText({ tone, className, children, ...props }: SheetHelperTextProps): import("react/jsx-runtime").JSX.Element;
export default SheetHelperText;
