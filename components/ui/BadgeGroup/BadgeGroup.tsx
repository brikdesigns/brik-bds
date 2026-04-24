import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './BadgeGroup.css';

export type BadgeGroupGap = 'xs' | 'sm' | 'md';

export interface BadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between badges. Default `xs` (matches tight badge clusters). */
  gap?: BadgeGroupGap;
  /** When true, badges wrap to additional rows. Default true. */
  wrap?: boolean;
  /** `<Badge>` children, or anything with badge-sized footprint. */
  children?: ReactNode;
}

/**
 * BadgeGroup — horizontal cluster of `<Badge>` elements with locked spacing.
 *
 * Replaces ad-hoc `<div style={{ display: 'flex', gap, flexWrap }}>`
 * wrappers around badge arrays. Use as a Field value, inside a table cell,
 * or standalone inside a SheetSection.
 *
 * Sibling of `TagGroup` — same API shape, different child indicator.
 */
export function BadgeGroup({
  gap = 'xs',
  wrap = true,
  className,
  style,
  children,
  ...props
}: BadgeGroupProps) {
  return (
    <div
      className={bdsClass(
        'bds-badge-group',
        `bds-badge-group--gap-${gap}`,
        wrap ? 'bds-badge-group--wrap' : 'bds-badge-group--nowrap',
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default BadgeGroup;
