import type { HTMLAttributes, ReactNode } from 'react';
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
export declare function SheetFieldValue({ empty, className, children, ...props }: SheetFieldValueProps): import("react/jsx-runtime").JSX.Element | null;
export default SheetFieldValue;
