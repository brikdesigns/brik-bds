import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './Page.css';

export type PagePadding = 'none' | 'sm' | 'md' | 'lg';
export type PageGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'huge';

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Horizontal inset shared by the header + body column — the single source
   * of truth for page padding. `<PageContent>` inherits it by default and can
   * override per-region (e.g. `padding="none"` for a full-bleed board).
   * Default `'md'`.
   */
  padding?: PagePadding;
  /**
   * Vertical gap between `<PageHeader>` and `<PageContent>`. Maps 1:1 to BDS
   * `--gap-*` tokens. No-op when there is no header. Default `'xl'` (24px) —
   * the header→body rhythm Brik product surfaces converged on.
   */
  gap?: PageGap;
  /** `<PageHeader>` and/or `<PageContent>`. Both are optional. */
  children: ReactNode;
}

/**
 * Page — the page shell container. The connective tissue every product page
 * shares: a `<PageHeader>` handing off to a `<PageContent>` across a known
 * vertical gap, inside one shared horizontal column.
 *
 * **Composition uses sibling named exports** — `<Page>`, `<PageHeader>`,
 * `<PageContent>` — not a compound `Page.Header` namespace. A compound static
 * (`Page.Header`) does not survive Next/Turbopack RSC bundling (the statics are
 * tree-shaken to `undefined` in the consumer), so the parts are plain named
 * exports.
 *
 * **Precondition:** `<Page>` always sets `flex: 1; min-height: 0` on itself so
 * fill-height bodies work. That only takes effect inside a flex-column parent
 * (the app shell). In a non-flex parent `flex: 1` no-ops and the page sizes to
 * content — degraded, not broken.
 *
 * @example
 * ```tsx
 * import { Page, PageHeader, PageContent } from '@brikdesigns/bds';
 *
 * // Parent must be a flex column (the app shell provides this).
 * <Page padding="md" gap="xl">
 *   <PageHeader title="Services" subtitle="…" actions={<Button>Add</Button>} />
 *   <PageContent>
 *     <Grid columns="auto-fit" minColumnWidth="180px" gap="md">
 *       <Card preset="summary" label="Total" value={49} />
 *     </Grid>
 *     <FilterBar total={49} filtered={49} label="services" />
 *     <Table>…</Table>
 *   </PageContent>
 * </Page>
 * ```
 *
 * @summary Page shell container — shared inset + header→body rhythm.
 */
export function Page({ padding = 'md', gap = 'xl', className, children, ...props }: PageProps) {
  return (
    <div
      className={bdsClass(
        'bds-page',
        `bds-page--padding-${padding}`,
        gap !== 'none' && `bds-page--gap-${gap}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Page;
