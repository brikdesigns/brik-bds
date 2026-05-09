import { type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { bdsClass } from '../../utils';
import './Cluster.css';

export type ClusterGap = 'none' | 'tiny' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ClusterAlign = 'start' | 'center' | 'end' | 'baseline';
export type ClusterJustify = 'start' | 'center' | 'end' | 'between';

export interface ClusterProps extends HTMLAttributes<HTMLElement> {
  /** Spacing between items. Maps to BDS `--gap-*` tokens. Default `sm`. */
  gap?: ClusterGap;
  /** Cross-axis alignment. */
  align?: ClusterAlign;
  /** Main-axis distribution. */
  justify?: ClusterJustify;
  /** HTML element to render as. Default `div`. */
  as?: ElementType;
  /** Slotted child content. */
  children?: ReactNode;
}

/**
 * Cluster — wrapping inline-flex container.
 *
 * For groups of items that flow horizontally and wrap onto new lines as
 * needed: tag lists, breadcrumbs, action-button rows, badge groups,
 * filter pills. Always wraps; never stretches; spacing is uniform between
 * all children regardless of how the rows fall.
 *
 * @example
 * ```tsx
 * <Cluster gap="xs">
 *   <Tag>brand</Tag>
 *   <Tag>marketing</Tag>
 *   <Tag>information</Tag>
 * </Cluster>
 *
 * <Cluster gap="sm" align="center" justify="end">
 *   <Button variant="ghost">Cancel</Button>
 *   <Button variant="primary">Save</Button>
 * </Cluster>
 * ```
 *
 * @summary Wrapping inline flex container — for tags, action rows, breadcrumbs.
 */
export function Cluster({
  gap = 'sm',
  align = 'center',
  justify,
  as: Element = 'div',
  className,
  ...props
}: ClusterProps) {
  return (
    <Element
      className={bdsClass(
        'bds-cluster',
        gap !== 'none' && `bds-cluster--gap-${gap}`,
        `bds-cluster--align-${align}`,
        justify && `bds-cluster--justify-${justify}`,
        className,
      )}
      {...props}
    />
  );
}

export default Cluster;
