import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './TagGroup.css';

export type TagGroupGap = 'xs' | 'sm' | 'md';

export interface TagGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between tags. Default `xs` (matches tight tag clusters). */
  gap?: TagGroupGap;
  /** When true, tags wrap to additional rows. Default true. */
  wrap?: boolean;
  /** `<Tag>` children, or anything with tag-sized footprint. */
  children?: ReactNode;
}

/**
 * TagGroup — horizontal cluster of `<Tag>` elements with locked spacing.
 *
 * Replaces ad-hoc `<div style={{ display: 'flex', gap, flexWrap }}>`
 * wrappers around tag arrays. Use as a Field value, inside a table cell,
 * or standalone inside a SheetSection.
 */
export function TagGroup({
  gap = 'xs',
  wrap = true,
  className,
  style,
  children,
  ...props
}: TagGroupProps) {
  return (
    <div
      className={bdsClass(
        'bds-tag-group',
        `bds-tag-group--gap-${gap}`,
        wrap ? 'bds-tag-group--wrap' : 'bds-tag-group--nowrap',
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default TagGroup;
