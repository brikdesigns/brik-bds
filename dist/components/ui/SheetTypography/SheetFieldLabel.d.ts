import type { HTMLAttributes } from 'react';
import './SheetTypography.css';
export interface SheetFieldLabelProps extends Omit<HTMLAttributes<HTMLElement>, 'htmlFor'> {
    /**
     * When present, the component renders a `<label>` element with the given
     * `for` attribute so the label is programmatically associated with its
     * input. When absent, a `<span>` is used — correct for read-mode field
     * labels where no input exists.
     */
    htmlFor?: string;
}
/**
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
export declare function SheetFieldLabel({ htmlFor, className, children, ...props }: SheetFieldLabelProps): import("react/jsx-runtime").JSX.Element;
export default SheetFieldLabel;
