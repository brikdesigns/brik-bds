import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './BulletList.css';

export type BulletListMarker = 'disc' | 'decimal' | 'none';
export type BulletListDensity = 'compact' | 'comfortable';

export interface BulletListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Array of list items. Each item becomes one `<li>`. */
  items: ReactNode[];
  /** List marker style. `disc` (default) = unordered, `decimal` = ordered, `none` = no marker. */
  marker?: BulletListMarker;
  /** Vertical density between items. Default `comfortable`. */
  density?: BulletListDensity;
}

/**
 * BulletList — structured list of short text items.
 *
 * Replaces the raw `<ul style={{ margin: 0, paddingLeft: space.lg, listStyleType: 'disc' }}>`
 * pattern used across sheets for anti-messages, proof points, brand
 * rules, and other short-item lists. Pass `marker="decimal"` for
 * numbered lists; the underlying element switches to `<ol>` automatically.
 *
 * @summary Structured list of short text items with markers
 */
export function BulletList({
  items,
  marker = 'disc',
  density = 'comfortable',
  className,
  style,
  ...props
}: BulletListProps) {
  const Element = (marker === 'decimal' ? 'ol' : 'ul') as 'ul';

  return (
    <Element
      className={bdsClass(
        'bds-bullet-list',
        `bds-bullet-list--marker-${marker}`,
        `bds-bullet-list--density-${density}`,
        className,
      )}
      style={style}
      {...props}
    >
      {items.map((item, i) => (
        <li key={i} className="bds-bullet-list__item">{item}</li>
      ))}
    </Element>
  );
}

export default BulletList;
