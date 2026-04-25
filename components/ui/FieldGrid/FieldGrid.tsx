import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './FieldGrid.css';

export type FieldGridColumns = 2 | 3 | 4;
export type FieldGridGap = 'md' | 'lg' | 'xl';

export interface FieldGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns. Default `2`. */
  columns?: FieldGridColumns;
  /** Gap between cells. Default `xl` (matches existing portal field grids). */
  gap?: FieldGridGap;
  /** Cells to lay out side by side — typically `Field` components, but works for any equal-weight content. */
  children?: ReactNode;
}

/**
 * FieldGrid — equal-column grid for laying out Fields side by side.
 *
 * Replaces the inline `display: grid; gridTemplateColumns: '1fr 1fr'`
 * pattern scattered across portal sheets. Primary use: pair `Field`
 * components in a stacked sheet body. Also works for `Card`, `Tag`,
 * or any equal-weight row of content.
 *
 * @summary Equal-column grid for laying out Fields side by side
 */
export function FieldGrid({
  columns = 2,
  gap = 'xl',
  className,
  style,
  children,
  ...props
}: FieldGridProps) {
  return (
    <div
      className={bdsClass(
        'bds-field-grid',
        `bds-field-grid--cols-${columns}`,
        `bds-field-grid--gap-${gap}`,
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default FieldGrid;
