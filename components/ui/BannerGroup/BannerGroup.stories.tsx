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
   BannerGroup.mdx as a docs-local demo (#1489). The `SeverityOrder` and
   `RepeatedTone` usage compositions (caller conventions, not API exercises)
   also live there as docs-local demos (#2499). */
