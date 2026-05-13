import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Card> = {
  title: 'Displays/Card/card',
  component: Card,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'brand', 'elevated'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <>
        <CardTitle>Card title</CardTitle>
        <CardDescription>
          This is a basic card with some description text.
        </CardDescription>
        <CardFooter>
          <Button variant="primary" size="sm">Action</Button>
        </CardFooter>
      </>
    ),
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

/* ─── Variants ───────────────────────────────────────────────── */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Variant: outlined / brand / elevated</SectionLabel>
      <Row>
        {(['outlined', 'brand', 'elevated'] as const).map((v) => (
          <Card key={v} variant={v} padding="md" style={{ width: 220 }}>
            <CardTitle as="h4">{v}</CardTitle>
            <CardDescription>Card variant preview</CardDescription>
          </Card>
        ))}
      </Row>

      <SectionLabel>Padding: none / sm / md / lg</SectionLabel>
      <Row>
        {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
          <Card key={p} variant="outlined" padding={p} style={{ width: 180 }}>
            <CardTitle as="h4">{p}</CardTitle>
          </Card>
        ))}
      </Row>

      <SectionLabel>Interactive</SectionLabel>
      <Row>
        <Card variant="outlined" padding="md" interactive style={{ width: 260 }}>
          <Badge>New</Badge>
          <CardTitle as="h4">Clickable card</CardTitle>
          <CardDescription>Hover to see cursor change</CardDescription>
        </Card>
      </Row>

      <SectionLabel>Link card</SectionLabel>
      <Row>
        <Card variant="outlined" padding="md" href="#" style={{ width: 260 }}>
          <CardTitle as="h4">Link card</CardTitle>
          <CardDescription>Renders as an anchor element</CardDescription>
        </Card>
      </Row>
    </Stack>
  ),
};

/* ─── Control preset ─────────────────────────────────────────── */

/**
 * `preset="control"` — locked-down settings/control card layout.
 * Replaces the legacy `CardControl` component (per ADR-004).
 *
 * Renders: leading badge + (title + description) on the left, action
 * slot on the right. Use `actionAlign="top"` to anchor the action to
 * the upper-right corner instead of the vertical midline.
 */
export const ControlPreset = () => (
  <Stack>
    <SectionLabel>Default — center-aligned action</SectionLabel>
    <div style={{ width: 560 }}>
      <Card
        preset="control"
        badge={<Badge status="positive">On</Badge>}
        title="Email notifications"
        description="Send a weekly digest to your inbox."
        action={<Button variant="outline" size="sm">Configure</Button>}
      />
    </div>

    <SectionLabel>Top-aligned action</SectionLabel>
    <div style={{ width: 560 }}>
      <Card
        preset="control"
        actionAlign="top"
        badge={<Badge status="warning">Off</Badge>}
        title="Two-factor authentication"
        description="Add a second layer of security by requiring a code from your phone when signing in. Strongly recommended for accounts with admin access."
        action={<Button variant="primary" size="sm">Enable</Button>}
      />
    </div>

    <SectionLabel>No badge, no action</SectionLabel>
    <div style={{ width: 560 }}>
      <Card
        preset="control"
        title="Account name"
        description="The display name shown to your team and on shared documents."
      />
    </div>
  </Stack>
);

/* ─── Summary preset ─────────────────────────────────────────── */

/**
 * `preset="summary"` — compact metric/stat card with label, large value,
 * and optional text link. Replaces the legacy `CardSummary` component
 * (per ADR-004).
 *
 * `value` accepts a string or number. Numbers are formatted via
 * `Intl.NumberFormat` based on `type`:
 * - `numeric` (default): locale integer formatting (e.g. 1,234)
 * - `price`: USD currency (e.g. $48,250.75)
 */
export const SummaryPreset = () => (
  <Stack>
    <SectionLabel>Numeric — with text link</SectionLabel>
    <div style={{ width: 320 }}>
      <Card
        preset="summary"
        label="Active companies"
        value={42}
        textLink={{ label: 'View all', href: '#' }}
      />
    </div>

    <SectionLabel>Price — formatted as USD currency</SectionLabel>
    <div style={{ width: 320 }}>
      <Card
        preset="summary"
        label="Q1 revenue"
        value={48250.75}
        type="price"
        textLink={{ label: 'Details', href: '#' }}
      />
    </div>

    <SectionLabel>String value (no formatting)</SectionLabel>
    <div style={{ width: 320 }}>
      <Card
        preset="summary"
        label="Plan"
        value="Pro Annual"
      />
    </div>

    <SectionLabel>Button-style link (no href)</SectionLabel>
    <div style={{ width: 320 }}>
      <Card
        preset="summary"
        label="Pending tasks"
        value={7}
        textLink={{ label: 'Review', onClick: () => {} }}
      />
    </div>
  </Stack>
);

/* ─── Preset: display ────────────────────────────────────────── */

/**
 * @summary Display preset — generic content card for `bds-card-grid`.
 *
 * Optional slot props (`image`, `tag`, `badge`, `title`, `description`,
 * `action`) so a single primitive serves any content type — service,
 * blog post, customer story, property listing, team bio, support plan.
 * Stories below exercise each affordance combination.
 */
export const DisplayPresetAllAffordances: Story = {
  name: 'Display: all affordances',
  render: () => (
    <div style={{ width: 320, display: 'flex' }}>
      <Card
        preset="display"
        title="Service one"
        description="A two-line card description that sets the type rhythm without trying to tell the whole story."
        image={
          <div style={{ aspectRatio: '3 / 2', background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Image slot
          </div>
        }
        tag={<Badge>Marketing</Badge>}
        badge={<Badge status="positive">Has Options</Badge>}
        action={<Button variant="primary" size="sm">Learn more</Button>}
      />
    </div>
  ),
};

/** @summary Display: minimal — title-only, no image / tag / action. */
export const DisplayPresetMinimal: Story = {
  name: 'Display: minimal',
  render: () => (
    <div style={{ width: 320 }}>
      <Card preset="display" title="Minimal card" description="Only title and description — every other affordance is toggleable." />
    </div>
  ),
};

/** @summary Display: clickable card — `href` turns the whole card into a link. */
export const DisplayPresetClickable: Story = {
  name: 'Display: clickable',
  render: () => (
    <div style={{ width: 320 }}>
      <Card
        preset="display"
        href="#"
        title="Whole-card link"
        description="When href is set, the entire card becomes a single navigation target — use when there's no separate action."
        image={
          <div style={{ aspectRatio: '3 / 2', background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Image slot
          </div>
        }
      />
    </div>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Service cards grid</SectionLabel>
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

      <SectionLabel>Feature card with action</SectionLabel>
      <Card variant="elevated" padding="lg" style={{ maxWidth: 360 }}>
        <CardTitle>Premium plan</CardTitle>
        <CardDescription>
          Everything in the free plan, plus advanced analytics and priority support.
        </CardDescription>
        <CardFooter>
          <Button variant="primary" size="sm">Upgrade</Button>
        </CardFooter>
      </Card>
    </Stack>
  ),
};
