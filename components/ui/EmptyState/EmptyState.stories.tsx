import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/Feedback/empty-state',
  component: EmptyState,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%', maxWidth: '500px' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    buttonProps: { children: 'Primary Button' },
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>With button</SectionLabel>
      <EmptyState
        title="No projects yet"
        description="Create your first project to get started."
        buttonProps={{ children: 'Create Project' }}
      />

      <SectionLabel>Without button</SectionLabel>
      <EmptyState
        title="No results found"
        description="Try adjusting your search or filters."
      />

      <SectionLabel>Title only</SectionLabel>
      <EmptyState title="No data available" />

      <SectionLabel>Custom content</SectionLabel>
      <EmptyState title="Upload your files" description="Drag and drop or click to browse.">
        <div style={{ padding: 'var(--padding-md)', border: 'var(--border-width-sm) dashed var(--border-secondary)', borderRadius: 'var(--border-radius-md)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-muted)' }}>
          Drop files here
        </div>
      </EmptyState>
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <SectionLabel>Inbox zero</SectionLabel>
      <EmptyState
        title="All caught up"
        description="You have no unread messages. Check back later."
      />

      <SectionLabel>First-time user</SectionLabel>
      <EmptyState
        title="Welcome to your dashboard"
        description="Add your first company to start tracking opportunities."
        buttonProps={{ children: 'Add company' }}
      />

      <SectionLabel>Search with no results</SectionLabel>
      <EmptyState
        title="No matches found"
        description="Try different keywords or remove some filters."
        buttonProps={{ children: 'Clear filters' }}
      />
    </Stack>
  ),
};
