import type { HTMLAttributes } from 'react';
import './SheetTypography.css';
export interface SheetSectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    /**
     * Render level for the underlying heading element. Defaults to `h3` so the
     * Sheet's own `<h2>` title keeps outline hierarchy intact; consumers can
     * override if a different document outline fits their page.
     */
    level?: 'h2' | 'h3' | 'h4';
}
/**
 * Top-of-section heading inside a Sheet body. Locks to the Sheet-context
 * section-heading tier — heading family, `--heading-sm`, semibold, primary
 * text, no uppercase transform. Always renders larger than `<SheetFieldLabel>`
 * so the label-larger-than-heading inversion flagged in the 2026-04-22
 * portal audit can't recur.
 *
 * Distinct from `<SheetSection heading="...">` — which uses the legacy
 * `--label-sm` uppercase treatment — and from `<Sheet title="...">`, which
 * owns the top-level sheet title at `--heading-md`.
 *
 * @see docs/LAYOUT-CONTEXTS.md for the typography-tier rules.
 */
export declare function SheetSectionTitle({ level, className, children, ...props }: SheetSectionTitleProps): import("react/jsx-runtime").JSX.Element;
export default SheetSectionTitle;
