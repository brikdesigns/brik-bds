import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { PricingCard } from '../PricingCard';

/* Story-only 1:1 product thumbnail (data URI, no network) — a schematic
   iPhone standing in for a real product photo in the media-image demo. */
const iphoneThumb =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
      '<rect width="200" height="200" fill="#eef1f4"/>' +
      '<rect x="72" y="24" width="56" height="152" rx="15" fill="#1c1c1e"/>' +
      '<rect x="77" y="32" width="46" height="136" rx="8" fill="#3a7bd5"/>' +
      '<rect x="90" y="28" width="20" height="5" rx="2.5" fill="#0d0d0f"/>' +
      '<rect x="88" y="170" width="24" height="3" rx="1.5" fill="#48484a"/>' +
      '</svg>',
  );

/* Story-only 3:2 landscape thumbnail (data URI, no network) — a schematic
   photo standing in for real display-card media in the image-slot demos. */
const landscapeThumb =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">' +
      '<rect width="300" height="200" fill="#eef1f4"/>' +
      '<circle cx="232" cy="52" r="24" fill="#f4c542"/>' +
      '<path d="M0 200 L96 104 L156 156 L214 96 L300 200 Z" fill="#5b8266"/>' +
      '<path d="M0 200 L70 150 L138 200 Z" fill="#3f5e4b"/>' +
      '</svg>',
  );

const meta: Meta<typeof Card> = {
  title: 'Containers/card',
  component: Card,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'brand', 'elevated', 'raised', 'borderless'],
      description:
        'Visual variant (Default shape only). `outlined` = secondary border; `brand` = primary-color border; `elevated` = surface fill, no border, no shadow; `raised` = surface fill, no border, `--box-shadow-md` drop shadow; `borderless` = transparent, no border, no shadow (for cards on a colored surface).',
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
        'Leading 1:1 media (Default shape only) — `{ avatar: {…} }`, `{ image: {…} }`, or `{ logo: { set, name } }`. Renders an `Avatar`, a square `Image`, or a bundled `Logo` on the left, with `children` stacked to the right. See `WithAvatar` / `WithImage` / `WithLogo`.',
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
 * `variant="raised"` — surface-primary fill, no border, with a
 * `--box-shadow-md` drop shadow. The shadow-casting counterpart to the
 * now-flat `elevated` (brik-bds#1146 / BACKLOG-493 removed its shadow so
 * portal cards read flat). Use for a focal/lone card or a grid cell that
 * needs a lifted, contained read. Shown here on a secondary surface so the
 * cast shadow reads clearly.
 *
 * @summary variant="raised" — surface fill + cast shadow
 */
