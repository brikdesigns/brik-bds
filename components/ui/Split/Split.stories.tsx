import type { Meta, StoryObj } from '@storybook/react-vite';
import { Split } from './Split';
import { ContentBlock } from '../ContentBlock';
import { Image } from '../Image';
import { Button } from '../Button';

/* ─── Story-only placeholder (data URI, no network) ─── */

const photo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#e4b596"/><text x="400" y="310" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#5a3a28">800 × 600</text></svg>',
  );

/**
 * Split — two regions side by side at a fixed ratio, stacking below a
 * breakpoint. The only Layout primitive that takes an uneven ratio.
 * @summary Two regions at a fixed ratio; stacks on small screens
 */
const meta: Meta<typeof Split> = {
  title: 'Layouts/split',
  component: Split,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    ratio: { control: 'select', options: ['50-50', '60-40', '40-60'] },
    gap: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'huge'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    stackBelow: {
      control: 'select',
      options: ['tablet', 'desktop'],
      description: 'Viewport rung below which the two regions stack into one column, in child order.',
    },
    as: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Split>;

/**
 * Copy beside a photo — the canonical media + copy split.
 * @summary Copy beside a photo at an even ratio
 */
export const Default: Story = {
  args: { ratio: '50-50', gap: 'xl', align: 'center', stackBelow: 'tablet' },
  render: (args) => (
    <Split {...args}>
      <ContentBlock
        titleAs="h2"
        size="lg"
        title="Care that starts with listening"
        description="Every first visit is a conversation about what you want from your care, before anyone picks up an instrument."
        actions={<Button variant="primary">Book a visit</Button>}
      />
      <Image src={photo} alt="Placeholder photo" ratio="4-3" />
    </Split>
  ),
};

/**
 * Copy beside a contact aside — the wide region carries the reading, the
 * narrow one the supporting detail. `align="start"` keeps both tops level.
 * @summary Wide copy beside a narrow aside
 */
export const CopyWithAside: Story = {
  args: { ratio: '60-40', gap: 'xl', align: 'start' },
  render: (args) => (
    <Split {...args}>
      <ContentBlock
        titleAs="h2"
        size="md"
        title="About the practice"
        description="Founded as a two-chair office, the practice now runs four treatment rooms and a dedicated hygiene team. The longer region holds the reading copy so the line length stays comfortable."
      />
      <ContentBlock
        titleAs="h3"
        title="Visit us"
        subtitle="Mon–Fri, 8am–5pm"
        description="Free parking behind the building."
      />
    </Split>
  ),
};
