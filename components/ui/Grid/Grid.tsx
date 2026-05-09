import { type HTMLAttributes, type ReactNode, type ElementType, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';
import './Grid.css';

export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/**
 * Grid columns:
 * - Number: fixed column count (1-6)
 * - `auto-fit`: fills available space, items grow to fill row
 * - `auto-fill`: fills available space, items keep min size, leaves trailing space empty
 */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 'auto-fit' | 'auto-fill';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Number of columns or auto-sizing strategy. Default `auto-fit`. */
  columns?: GridColumns;
  /**
   * Minimum column width when `columns` is `auto-fit` or `auto-fill`.
   * Accepts any valid CSS length (e.g. `"240px"`, `"20rem"`). Default `"240px"`.
   */
  minColumnWidth?: string;
  /** Spacing between cells. Maps to BDS `--gap-*` tokens. Default `lg`. */
  gap?: GridGap;
  /** HTML element to render as. Default `div`. */
  as?: ElementType;
  /** Slotted child content. */
  children?: ReactNode;
}

/**
 * Grid — responsive CSS-grid container.
 *
 * For the most common Brik grid shapes: card grids (3-col, 2-col), service
 * tile rows, customer-story collections. Default behavior is `auto-fit` with
 * a 240px minimum width — children automatically reflow from 4-col → 3-col
 * → 2-col → 1-col as the viewport narrows, no media queries needed.
 *
 * Pass an explicit `columns={3}` when the design demands a fixed column
 * count regardless of viewport.
 *
 * @example
 * ```tsx
 * <Grid columns={3} gap="lg">
 *   <ServiceCard ... />
 *   <ServiceCard ... />
 *   <ServiceCard ... />
 * </Grid>
 *
 * <Grid columns="auto-fit" minColumnWidth="280px" gap="md">
 *   {items.map(item => <Card ... />)}
 * </Grid>
 * ```
 *
 * Multi-platform note: `columns` + `gap` map to SwiftUI `LazyVGrid`
 * (`columns: [GridItem(.adaptive(minimum:))]`) and Compose
 * `LazyVerticalGrid` (`GridCells.Adaptive(minSize:)`).
 *
 * @summary Responsive CSS grid for card and tile layouts.
 */
export function Grid({
  columns = 'auto-fit',
  minColumnWidth = '240px',
  gap = 'lg',
  as: Element = 'div',
  className,
  style,
  ...props
}: GridProps) {
  const isAuto = columns === 'auto-fit' || columns === 'auto-fill';
  const composedStyle: CSSProperties = {
    ...(isAuto ? { '--bds-grid-min-col-width': minColumnWidth } as CSSProperties : {}),
    ...style,
  };

  return (
    <Element
      className={bdsClass(
        'bds-grid',
        isAuto ? `bds-grid--${columns}` : `bds-grid--cols-${columns}`,
        gap !== 'none' && `bds-grid--gap-${gap}`,
        className,
      )}
      style={composedStyle}
      {...props}
    />
  );
}

export default Grid;
