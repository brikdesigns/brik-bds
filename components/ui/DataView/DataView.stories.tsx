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
import { Board, BoardColumn, BoardCard } from '../Board';

const meta: Meta<typeof TableView> = {
  title: 'Containers/data-view',
  component: TableView,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    loading: { control: 'boolean' },
    empty: { control: 'boolean' },
    error: { control: 'text' },
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
  <Board>
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
  </Board>
);

const tableEmpty = { title: 'No services yet', description: 'Add a service to get started.' };

/* ─── 1. Playground ──────────────────────────────────────────── */

/** @summary TableView — toggle loading / empty / error to see state precedence */
export const Playground: Story = {
  args: { loading: false, empty: false, error: '' },
  render: (args) => (
    <Frame>
      <TableView {...args} emptyState={tableEmpty}>
        <DemoTable />
      </TableView>
    </Frame>
  ),
};

/* ─── 2. TableView states ────────────────────────────────────── */

/** @summary TableView loading — default skeleton stands in for the table */
export const Loading: Story = {
  render: () => (
    <Frame>
      <TableView loading emptyState={tableEmpty}>
        <DemoTable />
      </TableView>
    </Frame>
  ),
};

/** @summary TableView empty — structured EmptyState copy */
export const Empty: Story = {
  render: () => (
    <Frame>
      <TableView empty emptyState={{ ...tableEmpty, buttonProps: { children: 'Add Service' } }}>
        <DemoTable />
      </TableView>
    </Frame>
  ),
};

/** @summary TableView error — fails loud with an error Banner */
export const Error: Story = {
  render: () => (
    <Frame>
      <TableView error="The request timed out. Try again." emptyState={tableEmpty}>
        <DemoTable />
      </TableView>
    </Frame>
  ),
};

/* ─── 3. ListView ────────────────────────────────────────────── */

/** @summary ListView — content and its default list skeleton */
export const List: Story = {
  render: () => (
    <Frame>
      <ListView emptyState={{ title: 'No items' }}>
        <DemoList />
      </ListView>
    </Frame>
  ),
};

/** @summary ListView loading skeleton */
export const ListLoading: Story = {
  render: () => (
    <Frame>
      <ListView loading emptyState={{ title: 'No items' }}>
        <DemoList />
      </ListView>
    </Frame>
  ),
};

/* ─── 4. ProfileView ─────────────────────────────────────────── */

/** @summary ProfileView — read-mode DataSection content */
export const Profile: Story = {
  render: () => (
    <Frame>
      <ProfileView emptyState={{ title: 'No profile data' }}>
        <DemoProfile />
      </ProfileView>
    </Frame>
  ),
};

/** @summary ProfileView loading skeleton */
export const ProfileLoading: Story = {
  render: () => (
    <Frame>
      <ProfileView loading emptyState={{ title: 'No profile data' }}>
        <DemoProfile />
      </ProfileView>
    </Frame>
  ),
};

/* ─── 5. BoardView ───────────────────────────────────────────── */

/** @summary BoardView — content and its default board skeleton */
export const BoardState: Story = {
  render: () => (
    <Frame>
      <BoardView emptyState={{ title: 'No lanes yet' }}>
        <DemoBoard />
      </BoardView>
    </Frame>
  ),
};

/** @summary BoardView loading — column-shaped skeleton stands in for the board */
export const BoardLoading: Story = {
  render: () => (
    <Frame>
      <BoardView loading emptyState={{ title: 'No lanes yet' }}>
        <DemoBoard />
      </BoardView>
    </Frame>
  ),
};
