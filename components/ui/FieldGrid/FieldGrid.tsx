import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './FieldGrid.css';

export type FieldGridColumns = 2 | 3 | 4;
export type FieldGridGap = 'md' | 'lg' | 'xl';

export interface FieldGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of columns. Default `2`. The grid steps down as its
   * container narrows: `4` → 3 → 2, `3` → 2; `2` never changes.
   */
  columns?: FieldGridColumns;
  /** Gap between cells. Default `lg` — the field↔field rhythm-map value (ADR-024). */
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
 * `columns` is a maximum: the grid reads the width of its own container, not
 * the viewport, so the same grid is 4-up on a full page and 2-up in a Sheet.
 *
 * @summary Equal-column grid for laying out Fields side by side
 */
export function FieldGrid({
  columns = 2,
  gap = 'lg',
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
      <div className="bds-field-grid__cells">{children}</div>
    </div>
  );
}

export default FieldGrid;
