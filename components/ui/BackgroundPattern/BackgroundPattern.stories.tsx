import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackgroundPattern } from './BackgroundPattern';

const meta: Meta<typeof BackgroundPattern> = {
  title: 'Foundation/Assets/background-pattern',
  component: BackgroundPattern,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Decorative CSS-gradient texture layer, absolutely positioned behind content. Place it as the first child of a `position: relative` container, with real content stacked above it.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['dot-grid', 'line-grid'] },
    fade: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof BackgroundPattern>;

const Demo = (args: React.ComponentProps<typeof BackgroundPattern>) => (
  <div
    style={{
      position: 'relative',
      height: 240,
      overflow: 'hidden',
      background: 'var(--surface-primary)',
      border: `var(--border-width-sm) solid var(--border-secondary)`,
      borderRadius: 'var(--border-radius-md)',
    }}
  >
    <BackgroundPattern {...args} />
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: 'var(--font-family-heading)',
        fontSize: 'var(--heading-sm)',
        color: 'var(--text-primary)',
      }}
    >
      Content sits above the pattern
    </div>
  </div>
);

/** @summary Interactive playground */
export const Default: Story = {
  args: { variant: 'dot-grid', fade: false },
  render: (args) => <Demo {...args} />,
};

/* `fade` is a Control on Default — a boolean toggle (ADR-010 matrix Q2). */

/** @summary Repeating grid-line texture */
export const LineGrid: Story = {
  args: { variant: 'line-grid', fade: false },
  render: (args) => <Demo {...args} />,
};
