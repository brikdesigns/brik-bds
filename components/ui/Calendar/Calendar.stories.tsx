import type { Meta, StoryObj } from '@storybook/react-vite';

const CalendarPlaceholder = () => (
  <div style={{
    padding: 'var(--padding-xl)',
    fontFamily: 'var(--font-family-body)',
    color: 'var(--text-secondary)',
    textAlign: 'center' as const,
  }}>
    Calendar component — coming soon.
  </div>
);

const meta: Meta<typeof CalendarPlaceholder> = {
  title: 'Components/Container/calendar',
  component: CalendarPlaceholder,
  tags: ['wip'],
};

export default meta;
type Story = StoryObj<typeof CalendarPlaceholder>;

export const Placeholder: Story = {};
