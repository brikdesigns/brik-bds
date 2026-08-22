import type { Meta, StoryObj } from '@storybook/react-vite';
import { BannerGroup } from './BannerGroup';
import { Banner } from '../Banner';
import { Button } from '../Button';

const meta: Meta<typeof BannerGroup> = {
  title: 'Components/banner-group',
  component: BannerGroup,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Gap between banners. Default `md` — banners read as one notice block.',
    },
    children: {
      control: false,
      description: '`<Banner>` children, ordered most-severe first.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BannerGroup>;

/* ─── 1. Default ──────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    gap: 'md',
  },
  render: (args) => (
    <BannerGroup {...args}>
      <Banner
        tone="warning"
        title="Proposal in process — Northline Dental"
        description="This prospect has a proposal sent and awaiting signature."
        action={<Button variant="secondary" size="sm">View</Button>}
      />
      <Banner
        tone="info"
        title="Two invoices are past due"
        description="Payment reminders were sent on the 14th."
        action={<Button variant="secondary" size="sm">Review</Button>}
      />
      <Banner
        title="Want to set up a new client?"
        description="Click to begin the setup workflow for new clients."
        action={<Button variant="on-color" size="sm">Get started</Button>}
      />
    </BannerGroup>
  ),
};

/* `gap` is a Control on Default — the gap-scale comparison lives in
   BannerGroup.mdx as a docs-local demo (#1489). */

/* ─── 2. Severity order ──────────────────────────────────────── */

/**
 * The order rule, rendered. `negative → warning → info → positive →
 * announcement`; marketing tone always lands last.
 *
 * @summary Severity order
 */
export const SeverityOrder: Story = {
  render: () => (
    <BannerGroup>
      <Banner
        tone="negative"
        title="Card on file declined"
        description="Update the payment method to keep services active."
        action={<Button variant="secondary" size="sm">Update</Button>}
      />
      <Banner
        tone="warning"
        title="Brand assets are incomplete"
        description="Three logo orientations are missing."
      />
      <Banner
        tone="info"
        title="Reporting now covers paid search"
        description="New metrics appear from this month forward."
      />
      <Banner
        title="Refer a client, get a credit"
        description="Both accounts receive one month of managed hosting."
        action={<Button variant="on-color" size="sm">Learn more</Button>}
      />
    </BannerGroup>
  ),
};

/* ─── 3. Repeated tone ───────────────────────────────────────── */

/**
 * Several banners of the same tone — the shape a per-entity alert list takes
 * when each entity carries its own action. Cap the rendered set and roll the
 * remainder into a summary rather than stacking indefinitely.
 *
 * @summary Repeated tone
 */
export const RepeatedTone: Story = {
  render: () => (
    <BannerGroup>
      <Banner
        tone="warning"
        title="Proposal in process — Northline Dental"
        description="This prospect has a proposal sent and awaiting signature."
        action={<Button variant="secondary" size="sm">View</Button>}
      />
      <Banner
        tone="warning"
        title="Proposal in process — Harbor Wealth"
        description="This prospect has a draft proposal ready to send."
        action={<Button variant="secondary" size="sm">View</Button>}
      />
      <Banner
        tone="warning"
        title="Proposal in process — Cedar Vet"
        description="This prospect has a proposal viewed and awaiting signature."
        action={<Button variant="secondary" size="sm">View</Button>}
      />
    </BannerGroup>
  ),
};
