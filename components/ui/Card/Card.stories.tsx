import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { PricingCard } from '../PricingCard';

const meta: Meta<typeof Card> = {
  title: 'Containers/card',
  component: Card,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'brand', 'elevated', 'borderless'],
      description:
        'Visual variant (Default shape only). `outlined` = secondary border; `brand` = primary-color border; `elevated` = drop shadow; `borderless` = transparent, no border, no shadow (for cards on a colored surface).',
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
    media: {
      control: false,
      description:
        'Leading media (Default shape only) — `{ avatar: {…} }` or `{ image: {…} }`. Renders an `Avatar` or a square 1:1 `Image` on the left, with `children` stacked to the right. See `WithAvatar` / `WithImage`.',
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
 * `variant="borderless"` — transparent fill, no border, no shadow. For cards
 * placed on a colored surface (service-tier / brand-image background) where
 * the `outlined` ring reads as visual noise. The card inherits the parent
 * surface; shown here on a brand-primary background.
 *
 * @summary variant="borderless" — for cards on a colored surface
 */
export const Borderless: Story = {
  args: {
    variant: 'borderless',
    padding: 'md',
    children: (
      <>
        <CardTitle>Card title</CardTitle>
        <CardDescription>
          Sits directly on the colored surface — no border ring, no shadow.
        </CardDescription>
        <CardFooter>
          <Button variant="on-color" size="sm">
            Action
          </Button>
        </CardFooter>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 320,
          padding: 'var(--padding-xl)',
          backgroundColor: 'var(--background-brand-primary)',
          borderRadius: 'var(--border-radius-md)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/**
 * Default Card with a leading `Avatar` — the "media object" layout. Pass
 * `media={{ avatar: {…} }}`; the avatar renders on the left and `children`
 * (`<CardTitle>` / `<CardDescription>`) stack to the right. The avatar falls
 * back to initials from `name` when no `src` loads, and can carry a presence
 * `status` dot. Size keys to the Avatar scale (`sm`/`md`/`lg`/`xl`).
 *
 * @summary media avatar — identity card (name + detail)
 */
export const WithAvatar: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    media: { avatar: { name: 'Jordan Lee', status: 'online', size: 'lg' } },
    children: (
      <>
        <CardTitle as="h4">Jordan Lee</CardTitle>
        <CardDescription>jordan.lee@brikdesigns.com</CardDescription>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Default Card with a leading square 1:1 `Image` — the logo / thumbnail
 * counterpart to `WithAvatar`. Pass `media={{ image: {…} }}` with `fit`
 * (`contain` for logos, `cover` for photos). Size keys to the same scale as
 * the avatar so the two read at an identical footprint.
 *
 * @summary media image — logo / thumbnail card
 */
export const WithImage: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    media: { image: { src: '/brik-logo.svg', alt: 'Brik Designs logo', fit: 'contain', size: 'lg' } },
    children: (
      <>
        <CardTitle as="h4">Brik Designs</CardTitle>
        <CardDescription>Design system · Enterprise plan</CardDescription>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
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
    logo: {
      control: false,
      description:
        'Optional leading logo / avatar slot — for integration logomarks or brand icons. Renders before `badge` in the content row.',
    },
    connectionStatus: {
      control: 'select',
      options: ['not-configured', 'connected', 'syncing', 'synced', 'error'],
      description:
        'Connection-status state. Renders a dot + label in the trailing block alongside the `action` slot.',
    },
    lastSynced: {
      control: 'text',
      description:
        'Human-readable "last synced" label displayed below the status indicator. Only shown when `connectionStatus` is set and is not `not-configured`.',
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
 * `preset="control"` with the `logo` slot — an `<Avatar>` logomark leading
 * the content row. The logo renders before the `badge` and is sized by the
 * consumer element (Avatar `size` prop). Use for integration / third-party
 * service cards where a visual brand identifier anchors the row.
 *
 * @summary preset="control" with avatar logo slot
 */
export const ControlWithLogo: Story = {
  args: {
    preset: 'control',
    title: 'Google Analytics',
    description: 'Pull session and conversion data into your dashboard.',
    logo: <Avatar name="GA" size="sm" />,
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
 * `preset="control"` with `connectionStatus="synced"` and `lastSynced` — the
 * full integration card shape. The trailing block stacks the status indicator
 * above the action. All five status states (`not-configured`, `connected`,
 * `syncing`, `synced`, `error`) are exercised in `ControlConnectionStatuses`.
 *
 * @summary preset="control" — integration card with status + action
 */
export const ControlWithConnectionStatus: Story = {
  args: {
    preset: 'control',
    title: 'Google Analytics',
    description: 'Pull session and conversion data into your dashboard.',
    logo: <Avatar name="GA" size="sm" />,
    connectionStatus: 'synced',
    lastSynced: 'Last synced 3 min ago',
    action: (
      <Button variant="outline" size="sm">
        Configure
      </Button>
    ),
    actionAlign: 'top',
  },
  argTypes: {
    variant: { table: { disable: true } },
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
    href: { table: { disable: true } },
    connectionStatus: {
      control: 'select',
      options: ['not-configured', 'connected', 'syncing', 'synced', 'error'],
      description: 'Connection-status state.',
    },
    lastSynced: {
      control: 'text',
      description: 'Last-synced timestamp label.',
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
 * All five `connectionStatus` states side-by-side — `not-configured`,
 * `connected`, `syncing`, `synced`, `error`. Each row carries the same logo
 * and action slot so the only variable is the status indicator.
 *
 * @summary connectionStatus — all five states (axis gallery)
 */
export const ControlConnectionStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', width: 600 }}>
      {(
        [
          { status: 'not-configured', lastSynced: undefined } ,
          { status: 'connected',      lastSynced: undefined } ,
          { status: 'syncing',        lastSynced: undefined } ,
          { status: 'synced',         lastSynced: 'Last synced 3 min ago' } ,
          { status: 'error',          lastSynced: 'Failed 12 min ago' } ,
        ] as const
      ).map(({ status, lastSynced }) => (
        <Card
          key={status}
          preset="control"
          title="Google Analytics"
          description="Pull session and conversion data into your dashboard."
          logo={<Avatar name="GA" size="sm" />}
          connectionStatus={status}
          lastSynced={lastSynced}
          actionAlign="top"
          action={
            <Button variant="outline" size="sm">
              Configure
            </Button>
          }
        />
      ))}
    </div>
  ),
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

/**
 * `preset="display"` + `variant="borderless"` — transparent fill, no border,
 * no shadow. Use when the card grid sits on a service-tinted colored surface
 * where the default white fill + border ring reads as visual noise. The card
 * inherits the parent surface; shown here on a service-product (purple) tint.
 *
 * @summary preset="display" variant="borderless" — on a colored surface
 */
export const DisplayBorderless: Story = {
  args: {
    preset: 'display',
    variant: 'borderless',
    title: 'Brand strategy',
    description:
      'A two-line card description that sets the type rhythm without trying to tell the whole story.',
    tag: <Badge>Marketing</Badge>,
    action: (
      <Button variant="on-color" size="sm">
        Learn more
      </Button>
    ),
  },
  argTypes: {
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 200px)',
          gap: 'var(--gap-md)',
          padding: 'var(--padding-xl)',
          backgroundColor: 'var(--surface-service-product)',
          borderRadius: 'var(--border-radius-md)',
        }}
      >
        <Story />
        <Story />
        <Story />
      </div>
    ),
  ],
};

/**
 * `preset="display"` + `variant="elevated"` — surface-primary fill +
 * `box-shadow-md`, no border. The restored-fill counterpart to `borderless`:
 * use when a card grid on a service-tinted surface still needs a contained
 * "card" read but the default border ring is unwanted. Shown here on a
 * service-product (purple) tint.
 *
 * @summary preset="display" variant="elevated" — on a colored surface
 */
export const DisplayElevated: Story = {
  args: {
    preset: 'display',
    variant: 'elevated',
    title: 'Brand strategy',
    description:
      'A two-line card description that sets the type rhythm without trying to tell the whole story.',
    tag: <Badge>Marketing</Badge>,
    action: (
      <Button variant="on-color" size="sm">
        Learn more
      </Button>
    ),
  },
  argTypes: {
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 200px)',
          gap: 'var(--gap-md)',
          padding: 'var(--padding-xl)',
          backgroundColor: 'var(--surface-service-product)',
          borderRadius: 'var(--border-radius-md)',
        }}
      >
        <Story />
        <Story />
        <Story />
      </div>
    ),
  ],
};

/**
 * `preset="display-row"` — horizontal sibling of `preset="display"`. Image
 * on the left, content (tag, title, description, optional `extras`, action)
 * on the right. Use for single-card sections where a vertical layout wastes
 * horizontal space: Related Customer Story, Recommended Add-On, featured
 * plan, company-segment overview. Toggle `imageWidth` between `narrow` /
 * `standard` / `wide` (or pass a custom CSS length / percentage) to size
 * the media column. The `extras` slot lets the consumer drop in any
 * supporting content (bullet list, pill row, gallery) between description
 * and action. Collapses to vertical stacking at ≤ 640px.
 *
 * @summary preset="display-row" — horizontal content-grid card
 */
export const DisplayRow: Story = {
  args: {
    preset: 'display-row',
    title: 'Web Design Retainer',
    description:
      'Ongoing design partnership for teams shipping a steady stream of marketing pages, lifecycle assets, and product UI.',
    image: (
      <div
        style={{
          aspectRatio: '3 / 2',
          background: 'var(--surface-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          height: '100%',
        }}
      >
        Image slot
      </div>
    ),
    tag: <Badge>Marketing</Badge>,
    extras: (
      <>
        <p style={{ margin: 0, fontWeight: 600 }}>Great fit for:</p>
        <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
          <li>Marketing leads shipping multiple campaigns a month</li>
          <li>Founders who need brand + landing pages in lockstep</li>
          <li>Teams without a full-time designer</li>
        </ul>
      </>
    ),
    action: (
      <Button variant="primary" size="sm">
        Learn more
      </Button>
    ),
    imageWidth: 'standard',
  },
  argTypes: {
    variant: { table: { disable: true } },
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
    imageWidth: {
      control: 'select',
      options: ['narrow', 'standard', 'wide'],
      description:
        'Image column width. Named: `narrow` 25%, `standard` 35%, `wide` 50%. Pass a CSS length / percentage string (e.g. `"40%"`) to override.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 720, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * `PricingCard` — web-only pricing tier with price block, feature checklist,
 * and optional highlighted (recommended) state. Component lives in
 * `components/ui/PricingCard/`; story lives here because PricingCard is part
 * of the Card family and its `highlighted` prop is a Q3 semantic variant.
 *
 * @summary PricingCard — web-only pricing tier with feature list
 */
export const Pricing: Story = {
  tags: ['surface-web'],
  render: () => (
    <div style={{ width: 320 }}>
      <PricingCard
        title="Professional"
        price="$49"
        period="/month"
        description="Most popular choice for growing businesses."
        features={[
          'Unlimited projects',
          'Priority support',
          'Custom domain',
          'Analytics dashboard',
        ]}
        badge={<Badge status="positive" size="sm">Most popular</Badge>}
        action={
          <Button variant="primary" style={{ width: '100%' }}>
            Get started
          </Button>
        }
        highlighted
      />
    </div>
  ),
};

