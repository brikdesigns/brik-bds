import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Image } from '../Image';

/**
 * Placeholder for screens with no data — title, optional description, and a slot.
 * @summary No-data placeholder with optional action
 */
const meta: Meta<typeof EmptyState> = {
  title: 'Components/empty-state',
  component: EmptyState,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    title: { control: 'text', description: 'Heading text.' },
    description: { control: 'text', description: 'Optional supporting text below the title.' },
    media: { control: false, description: 'Optional illustration node above the text (compose a BDS `<Image>`); presence is the show/hide control.' },
    buttonProps: { control: false, description: 'Optional primary-action button — renders an `md` Button when provided.' },
    children: { control: false, description: 'Optional custom content below the text (replaces the button).' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/* ─── Default — action/description presence are Controls ─────── */

/** @summary Canonical empty state — title, description, action */
export const Default: Story = {
  args: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
    buttonProps: { children: 'Create Project' },
  },
};

/* ─── Q4 slot compositions ───────────────────────────────────── */

/** @summary With a composed Image illustration above the text */
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

/** @summary Custom children slot — e.g. a drop-zone affordance */
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
