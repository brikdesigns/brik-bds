import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableView } from './TableView';
import { ListView } from './ListView';
import { ProfileView } from './ProfileView';
import { BoardView } from './BoardView';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../Table';
import { Card } from '../Card';
import { CardList } from '../CardList';
import { DataSection } from '../DataSection';
import { Field } from '../Field';
import { FieldGrid } from '../FieldGrid';
import { Board as BoardLayout, BoardColumn, BoardCard } from '../Board';

/*
 * DataView is a *family* of four sibling views (TableView / ListView /
 * ProfileView / BoardView) that share one prop surface (`DataViewProps`).
 * Documented family exception (story-shape standard): one stories file, one
 * meta. `component` binds TableView for arg typing; the explicit argTypes below
 * describe the shared surface, so the ArgTypes table is correct for every view.
 * Each view gets one Q3 story; `loading` / `empty` / `error` are Controls
 * threaded through `args`, never per-state stories.
 */

/**
 * DataView family — loading/empty/error shells for data displays.
 * @summary Loading/empty/error shells for data displays
 */
const meta: Meta<typeof TableView> = {
  title: 'Containers/data-view',
  component: TableView,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Render the display-shaped loading skeleton instead of `children`.',
    },
    error: {
      control: 'text',
      description:
        'Non-empty string renders an error `Banner` (`tone="error"`). Highest precedence — error → loading → empty → content.',
    },
    errorTitle: {
      control: 'text',
      description: 'Title for the error banner. Default `"Couldn\'t load"`.',
    },
    empty: {
      control: 'boolean',
      description: 'When true (and not loading/error), render the empty state.',
    },
    emptyState: {
      control: false,
      description: 'Empty-state copy — an object renders `<EmptyState>`; a `ReactNode` renders as-is.',
    },
    skeleton: {
      control: false,
      description: 'Override the default loading skeleton for this view.',
    },
    children: {
      control: false,
      description: 'The data display — `Table`, `CardList`, a `DataSection` stack, a `Board`, etc.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableView>;

/* ─── Story helpers (ship nothing) ───────────────────────────── */

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: '880px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

const DemoTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Service line</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {['Website Design', 'Brand Identity', 'SEO Setup'].map((name) => (
        <TableRow key={name}>
          <TableCell>{name}</TableCell>
          <TableCell>Marketing Design</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const DemoList = () => (
  <CardList>
    <Card preset="display" title="Website Design" description="Marketing Design" />
    <Card preset="display" title="Brand Identity" description="Brand Design" />
    <Card preset="display" title="SEO Setup" description="Back Office" />
  </CardList>
);

const DemoProfile = () => (
  <DataSection title="Identity">
    <FieldGrid columns={2}>
      <Field label="Company">Acme Corp</Field>
      <Field label="Plan">Enterprise</Field>
      <Field label="Status">Active</Field>
      <Field label="MRR">$12,400</Field>
    </FieldGrid>
  </DataSection>
);

const DemoBoard = () => (
  <BoardLayout>
    <BoardColumn title="To do" count={2}>
      <BoardCard title="Draft brand brief" subtitle="Due today" />
      <BoardCard title="Collect logo assets" subtitle="Due Fri" />
    </BoardColumn>
    <BoardColumn title="In progress" count={1}>
      <BoardCard title="Homepage wireframe" subtitle="Alex" />
    </BoardColumn>
    <BoardColumn title="Done" count={1}>
      <BoardCard title="Kickoff call" subtitle="Complete" />
    </BoardColumn>
  </BoardLayout>
);

/* ─── Default — TableView sandbox (state props are Controls) ──── */

/** @summary TableView — table with loading / empty / error states */
export const Default: Story = {
  args: {
    loading: false,
    empty: false,
    error: '',
    emptyState: {
      title: 'No services yet',
      description: 'Add a service to get started.',
      buttonProps: { children: 'Add Service' },
    },
  },
  render: (args) => (
    <Frame>
      <TableView {...args}>
        <DemoTable />
      </TableView>
    </Frame>
  ),
};

/* ─── Sibling views — one Q3 story each (states via Controls) ── */

/** @summary ListView — card list with shared state handling */
export const List: Story = {
  args: { loading: false, empty: false, error: '', emptyState: { title: 'No items' } },
  render: (args) => (
    <Frame>
      <ListView {...args}>
        <DemoList />
      </ListView>
    </Frame>
  ),
};

/** @summary ProfileView — read-mode field stack with states */
export const Profile: Story = {
  args: { loading: false, empty: false, error: '', emptyState: { title: 'No profile data' } },
  render: (args) => (
    <Frame>
      <ProfileView {...args}>
        <DemoProfile />
      </ProfileView>
    </Frame>
  ),
};

/** @summary BoardView — kanban board with shared state handling */
export const Board: Story = {
  args: { loading: false, empty: false, error: '', emptyState: { title: 'No lanes yet' } },
  render: (args) => (
    <Frame>
      <BoardView {...args}>
        <DemoBoard />
      </BoardView>
    </Frame>
  ),
};