export const Raised: Story = {
  args: {
    variant: 'raised',
    padding: 'md',
    children: (
      <>
        <CardTitle>Card title</CardTitle>
        <CardDescription>
          Surface-primary fill, no border, with a cast drop shadow.
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
      <div
        style={{
          width: 320,
          padding: 'var(--padding-xl)',
          backgroundColor: 'var(--surface-secondary)',
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
 * Default Card with a leading square 1:1 `Image` — an arbitrary thumbnail
 * counterpart to `WithAvatar`. Pass `media={{ image: {…} }}` with `fit`
 * (`cover` for photos, `contain` for artwork). Size keys to the same scale as
 * the avatar so the two read at an identical footprint. For a bundled brand
 * mark, prefer `media={{ logo }}` (see `WithLogo`) over a raw image `src`.
 *
 * @summary media image — square 1:1 thumbnail card
 */
export const WithImage: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    media: { image: { src: iphoneThumb, alt: 'iPhone 15 Pro', fit: 'cover', size: 'lg' } },
    children: (
      <>
        <CardTitle as="h4">iPhone 15 Pro</CardTitle>
        <CardDescription>Device · In stock</CardDescription>
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
 * Default Card with a leading square 1:1 bundled `Logo` — the third-party /
 * integration counterpart to `WithAvatar`. Pass `media={{ logo: { set, name } }}`;
 * the full-color brand mark renders contained in the square at the shared media
 * scale. Use this for integration and payment rows instead of a raw image `src`.
 *
 * @summary media logo — integration / brand card
 */
export const WithLogo: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    media: { logo: { set: 'integration', name: 'notion', size: 'lg' } },
    children: (
      <>
        <CardTitle as="h4">Notion</CardTitle>
        <CardDescription>Meetings database · Connected</CardDescription>
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
 * `layout="control"` — settings / integration-row layout (ADR-038; replaces
 * `preset="control"`). Leading `media` (logo) + `title` / `description` on the
 * left; a trailing `connectionStatus` indicator + `action` on the right.
 *
 * `connectionStatus`, `lastSynced`, and `actionAlign` are **Controls** — the
 * status is a *state of one card*, not a set of variants, so cycle it in the
 * panel rather than adding stories.
 *
 * @summary layout="control" — settings / integration row
 */
export const Control: Story = {
  args: {
    layout: 'control',
    media: <Logo set="integration" name="notion" size="sm" />,
    title: 'Notion Meetings Database',
    description: 'Discovery-call meeting notes for proposal generation.',
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
    actionAlign: {
      control: 'radio',
      options: ['center', 'top'],
      description:
        'Vertical alignment of the trailing block. `top` anchors it to the upper-right corner; `center` aligns to the vertical midline.',
    },
    media: {
      control: false,
      description:
        'Leading logo slot — a `<Logo>` for an integration / third-party service, or an `<Avatar>` for an account. Renders before `badge` in the content row.',
    },
    connectionStatus: {
      control: 'select',
      options: ['not-configured', 'connected', 'syncing', 'synced', 'error'],
      description:
        'Connection-status state (a state of this one card, not a variant). Renders a status indicator in the trailing block alongside the `action`.',
    },
    lastSynced: {
      control: 'text',
      description:
        'Human-readable "last synced" label below the status indicator. Shown only when `connectionStatus` is set and is not `not-configured`.',
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
 * `layout="metric"` — compact stat card: `overline` label above a large
 * `title` value, optional `action` (ADR-038; replaces `preset="summary"`).
 * Context-neutral — finance is only one use. Pre-format the value; no numeric
 * formatting is applied by the card.
 *
 * @summary layout="metric" — compact stat card
 */
export const Metric: Story = {
  args: {
    layout: 'metric',
    overline: 'Q1 revenue',
    title: '$48,250.75',
    action: (
      <Button variant="outline" size="sm">
        Details
      </Button>
    ),
  },
  argTypes: {
    variant: { table: { disable: true } },
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
    href: { table: { disable: true } },
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
 * `layout="stack"` — vertical content card: optional top `media`, `overline`,
 * `title`, `children` (body), bottom-anchored `action` (ADR-038; replaces
 * `preset="display"`). The malleable `CardGrid` cell — compose inside
 * `<CardGrid>`. `variant` / `tint` set the surface for a cell on a colored grid;
 * `mediaTreatment="inset"` frames media + body together (the former
 * `DisplayInset` story, now a Control).
 *
 * @summary layout="stack" — vertical content card
 */
export const Stack: Story = {
  args: {
    layout: 'stack',
    media: <Image src={landscapeThumb} alt="Marketing service" ratio="3-2" />,
    overline: <Badge>Marketing</Badge>,
    title: 'Service one',
    children: (
      <CardDescription>
        A two-line card description that sets the type rhythm without trying to tell the whole story.
      </CardDescription>
    ),
    badge: <Badge status="positive">Has Options</Badge>,
    action: (
      <Button variant="primary" size="sm">
        Learn more
      </Button>
    ),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'borderless', 'elevated', 'raised'],
      mapping: {
        default: undefined,
        borderless: 'borderless',
        elevated: 'elevated',
        raised: 'raised',
      },
      description:
        'Surface treatment for a cell on a colored (service-tinted) grid. `borderless` = transparent, no border/shadow; `elevated` = fill, no border; `raised` = fill, no border, `--box-shadow-md` shadow. Default = outlined white fill.',
    },
    tint: {
      control: 'select',
      options: ['none', 'brand', 'marketing', 'information', 'product', 'back-office'],
      mapping: { none: undefined },
      description:
        'Service-line surface tint — a pale wash keyed to a service line. Sets only the surface; border/size unchanged. Default = no tint.',
    },
    titleAs: {
      control: 'inline-radio',
      options: ['h2', 'h3', 'h4'],
      description:
        'Heading element for the title (default `h3`). Keeps the document outline correct; visual size is token-driven.',
    },
    mediaTreatment: {
      control: 'inline-radio',
      options: ['flush', 'inset'],
      description:
        'How the `media` slot relates to the card edge. `flush` (default) bleeds to the edge and pads only the body; `inset` frames media + body together in a `--padding-huge` inset.',
    },
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
 * `layout="row"` — horizontal content card: `media` left, text column right
 * (ADR-038; replaces `preset="display-row"`). For single-row sections where a
 * vertical layout wastes width. `imageWidth` sizes the media column; the body is
 * the flexible `children` slot; collapses to a stack at ≤ 640px.
 *
 * @summary layout="row" — horizontal content card
 */
export const Row: Story = {
  args: {
    layout: 'row',
    media: <Image src={landscapeThumb} alt="Web design retainer" ratio="3-2" />,
    overline: <Badge>Marketing</Badge>,
    title: 'Web Design Retainer',
    children: (
      <>
        <CardDescription>
          Ongoing design partnership for teams shipping a steady stream of marketing pages, lifecycle assets, and product UI.
        </CardDescription>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>Great fit for:</p>
          <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
            <li>Marketing leads shipping multiple campaigns a month</li>
            <li>Founders who need brand + landing pages in lockstep</li>
            <li>Teams without a full-time designer</li>
          </ul>
        </div>
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
        'Image column width. Named: `narrow` 25%, `standard` 35%, `wide` 50%. Pass a CSS length / percentage to override.',
    },
    tint: {
      control: 'select',
      options: ['none', 'brand', 'marketing', 'information', 'product', 'back-office'],
      mapping: { none: undefined },
      description:
        'Service-line surface tint — a pale wash keyed to a service line. Sets only the surface. Default = no tint.',
    },
    titleAs: {
      control: 'inline-radio',
      options: ['h2', 'h3', 'h4'],
      description:
        'Heading element for the title (default `h3`). Keeps the document outline correct; visual size is token-driven.',
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

