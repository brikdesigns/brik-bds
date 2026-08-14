import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { NavItem } from './NavItem';
import * as Icons from '../../icons';

const meta: Meta<typeof NavItem> = {
  title: 'Navigation/nav-item',
  component: NavItem,
  tags: ['surface-shared'],
  argTypes: {
    label: {
      description: 'Visible label. Used as `aria-label` when `iconOnly` is true.',
      control: 'text',
    },
    icon: {
      description: 'Optional leading icon — pass a rendered Iconify `<Icon>` or any ReactNode.',
      control: false,
    },
    href: {
      description: 'Anchor href. Omit for button-style behavior with `onClick`.',
      control: 'text',
    },
    onClick: {
      description: 'Click handler (works with or without href). Ignored when disabled.',
      control: false,
    },
    active: {
      description: 'Selected (current page) state. Sets `aria-current="page"`.',
      control: 'boolean',
    },
    disabled: {
      description: 'Disabled state. Blocks click + applies muted styling.',
      control: 'boolean',
    },
    iconOnly: {
      description: 'Icon-only mode. Label becomes `aria-label`; visible content is the icon only.',
      control: 'boolean',
    },
    className: {
      description: 'Optional className passthrough for layout slot integration.',
      control: false,
    },
    linkComponent: {
      description: 'Render the link with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. Ignored when `disabled` or `href` is omitted. See ADR-012.',
      control: false,
    },
    dot: {
      description: 'Show a small indicator dot after the label — a decorative attention cue. `true` renders the brand-default dot; pass a `DotStatus` for a specific status.',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavItem>;

/** @summary Nav item — toggle active, disabled, iconOnly */
export const Default: Story = {
  args: {
    label: 'Dashboard',
    icon: <Icon icon={Icons.House} />,
    href: '#dashboard',
    active: false,
    disabled: false,
    iconOnly: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240, padding: 'var(--padding-md)', backgroundColor: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/** @summary Attention-cue dot on active + inactive items */
export const Dot: Story = {
  render: () => (
    <div style={{ width: 240, padding: 'var(--padding-md)', backgroundColor: 'var(--surface-primary)' }}>
      <NavItem label="Dashboard" icon={<Icon icon={Icons.House} />} href="#dashboard" active dot />
      <NavItem label="Notifications" icon={<Icon icon={Icons.House} />} href="#notifications" dot="warning" />
    </div>
  ),
};
