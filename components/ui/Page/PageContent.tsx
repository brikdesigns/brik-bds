import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';

export type PageContentPadding = 'inherit' | 'none' | 'sm' | 'md' | 'lg';
export type PageContentGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'huge';

export interface PageContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Horizontal inset. `'inherit'` (default) uses the parent `<Page padding>`
   * column so body content aligns with the header divider. `'none'` breaks
   * out to full-bleed for edge-to-edge boards / tables. `'sm' | 'md' | 'lg'`
   * break out of the page column, then re-apply an explicit inset.
   */
  padding?: PageContentPadding;
  /**
   * Vertical gap between stacked body sections — a stat row, a `FilterBar`,
   * and the data display. Maps 1:1 to BDS `--gap-*` tokens. Default `'lg'`.
   */
  gap?: PageContentGap;
  /**
   * Own the vertical scroll. Set on fill-height pages (boards, calendars) so
   * the body scrolls internally while the page frame stays put. Requires the
   * ancestor `<Page>` to sit in a flex-column parent. Default `false`.
   */
  scroll?: boolean;
  /** Body content — stat row, `FilterBar`, and a data display. */
  children?: ReactNode;
}

/**
 * Page.Content — the body region of a {@link Page}. Owns the horizontal inset,
 * the vertical rhythm between stacked sections, and (optionally) its own
 * scroll. Always rendered as `<Page.Content>`, a static member of `<Page>`.
 *
 * Summary stats live here (not in `<Page.Header>`) as a `Grid` of
 * `Card preset="summary"`, above the `FilterBar` and display:
 *
 * @example
 * ```tsx
 * <Page.Content>
 *   <Grid columns="auto-fit" minColumnWidth="180px" gap="md">
 *     <Card preset="summary" label="Total" value={49} />
 *     <Card preset="summary" label="Public" value={33} />
 *   </Grid>
 *   <FilterBar total={49} filtered={49} label="services" />
 *   <Table>…</Table>
 * </Page.Content>
 *
 * // Full-bleed board page that owns its own scroll:
 * <Page.Content padding="none" scroll>
 *   <Board>…</Board>
 * </Page.Content>
 * ```
 *
 * @summary Page body region — inset, section rhythm, optional scroll.
 */
export function PageContent({
  padding = 'inherit',
  gap = 'lg',
  scroll = false,
  className,
  children,
  ...props
}: PageContentProps) {
  return (
    <div
      className={bdsClass(
        'bds-page__content',
        padding !== 'inherit' && `bds-page__content--padding-${padding}`,
        gap !== 'none' && `bds-page__content--gap-${gap}`,
        scroll && 'bds-page__content--scroll',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContent;
