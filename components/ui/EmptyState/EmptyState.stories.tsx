import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/Feedback/empty-state',
  component: EmptyState,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    buttonProps: { children: 'Primary Button' },
  },
};

export const WithoutButton: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Nothing here yet',
    buttonProps: { children: 'Get Started' },
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'No data available',
  },
};

export const CustomContent: Story = {
  render: () => (
    <EmptyState title="Upload your files" description="Drag and drop or click to browse.">
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
    </EmptyState>
  ),
};
