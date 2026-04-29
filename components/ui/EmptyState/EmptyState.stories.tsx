import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

/**
 * EmptyState — feedback for empty content areas. Centered title + optional
 * description + optional action button (or custom children) inside a bordered
 * surface container.
 * @summary Empty content placeholder with optional action
 */
const meta: Meta<typeof EmptyState> = {
  title: 'Components/Feedback/empty-state',
  component: EmptyState,
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/* ─── Sandbox ────────────────────────────────────────────────── */

/** Args-driven sandbox. Use Controls to explore title, description, and button.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    buttonProps: { children: 'Primary Button' },
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Default shape — title, description, and a primary action button.
 *  @summary Empty state with primary CTA */
export const WithButton: Story = {
  args: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
    buttonProps: { children: 'Create Project' },
  },
};

/** Description-only — used when there's no recovery action (filtered results, etc.).
 *  @summary Empty state without an action */
export const WithoutButton: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
};

/** Minimal shape — title only. Use sparingly; usually a description helps.
 *  @summary Title-only empty state */
export const TitleOnly: Story = {
  args: {
    title: 'No data available',
  },
};

/** Custom children replace the default Button slot — drop zones, illustrations, etc.
 *  @summary Empty state with custom content slot */
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
