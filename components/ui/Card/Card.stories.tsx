import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Card> = {
  title: 'Containers/card',
  component: Card,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'brand', 'elevated'],
      description:
        'Visual variant (Default shape only). `outlined` = secondary border; `brand` = primary-color border; `elevated` = drop shadow.',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding scale (Default shape only).',
    },
    interactive: {
      control: 'boolean',
      description:
        'Adds hover affordance — cursor + interaction styles (Default shape only).',
    },
    href: {
      control: 'text',
      description:
        'When set, renders the card as `<a>` instead of `<div>`. The whole card becomes the navigation target.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

/**
 * Default Card — flexible content slot. Compose with `<CardTitle>`,
 * `<CardDescription>`, and `<CardFooter>` subcomponents. Toggle `variant`,
 * `padding`, `interactive`, and `href` via Controls to exercise the full
 * default-shape surface.
 *
 * @summary Flexible content slot — composable subcomponents
 */
export const Default: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    interactive: false,
    children: (
      <>
        <CardTitle>Card title</CardTitle>
        <CardDescription>
          Brief description that fits within two lines and sets the type rhythm.
        </CardDescription>
        <CardFooter>
          <Button variant="primary" size="sm">
            Action
          </Button>
        </CardFooter>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * `preset="control"` — locked-down settings/control card layout. Replaces
 * the legacy `CardControl` component (ADR-004). Renders a leading badge +
 * (title + description) on the left, action slot on the right. Toggle
 * `actionAlign` to anchor the action to the upper-right corner instead of
 * the vertical midline.
 *
 * @summary preset="control" — settings/control card
 */
export const Control: Story = {
  args: {
    preset: 'control',
    title: 'Email notifications',
    description: 'Send a weekly digest to your inbox.',
    badge: <Badge status="positive">On</Badge>,
    action: (
      <Button variant="outline" size="sm">
        Configure
      </Button>
    ),
    actionAlign: 'center',
  },
  argTypes: {
    variant: { table: { disable: true } },
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
    href: { table: { disable: true } },
    actionAlign: {
      control: 'radio',
      options: ['center', 'top'],
      description:
        'Vertical alignment of the action slot. `top` anchors the action to the upper-right corner; `center` (default) aligns to the vertical midline.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * `preset="summary"` — compact metric/stat card with label, large value,
 * and optional text link. Replaces the legacy `CardSummary` component
 * (ADR-004). Numeric `value` formats via `Intl.NumberFormat`; pass
 * `type="price"` for USD currency. String values render verbatim.
 *
 * @summary preset="summary" — compact metric card
 */
export const Summary: Story = {
  args: {
    preset: 'summary',
    label: 'Q1 revenue',
    value: 48250.75,
    type: 'price',
    textLink: { label: 'Details', href: '#' },
  },
  argTypes: {
    variant: { table: { disable: true } },
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
    href: { table: { disable: true } },
    type: {
      control: 'radio',
      options: ['numeric', 'price'],
      description:
        'Number formatting. `numeric` (default) = locale integer (e.g. 1,234); `price` = USD currency (e.g. $1,234.50). Ignored when `value` is a string.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * `preset="display"` — generic content card for `bds-card-grid`. Optional
 * slot props (`image`, `tag`, `badge`, `action`, `href`) so a single
 * primitive serves any content type — service, blog post, customer story,
 * property listing, team bio, support plan. Toggle each slot via Controls
 * to see the minimal and clickable variants.
 *
 * @summary preset="display" — content-grid card
 */
export const Display: Story = {
  args: {
    preset: 'display',
    title: 'Service one',
    description:
      'A two-line card description that sets the type rhythm without trying to tell the whole story.',
    image: (
      <div
        style={{
          aspectRatio: '3 / 2',
          background: 'var(--surface-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Image slot
      </div>
    ),
    tag: <Badge>Marketing</Badge>,
    badge: <Badge status="positive">Has Options</Badge>,
    action: (
      <Button variant="primary" size="sm">
        Learn more
      </Button>
    ),
  },
  argTypes: {
    variant: { table: { disable: true } },
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

