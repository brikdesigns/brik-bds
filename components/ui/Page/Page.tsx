import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { PageHeader } from '../PageHeader';
import { PageContent } from './PageContent';
import './Page.css';

export type PagePadding = 'none' | 'sm' | 'md' | 'lg';
export type PageGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'huge';

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Horizontal inset shared by the header + body column — the single source
   * of truth for page padding. `<Page.Content>` inherits it by default and can
   * override per-region (e.g. `padding="none"` for a full-bleed board).
   * Default `'md'`.
   */
  padding?: PagePadding;
  /**
   * Vertical gap between `<Page.Header>` and `<Page.Content>`. Maps 1:1 to BDS
   * `--gap-*` tokens. No-op when there is no header. Default `'xl'` (24px) —
   * the header→body rhythm Brik product surfaces converged on.
   */
  gap?: PageGap;
  /** `<Page.Header>` and/or `<Page.Content>`. Both are optional. */
  children: ReactNode;
}

function PageRoot({ padding = 'md', gap = 'xl', className, children, ...props }: PageProps) {
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
PageRoot.displayName = 'Page';

/**
 * Page — compound page shell. The connective tissue every product page shares:
 * a `<Page.Header>` handing off to a `<Page.Content>` across a known vertical gap,
 * inside one shared horizontal column.
 *
 * Compound members:
 * - `Page.Header` — the existing {@link PageHeader} (title · subtitle · actions
 *   · tabs), re-exported so call-sites migrate by import, not JSX shape.
 * - `Page.Content` — the body region ({@link PageContent}); holds the stat row,
 *   `FilterBar`, and data display.
 *
 * **Precondition:** `<Page>` always sets `flex: 1; min-height: 0` on itself so
 * fill-height bodies work. That only takes effect inside a flex-column parent
 * (the app shell). In a non-flex parent `flex: 1` no-ops and the page sizes to
 * content — degraded, not broken.
 *
 * @example
 * ```tsx
 * // Parent must be a flex column (the app shell provides this).
 * <Page padding="md" gap="xl">
 *   <Page.Header title="Services" subtitle="…" actions={<Button>Add</Button>} />
 *   <Page.Content>
 *     <Grid columns="auto-fit" minColumnWidth="180px" gap="md">
 *       <Card preset="summary" label="Total" value={49} />
 *     </Grid>
 *     <FilterBar total={49} filtered={49} label="services" />
 *     <Table>…</Table>
 *   </Page.Content>
 * </Page>
 * ```
 *
 * @summary Compound page shell — header + body with shared inset + rhythm.
 */
export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Content: PageContent,
});

export default Page;
