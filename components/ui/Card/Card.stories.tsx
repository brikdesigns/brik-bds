import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Image } from '../Image';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Badge } from '../Badge';
import '../../../tokens/modes-borderradius.css';

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
      options: ['outlined', 'brand', 'elevated', 'raised', 'borderless', 'filled'],
      description:
        'Visual variant (Default shape only). `outlined` = secondary border; `brand` = primary-color border; `elevated` = surface fill, no border, no shadow; `raised` = surface fill, no border, `--bds-box-shadow-md` drop shadow; `borderless` = transparent, no border, no shadow (for cards on a colored surface); `filled` = neutral recessed panel, surface-secondary fill + muted border.',
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
        'Leading 1:1 media (Default shape only) — `{ avatar: {…} }`, `{ image: {…} }`, or `{ logo: { set, name } }`. Renders an `Avatar`, a square `Image`, or a bundled `Logo` on the left, with `children` stacked to the right. Which of the three is content, not a semantic axis — set it here rather than in a per-media story (ADR-010 Q2).',
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
 * Pill radius mode (`data-mode-radius="pill"`) scopes the full 999px round to
 * controls only — the Button here is a pill, the Card keeps the bounded `round`
 * ramp instead of becoming a stadium. The attribute is set on the wrapper; in a
 * product it sits on `<html>`.
 *
 * @summary data-mode-radius="pill" — round Button beside a bounded Card
 */
export const PillRadiusMode: Story = {
  args: Default.args,
  decorators: [
    (Story) => (
      <div data-mode-radius="pill" style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * `layout="pricing"` — vertical pricing tier (ADR-038 § Amendment 2026-09-18;
 * supersedes the standalone `PricingCard`). Optional top `media`, a `badge` +
 * `title` header, the `price` / `period` block, a `children` body, a divider,
 * the `features` checklist, and a bottom-anchored `action`.
 *
 * The recommended tier is **not** a `highlighted` prop — it composes from the
 * shared surface set like every other layout, so set `variant="raised"` (or a
 * `tint`) in Controls to mark it.
 *
 * @summary layout="pricing" — tier with price + feature list
 */
export const Pricing: Story = {
  args: {
    layout: 'pricing',
    title: 'Professional',
    price: '$49',
    period: '/month',
    badge: <Badge status="positive">Most popular</Badge>,
    children: (
      <CardDescription>For growing businesses that need more room to run.</CardDescription>
    ),
    features: ['Unlimited projects', 'Priority support', 'Custom domain'],
    action: (
      <Button variant="primary" size="sm">
        Get started
      </Button>
    ),
  },
  argTypes: {
    padding: { table: { disable: true } },
    interactive: { table: { disable: true } },
    href: { table: { disable: true } },
    price: {
      control: 'text',
      description:
        'Price display — pre-formatted (`"$49"`, `"Free"`). The card applies no numeric formatting.',
    },
    period: {
      control: 'text',
      description: 'Billing period rendered beside the price (`"/month"`, `"one-time"`).',
    },
    features: {
      control: 'object',
      description:
        'Included-feature checklist. Each entry renders with a `ph:check` mark; omit or pass `[]` to drop the list and its divider.',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'brand', 'elevated', 'raised', 'borderless'],
      description:
        'Surface treatment. `raised` marks the recommended tier — the pricing layout has no bespoke `highlighted` prop.',
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
      options: ['not-configured', 'linked', 'connected', 'syncing', 'synced', 'failed'],
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
        'Surface treatment for a cell on a colored (service-tinted) grid. `borderless` = transparent, no border/shadow; `elevated` = fill, no border; `raised` = fill, no border, `--bds-box-shadow-md` shadow. Default = outlined white fill.',
    },
    tint: {
      control: 'select',
      options: ['none', 'brand', 'marketing', 'information', 'product', 'back-office'],
      mapping: { none: undefined },
      description:
        'Service-line surface tint — a pale wash keyed to a service line. Sets only the surface; border/size unchanged. Default = no tint.',
    },
    tintTone: {
      control: 'inline-radio',
      options: ['light', 'inverse'],
      description:
        'Which service-line surface `tint` resolves to. `light` (default) = pale wash; `inverse` = theme-flipping surface (white in light, deep hue in dark). Needs `tint`.',
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
        'How the `media` slot relates to the card edge. `flush` (default) bleeds to the edge and pads only the body; `inset` frames media + body together in a `--bds-padding-huge` inset.',
    },
    insetPadding: {
      control: 'inline-radio',
      options: ['huge', 'lg'],
      description:
        'Inset padding scale when `mediaTreatment="inset"`. `huge` (default) = `--bds-padding-huge` (48px) + `--bds-gap-xl`; `lg` = `--bds-padding-lg` (24px) + `--bds-gap-lg` for the tighter image-top card. Ignored for `flush`.',
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
    tintTone: {
      control: 'inline-radio',
      options: ['light', 'inverse'],
      description:
        'Which service-line surface `tint` resolves to. `light` (default) = pale wash; `inverse` = theme-flipping surface (white in light, deep hue in dark). Needs `tint`.',
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


const TINT_LINES = ['brand', 'marketing', 'information', 'product', 'back-office'] as const;

/**
 * Both `tintTone` values for every service line. Switch the toolbar theme to
 * dark to see `inverse` flip from white to the deep hue while `light` stays a
 * pale wash.
 *
 * @summary tintTone — light wash vs theme-flipping inverse
 */
export const TintTones: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 240px)', gap: 16 }}>
      {TINT_LINES.flatMap((line) =>
        (['light', 'inverse'] as const).map((tone) => (
          <Card key={`${line}-${tone}`} layout="stack" tint={line} tintTone={tone} title={`${line} · ${tone}`} />
        )),
      )}
    </div>
  ),
};

/**
 * Asserts each card's fill resolves to `--bds-surface-service-{line}-{tone}`
 * in light and dark — the table in #2294, read back from the rendered DOM.
 *
 * @summary Verifies light/inverse tone resolves in both themes
 */
export const InteractionTestTintTones: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: TintTones.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;
    const previous = root.getAttribute('data-theme');
    const fill = (line: string, tone: string) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = `var(--bds-surface-service-${line}-${tone})`;
      canvasElement.appendChild(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    };
    try {
      for (const theme of ['light', 'dark']) {
        root.setAttribute('data-theme', theme);
        for (const line of TINT_LINES) {
          for (const tone of ['light', 'inverse']) {
            const card = canvas.getByText(`${line} · ${tone}`).closest('.bds-card') as HTMLElement;
            await expect(getComputedStyle(card).backgroundColor).toBe(fill(line, tone));
          }
        }
      }
      // The two tones must actually differ in dark, or the prop is a no-op.
      const light = canvas.getByText('marketing · light').closest('.bds-card') as HTMLElement;
      const inverse = canvas.getByText('marketing · inverse').closest('.bds-card') as HTMLElement;
      await expect(getComputedStyle(inverse).backgroundColor).not.toBe(getComputedStyle(light).backgroundColor);
    } finally {
      if (previous === null) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', previous);
    }
  },
};
