import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page } from './Page';
import { PageHeader } from '../PageHeader';
import { PageContent } from './PageContent';
import { Grid } from '../Grid';
import { Card } from '../Card';
import { FilterBar } from '../FilterBar';
import { FilterButton } from '../FilterButton';
import { Button } from '../Button';
import { TabBar } from '../TabBar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../Table';

const meta: Meta<typeof Page> = {
  title: 'Layouts/page',
  component: Page,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    gap: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'xl', 'huge'] },
  },
};

export default meta;
type Story = StoryObj<typeof Page>;

/* ─── Story helpers ──────────────────────────────────────────────
   `<Page>` sets `flex: 1; min-height: 0` on itself, so it must live in a
   flex-column parent — the app shell provides this in production. The Shell
   helper makes that precondition visible (and bounds the height so the
   fill-height / scroll stories have something to fill). Story-only; ships
   nothing. */
const Shell = ({ children, height = 540 }: { children: React.ReactNode; height?: number }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height,
      background: 'var(--surface-primary)',
      border: 'var(--border-width-sm) solid var(--border-secondary)',
    }}
  >
    {children}
  </div>
);

const StatRow = () => (
  <Grid columns="auto-fit" minColumnWidth="180px" gap="md">
    <Card preset="summary" label="Total" value={49} />
    <Card preset="summary" label="Public" value={33} />
    <Card preset="summary" label="Active" value={49} />
  </Grid>
);

const ServicesFilterBar = () => (
  <FilterBar total={49} filtered={49} label="services">
    <FilterButton
      label="Service line"
      options={[
        { id: 'marketing', label: 'Marketing Design' },
        { id: 'back-office', label: 'Back Office' },
      ]}
    />
  </FilterBar>
);

const ServicesTable = ({ rows = 5 }: { rows?: number }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Service line</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>Service {i + 1}</TableCell>
          <TableCell>Marketing Design</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/* ─── 1. Playground ──────────────────────────────────────────── */

/** @summary Interactive playground — tweak padding + gap on a full page */
export const Playground: Story = {
  args: { padding: 'md', gap: 'xl' },
  render: (args) => (
    <Shell>
      <Page {...args}>
        <PageHeader
          title="Services"
          subtitle="The middle-tier service catalog — what we offer under each service line."
          actions={<Button variant="primary" size="sm">Add Service</Button>}
        />
        <PageContent>
          <StatRow />
          <ServicesFilterBar />
          <ServicesTable />
        </PageContent>
      </Page>
    </Shell>
  ),
};

/* ─── 2. Stats in body ───────────────────────────────────────── */

/**
 * The canonical index-page shape: summary stats live in `<PageContent>` as a
 * `Grid` of `Card preset="summary"` above the `FilterBar` and display — not
 * in the header (brik-bds#404, 2026-06-03 decision).
 *
 * @summary Stats render in the body, above the FilterBar + display
 */
export const StatsInBody: Story = {
  render: () => (
    <Shell>
      <Page padding="md" gap="xl">
        <PageHeader title="Services" subtitle="Edits sync to brikdesigns.com on save." />
        <PageContent>
          <StatRow />
          <ServicesFilterBar />
          <ServicesTable />
        </PageContent>
      </Page>
    </Shell>
  ),
};

/* ─── 3. Tabs handoff ────────────────────────────────────────── */

/**
 * When `<PageHeader tabs>` is filled, the header's bottom divider is
 * suppressed and the TabBar baseline becomes the handoff to the body.
 *
 * @summary Header with tabs — the TabBar baseline replaces the divider
 */
export const WithTabs: Story = {
  render: () => (
    <Shell>
      <Page padding="md" gap="xl">
        <PageHeader
          title="Billing"
          subtitle="Invoices and payment activity across all clients."
          tabs={
            <TabBar
              variant="tab"
              items={[
                { label: 'Invoices', active: true, onClick: () => {} },
                { label: 'Agreements', active: false, onClick: () => {} },
              ]}
            />
          }
        />
        <PageContent>
          <StatRow />
          <ServicesTable />
        </PageContent>
      </Page>
    </Shell>
  ),
};

/* ─── 4. Full-bleed body ─────────────────────────────────────── */

/**
 * `<PageContent padding="none">` breaks out of the page column to render a
 * data display edge-to-edge — for full-width boards and tables.
 *
 * @summary Full-bleed body — table runs edge-to-edge
 */
export const FullBleedBody: Story = {
  render: () => (
    <Shell>
      <Page padding="lg" gap="xl">
        <PageHeader title="All Tasks" subtitle="Header stays in the padded column; the table goes full-bleed below." />
        <PageContent padding="none">
          <ServicesTable rows={6} />
        </PageContent>
      </Page>
    </Shell>
  ),
};

/* ─── 5. Fill-height scroll ──────────────────────────────────── */

/**
 * `<PageContent scroll>` owns the vertical scroll on fill-height pages so the
 * header stays put while the body scrolls internally. Requires the flex-column
 * parent (the Shell here, the app shell in production).
 *
 * @summary Fill-height body that owns its own scroll
 */
export const FillHeightScroll: Story = {
  render: () => (
    <Shell height={420}>
      <Page padding="md" gap="xl">
        <PageHeader title="All Tasks" subtitle="The body scrolls; this header does not." />
        <PageContent scroll>
          <ServicesTable rows={20} />
        </PageContent>
      </Page>
    </Shell>
  ),
};

/* ─── 6. Headerless ──────────────────────────────────────────── */

/**
 * `<PageHeader>` is optional. A header-less page (e.g. an embedded or
 * outer-shell page) is just `<Page><PageContent>…</PageContent></Page>`; the
 * `gap` prop becomes a no-op with nothing to gap against.
 *
 * @summary Header is optional — body-only page
 */
export const Headerless: Story = {
  render: () => (
    <Shell>
      <Page padding="md">
        <PageContent>
          <StatRow />
          <ServicesTable />
        </PageContent>
      </Page>
    </Shell>
  ),
};
