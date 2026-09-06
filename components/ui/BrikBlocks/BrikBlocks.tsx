import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './BrikBlocks.css';

/**
 * BrikBlocks layout direction — the orientation axis (ADR-033 § 2 Amendments,
 * #2001): a mutually-exclusive layout direction, no valence. Same prop name
 * and closed values as CardList / Divider.
 */
export type BrikBlocksOrientation = 'vertical' | 'horizontal';

/**
 * A single square's fill. Closed to this component — not a library-wide axis
 * (ADR-033 § 2 reserves `tone`/`emphasis` for valence and hue-source, and
 * neither's closed vocabulary has a word for this decorative swatch), so it
 * is named and scoped per-component rather than borrowing a governed word.
 */
export type BrikBlocksCell = 'light' | 'dark' | 'poppy';

export interface BrikBlocksProps extends HTMLAttributes<HTMLDivElement> {
  /** Stacking direction. `vertical` (default) for a column run, `horizontal` for a row. */
  orientation?: BrikBlocksOrientation;
  /** Each square's fill, in order. Arbitrary length — a 3-cell run is the Figma default. */
  cells: BrikBlocksCell[];
}

/**
 * BrikBlocks — decorative square-motif primitive from the /about redesign.
 *
 * Renders a run of 24×24px squares with an 8px gap, each cell tinted
 * `light` / `dark` / `poppy` in the order given. Purely decorative
 * (`aria-hidden`, `pointer-events: none`) — like BackgroundPattern, place it
 * anywhere layout allows and it never intercepts interaction or a screen
 * reader.
 *
 * @example
 * ```tsx
 * <BrikBlocks cells={['light', 'dark', 'light']} />
 * <BrikBlocks orientation="horizontal" cells={['light', 'dark', 'poppy']} />
 * ```
 *
 * @summary Decorative square-motif primitive (the "brik" mark)
 */
export function BrikBlocks({
  orientation = 'vertical',
  cells,
  className,
  style,
  ...props
}: BrikBlocksProps) {
  return (
    <div
      className={bdsClass(
        'bds-brik-blocks',
        `bds-brik-blocks--orientation-${orientation}`,
        className,
      )}
      aria-hidden="true"
      style={style}
      {...props}
    >
      {cells.map((cell, index) => (
        <span key={index} className="bds-brik-blocks__cell" data-cell={cell} />
      ))}
    </div>
  );
}

export default BrikBlocks;
