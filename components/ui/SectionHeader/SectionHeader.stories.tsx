import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SectionHeader } from './SectionHeader';
import { Button } from '../Button';

/**
 * SectionHeader — centers a `ContentBlock` intro and caps it to a readable
 * measure (ADR-032). Composes `ContentBlock` for the title/subtitle/
 * description/actions rhythm (ADR-023); adds only measure + alignment.
 * @summary Centered, measure-capped section intro — composes ContentBlock
 */
const meta: Meta<typeof SectionHeader> = {
  title: 'Blocks/section-header',
  component: SectionHeader,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
    align: { control: 'select', options: ['center', 'start'] },
    measure: { control: 'select', options: ['sm', 'md', 'lg'] },
    titleAs: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'div', 'p'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    onColor: {
      control: { type: 'boolean' },
      description:
        'Forwarded to `ContentBlock` — swaps the text slots to `--text-on-color-dark` for a section intro on a filled brand band. AA-large, not AA, on `--surface-brand-primary`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

const Band = ({
  background = 'var(--surface-primary)',
  children,
}: {
  background?: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      maxWidth: 'var(--content-width-xl)',
      marginInline: 'auto',
      padding: 'var(--padding-lg)',
      background,
    }}
  >
    {children}
  </div>
);

/**
 * Centered, `measure-md` — the default shape for a section intro.
 * @summary Centered section intro at the default md measure
 */
export const Default: Story = {
  args: {
    title: 'Everything your practice needs',
    description:
      'One platform for client intake, billing, and communication — built for teams that outgrew spreadsheets.',
  },
  render: (args) => (
    <Band>
      <SectionHeader {...args} />
    </Band>
  ),
};

/**
 * `align="start"` drops the auto-margin centering and left-anchors the
 * column — the shape for a section intro that sits beside other content.
 * @summary Left-anchored section intro
 */
export const StartAligned: Story = {
  args: {
    title: 'Built for how you already work',
    description:
      'Import your existing client list in minutes — no migration project required.',
    align: 'start',
  },
  render: (args) => (
    <Band>
      <SectionHeader {...args} />
    </Band>
  ),
};

/**
 * `measure="sm"` (44ch) — a short intro or single-line eyebrow + title.
 * @summary Narrow 44ch measure
 */
export const MeasureSm: Story = {
  args: {
    title: 'Simple, transparent pricing',
    description: 'No hidden fees. Cancel anytime.',
    measure: 'sm',
  },
  render: (args) => (
    <Band>
      <SectionHeader {...args} />
    </Band>
  ),
};

/**
 * `measure="lg"` (72ch) — long-form prose or a richer description.
 * @summary Wide 72ch measure
 */
export const MeasureLg: Story = {
  args: {
    title: 'Why practices switch to Brik',
    description:
      'Most teams patch together a CRM, a billing tool, and a shared inbox — and still lose track of who said what to which client. Brik replaces the patchwork with one system built specifically for service businesses, so nothing falls through the cracks between tools.',
    measure: 'lg',
  },
  render: (args) => (
    <Band>
      <SectionHeader {...args} />
    </Band>
  ),
};

/**
 * `onColor` on a filled brand band — the CTA-band shape. Forwarded to
 * `ContentBlock`, which owns the swap to `--text-on-color-dark`; SectionHeader
 * still owns only measure + centering. This is what replaces a hand-rolled
 * `<h2>` + `<p>` with a per-instance `color` override on a CTA band
 * (brikdesigns/brikdesigns#937).
 *
 * Contrast: white on `--surface-brand-primary` is **3.78:1 — AA-large (3:1),
 * not AA (4.5:1)**, gated that way by policy for brand-primary fills
 * (`tokens/contrast-pairings.json`, BDS-22 / ADR-015). The `size="lg"` title is
 * large text; keep `description` short on a band.
 * @summary CTA band — on-color section intro on a brand fill
 */
export const OnColor: Story = {
  args: {
    title: 'Get in touch',
    description: 'Starting a new project or want to collaborate with us?',
    actions: <Button variant="on-color">Let&apos;s Talk</Button>,
    onColor: true,
  },
  render: (args) => (
    <Band background="var(--surface-brand-primary)">
      <SectionHeader {...args} />
    </Band>
  ),
};

/**
 * Asserts the defaults ADR-032 locks: `title` renders as an `<h2>` (outline
 * node, one level under the page `<h1>`), the wrapper carries the `center` +
 * `measure-md` modifier classes, and it composes `ContentBlock`'s
 * `bds-content-block__title` — SectionHeader never reimplements the title
 * element itself (ADR-023 §5).
 *
 * @summary Play-function interaction test — default markup + classes
 */
export const InteractionTestDefaultMarkup: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    title: 'Everything your practice needs',
    description: 'One platform for client intake, billing, and communication.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const heading = await canvas.findByRole('heading', {
      level: 2,
      name: 'Everything your practice needs',
    });
    await expect(heading).toHaveClass('bds-content-block__title');

    const wrapper = canvasElement.querySelector('.bds-section-header');
    await expect(wrapper).toHaveClass('bds-section-header--center');
    await expect(wrapper).toHaveClass('bds-section-header--measure-md');
  },
};

/**
 * Asserts the `onColor` passthrough: SectionHeader owns no colour, so the
 * modifier must land on the composed `ContentBlock` wrapper — never on
 * `.bds-section-header` and never as an inline `style` on a slot. A silent
 * break here would send consumers back to per-instance `color` overrides.
 *
 * @summary Play-function interaction test — onColor forwarding
 */
export const InteractionTestOnColorForwarding: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    title: 'Get in touch',
    description: 'Starting a new project or want to collaborate with us?',
    onColor: true,
  },
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('.bds-content-block');
    await expect(block).toHaveClass('bds-content-block--on-color');

    const wrapper = canvasElement.querySelector('.bds-section-header');
    await expect(wrapper).not.toHaveClass('bds-section-header--on-color');

    const title = canvasElement.querySelector('.bds-content-block__title');
    await expect(title).not.toHaveAttribute('style');
  },
};

/**
 * `subtitle` paired with `title` — the tight ADR-023 rhythm step, centered
 * like every other slot.
 * @summary Title with a paired subtitle
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Membership Plans',
    subtitle: 'Choose the plan that fits your practice',
    description: 'Every plan includes unlimited support and quarterly reviews.',
  },
  render: (args) => (
    <Band>
      <SectionHeader {...args} />
    </Band>
  ),
};

/**
 * `actions` centers with the rest of the column via
 * `.bds-content-block__actions { justify-content: center }`.
 * @summary Section intro with a centered actions row
 */
export const WithActions: Story = {
  args: {
    title: 'Ready to get started?',
    description: 'Book a 15-minute walkthrough — no commitment required.',
    actions: <Button variant="primary">Book a demo</Button>,
  },
  render: (args) => (
    <Band>
      <SectionHeader {...args} />
    </Band>
  ),
};
