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
  title: 'Containers/calendar',
  component: CalendarPlaceholder,
  tags: ['wip', 'surface-shared', '!manifest'], // placeholder — hide from MCP discovery until shipped
};

export default meta;
type Story = StoryObj<typeof CalendarPlaceholder>;

/** @summary Placeholder */
export const Placeholder: Story = {};
