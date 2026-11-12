import type { Meta, StoryObj } from '@storybook/react-vite';

const CalendarPlaceholder = () => (
  <div style={{
    padding: 'var(--bds-padding-xl)',
    fontFamily: 'var(--bds-font-family-body)',
    color: 'var(--bds-text-secondary)',
    textAlign: 'center' as const,
  }}>
    Calendar component — coming soon.
  </div>
);

const meta: Meta<typeof CalendarPlaceholder> = {
  // #2148: joins the date/time family (date-picker, time-picker, period-nav) under
  // `Components/`. A date grid is a control, not a bounded holder (ADR-006 amendment
  // 2026-11-12). Revisit if the built component gains its own border/elevation.
  title: 'Components/calendar',
  component: CalendarPlaceholder,
  tags: ['wip', 'surface-shared', '!manifest'], // placeholder — hide from MCP discovery until shipped
};

export default meta;
type Story = StoryObj<typeof CalendarPlaceholder>;

/** @summary Placeholder */
export const Placeholder: Story = {};
