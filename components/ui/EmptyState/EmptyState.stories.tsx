import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Image } from '../Image';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/empty-state',
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

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    buttonProps: { children: 'Primary Button' },
  },
};

/* ─── Variants — one story per meaningful state ──────────────── */

/** @summary Empty state with a primary action — the canonical "next step" CTA shape */
export const WithAction: Story = {
  args: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
    buttonProps: { children: 'Create Project' },
  },
};

/** @summary Informational empty state — no CTA, the user can't do anything here */
export const NoAction: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
};

/** @summary Title-only — minimum-content empty state, useful for terminal states */
export const TitleOnly: Story = {
  args: {
    title: 'No data available',
  },
};

/** @summary With media — a composed `<Image>` illustration above the text, plus an `md` action */
export const WithMedia: Story = {
  args: {
    media: (
      <Image
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMTYwIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2RmZTNlOCIvPjwvc3ZnPg=="
        alt=""
        ratio="3-2"
        width={240}
      />
    ),
    title: 'No projects yet',
    description: 'Create your first project to get started.',
    buttonProps: { children: 'Create Project' },
  },
};

/** @summary Custom content via the children slot (e.g. a drop-zone affordance instead of a button) */
export const WithCustomContent: Story = {
  args: {
    title: 'Upload your files',
    description: 'Drag and drop or click to browse.',
    children: (
      <div
        style={{
          padding: 'var(--padding-md)',
          border: 'var(--border-width-sm) dashed var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-sm)',
          color: 'var(--text-muted)',
        }}
      >
        Drop files here
      </div>
    ),
  },
};

/* ─── Patterns — real-world compositions ─────────────────────── */

/** @summary Inbox zero — informational state confirming no action is needed */
export const InboxZero: Story = {
  args: {
    title: 'All caught up',
    description: 'You have no unread messages. Check back later.',
  },
};

/** @summary First-time user — onboarding empty state guiding the next setup step */
export const FirstTimeUser: Story = {
  args: {
    title: 'Welcome to your dashboard',
    description: 'Add your first company to start tracking opportunities.',
    buttonProps: { children: 'Add company' },
  },
};

/** @summary Search with no results — recovery state offering to clear filters */
export const NoSearchResults: Story = {
  args: {
    title: 'No matches found',
    description: 'Try different keywords or remove some filters.',
    buttonProps: { children: 'Clear filters' },
  },
};
