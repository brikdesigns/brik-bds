import { type HTMLAttributes, type ReactNode } from 'react';
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
 */
export declare function BulletList({ items, marker, density, className, style, ...props }: BulletListProps): import("react/jsx-runtime").JSX.Element;
export default BulletList;
