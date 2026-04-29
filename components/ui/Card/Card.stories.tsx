import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

/**
 * Card — flexible container with three variants (`outlined`/`brand`/`elevated`),
 * four padding sizes, and `interactive`/`href` modes. Sub-components: `CardTitle`,
 * `CardDescription`, `CardFooter`. Two locked presets: `control` (settings tile)
 * and `summary` (metric tile) — these replace the deprecated `CardControl` and
 * `CardSummary` components.
 * @summary Flexible container with variants and presets
 */
const meta: Meta<typeof Card> = {
  title: 'Components/Card/card',
  component: Card,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'brand', 'elevated'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>{children}</div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap' }}>{children}</div>
);

const sampleCardChildren = (
  <>
    <CardTitle>Card title</CardTitle>
    <CardDescription>This is a basic card with some description text.</CardDescription>
    <CardFooter>
      <Button variant="primary" size="sm">Action</Button>
    </CardFooter>
  </>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { variant: 'outlined', padding: 'md', children: sampleCardChildren },
};

/* ─── Variant axis ───────────────────────────────────────────── */

/** Outlined (default) — bordered surface for read-mode displays.
 *  @summary Outlined variant */
export const Outlined: Story = {
  args: { variant: 'outlined', padding: 'md', children: sampleCardChildren },
};

/** Brand — brand-tinted surface, used for promotional/featured tiles.
 *  @summary Brand variant */
export const Brand: Story = {
  args: { variant: 'brand', padding: 'md', children: sampleCardChildren },
};

/** Elevated — drop-shadow surface for floating tiles.
 *  @summary Elevated variant */
export const Elevated: Story = {
  args: { variant: 'elevated', padding: 'md', children: sampleCardChildren },
};

/* ─── Padding axis ───────────────────────────────────────────── */

/** All four padding values side-by-side. ADR-006 axis-gallery exception.
 *  @summary All padding values */
export const Paddings: Story = {
  decorators: [(Story) => <div style={{ width: 'auto' }}><Story /></div>],
  render: () => (
    <Row>
      {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
        <Card key={p} variant="outlined" padding={p} style={{ width: 180 }}>
          <CardTitle as="h4">{p}</CardTitle>
        </Card>
      ))}
    </Row>
  ),
};

/* ─── Interactive shapes ─────────────────────────────────────── */

/** Interactive — hover affordance (cursor change, hover styling). Use for
 *  cards that trigger an action on click.
 *  @summary Interactive card with hover affordance */
export const Interactive: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    interactive: true,
    children: (
      <>
        <Badge>New</Badge>
        <CardTitle as="h4">Clickable card</CardTitle>
        <CardDescription>Hover to see cursor change</CardDescription>
      </>
    ),
  },
};

/** Link card — passes `href` to render the card as an `<a>` element.
 *  @summary Link card (renders as anchor) */
export const LinkCard: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    href: '#',
    children: (
      <>
        <CardTitle as="h4">Link card</CardTitle>
        <CardDescription>Renders as an anchor element</CardDescription>
      </>
    ),
  },
};

/* ─── Control preset ─────────────────────────────────────────── */

/**
 * Control preset — locked-down settings tile layout. Renders leading badge +
 * (title + description) on the left, action slot on the right. Replaces the
 * deprecated `CardControl` component (per ADR-004 §3).
 * @summary Settings tile (control preset)
 */
export const ControlPreset: Story = {
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
  args: {
    preset: 'control',
    badge: <Badge status="positive">On</Badge>,
    title: 'Email notifications',
    description: 'Send a weekly digest to your inbox.',
    action: <Button variant="outline" size="sm">Configure</Button>,
  } as React.ComponentProps<typeof Card>,
};

/** Control preset with `actionAlign="top"` — anchors the action to the upper
 *  right corner instead of the vertical midline. Use when the description is
 *  long enough that center-alignment looks awkward.
 *  @summary Control preset with top-aligned action */
export const ControlPresetTopAligned: Story = {
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
  args: {
    preset: 'control',
    actionAlign: 'top',
    badge: <Badge status="warning">Off</Badge>,
    title: 'Two-factor authentication',
    description: 'Add a second layer of security by requiring a code from your phone when signing in. Strongly recommended for accounts with admin access.',
    action: <Button variant="primary" size="sm">Enable</Button>,
  } as React.ComponentProps<typeof Card>,
};

/** Control preset with no badge or action — title + description only.
 *  @summary Control preset minimal */
export const ControlPresetMinimal: Story = {
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
  args: {
    preset: 'control',
    title: 'Account name',
    description: 'The display name shown to your team and on shared documents.',
  } as React.ComponentProps<typeof Card>,
};

/* ─── Summary preset ─────────────────────────────────────────── */

/**
 * Summary preset — compact metric tile with label, large value, optional text
 * link. Numbers are formatted via `Intl.NumberFormat` based on `type` (numeric
 * → locale integer, price → USD currency). Replaces the deprecated `CardSummary`
 * component (per ADR-004 §1).
 * @summary Metric tile with formatted value (summary preset)
 */
export const SummaryPreset: Story = {
  args: {
    preset: 'summary',
    label: 'Active companies',
    value: 42,
    textLink: { label: 'View all', href: '#' },
  } as React.ComponentProps<typeof Card>,
};

/** Summary preset — `type="price"` formats the value as USD currency.
 *  @summary Summary preset with price formatting */
export const SummaryPresetPrice: Story = {
  args: {
    preset: 'summary',
    label: 'Q1 revenue',
    value: 48250.75,
    type: 'price',
    textLink: { label: 'Details', href: '#' },
  } as React.ComponentProps<typeof Card>,
};

/** Summary preset — string `value` skips number formatting entirely.
 *  @summary Summary preset with string value */
export const SummaryPresetString: Story = {
  args: {
    preset: 'summary',
    label: 'Plan',
    value: 'Pro Annual',
  } as React.ComponentProps<typeof Card>,
};

/** Summary preset — text link with `onClick` instead of `href` renders as a button.
 *  @summary Summary preset with button-style link */
export const SummaryPresetButtonLink: Story = {
  args: {
    preset: 'summary',
    label: 'Pending tasks',
    value: 7,
    textLink: { label: 'Review', onClick: () => {} },
  } as React.ComponentProps<typeof Card>,
};

/* ─── Composition recipes ────────────────────────────────────── */

/** Service-cards grid — common 3-column marketing recipe.
 *  @summary 3-column service-cards grid */
export const ServiceCardsGrid: Story = {
  decorators: [(Story) => <div style={{ width: 'auto' }}><Story /></div>],
  render: () => (
    <Stack>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-lg)', maxWidth: 800 }}>
        {['Design', 'Development', 'Strategy'].map((title) => (
          <Card key={title} variant="outlined" padding="lg">
            <Badge>{title}</Badge>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Professional {title.toLowerCase()} services.</CardDescription>
            <CardFooter>
              <Button variant="outline" size="sm">Learn more</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Stack>
  ),
};
