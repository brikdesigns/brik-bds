import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

/**
 * Divider — horizontal or vertical separator with controlled spacing. Renders
 * as `<hr>` (horizontal) or `<div role="separator">` (vertical).
 * @summary Horizontal/vertical separator with spacing variants
 */
const meta: Meta<typeof Divider> = {
  title: 'Components/Structure/divider',
  component: Divider,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    spacing: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

const bodyText: React.CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)', // bds-lint-ignore
  color: 'var(--text-primary)',
  margin: 0,
};

/** Args-driven sandbox. Use Controls to flip orientation and spacing.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { orientation: 'horizontal', spacing: 'none' },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <p style={bodyText}>Content above the divider</p>
        <Story />
        <p style={bodyText}>Content below the divider</p>
      </div>
    ),
  ],
};

/** Default horizontal divider. The most common orientation.
 *  @summary Horizontal divider */
export const Horizontal: Story = {
  args: { orientation: 'horizontal', spacing: 'md' },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <p style={bodyText}>Above</p>
        <Story />
        <p style={bodyText}>Below</p>
      </div>
    ),
  ],
};

/** Vertical divider — used inline between siblings (e.g. toolbar buttons).
 *  @summary Vertical divider */
export const Vertical: Story = {
  args: { orientation: 'vertical', spacing: 'md' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', height: '48px', ...bodyText }}>
        <span>Left</span>
        <Story />
        <span>Right</span>
      </div>
    ),
  ],
};

/** Side-by-side comparison of all four spacing values. ADR-006 axis-gallery
 *  exception: single axis, comparison is the entire point.
 *  @summary All spacing values rendered together */
export const Spacings: Story = {
  render: () => (
    <div style={{ width: '400px', ...bodyText, color: 'var(--text-secondary)', fontSize: 'var(--body-sm)' }}>
      <p style={{ margin: 0 }}>spacing="none"</p>
      <Divider spacing="none" />
      <p style={{ margin: 0 }}>spacing="sm"</p>
      <Divider spacing="sm" />
      <p style={{ margin: 0 }}>spacing="md"</p>
      <Divider spacing="md" />
      <p style={{ margin: 0 }}>spacing="lg"</p>
      <Divider spacing="lg" />
      <p style={{ margin: 0 }}>End</p>
    </div>
  ),
};
