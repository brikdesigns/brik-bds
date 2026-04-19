import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './TagList.css';

export type TagListGap = 'xs' | 'sm' | 'md';

export interface TagListProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between tags. Default `xs` (matches tight tag clusters). */
  gap?: TagListGap;
  /** When true, tags wrap to additional rows. Default true. */
  wrap?: boolean;
  /** `<Tag>` children, or anything with tag-sized footprint. */
  children?: ReactNode;
}

/**
 * TagList — horizontal cluster of `<Tag>` elements with locked spacing.
 *
 * Replaces ad-hoc `<div style={{ display: 'flex', gap, flexWrap }}>`
 * wrappers around tag arrays. Use as a Field value, inside a table cell,
 * or standalone inside a SheetSection.
 */
export function TagList({
  gap = 'xs',
  wrap = true,
  className,
  style,
  children,
  ...props
}: TagListProps) {
  return (
    <div
      className={bdsClass(
        'bds-tag-list',
        `bds-tag-list--gap-${gap}`,
        wrap ? 'bds-tag-list--wrap' : 'bds-tag-list--nowrap',
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default TagList;
