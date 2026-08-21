import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './BannerGroup.css';

export type BannerGroupGap = 'sm' | 'md' | 'lg';

export interface BannerGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between banners. Default `md` — banners read as one notice block. */
  gap?: BannerGroupGap;
  /** `<Banner>` children, ordered most-severe first. */
  children?: ReactNode;
}

/**
 * BannerGroup — vertical stack of `<Banner>` elements with locked spacing.
 *
 * Replaces the per-banner `marginBottom` + ad-hoc `<Stack>` wrapper that
 * consumers reach for when a page needs more than one banner. Sits at the top
 * of a `PageContent` or a `Sheet` body, above the first section.
 *
 * The group owns the space *between* banners only — the space below the group
 * belongs to the parent layout's `gap`, same as any other block.
 *
 * Order is the author's responsibility, not the component's: sort children
 * `negative → warning → info → positive → announcement`, global before
 * contextual within a tone. See the banner-groups build standard.
 *
 * Sibling of `BadgeGroup` / `TagGroup` — same API shape, vertical axis.
 *
 * @summary Vertical stack of Banners with locked spacing
 */
export function BannerGroup({
  gap = 'md',
  className,
  style,
  children,
  ...props
}: BannerGroupProps) {
  return (
    <div
      className={bdsClass('bds-banner-group', `bds-banner-group--gap-${gap}`, className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default BannerGroup;
