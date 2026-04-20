import { type HTMLAttributes, type ReactNode } from 'react';
import './FieldGrid.css';
export type FieldGridColumns = 2 | 3 | 4;
export type FieldGridGap = 'md' | 'lg' | 'xl';
export interface FieldGridProps extends HTMLAttributes<HTMLDivElement> {
    /** Number of columns. Default `2`. */
    columns?: FieldGridColumns;
    /** Gap between cells. Default `xl` (matches existing portal field grids). */
    gap?: FieldGridGap;
    children?: ReactNode;
}
/**
 * FieldGrid — equal-column grid for laying out Fields side by side.
 *
 * Replaces the inline `display: grid; gridTemplateColumns: '1fr 1fr'`
 * pattern scattered across portal sheets. Primary use: pair `Field`
 * components in a stacked sheet body. Also works for `Card`, `Tag`,
 * or any equal-weight row of content.
 */
export declare function FieldGrid({ columns, gap, className, style, children, ...props }: FieldGridProps): import("react/jsx-runtime").JSX.Element;
export default FieldGrid;
