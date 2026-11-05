import type { Meta, StoryObj } from '@storybook/react-vite';
import { MediaBlock } from './MediaBlock';
import { Image } from '../Image';
import { Button } from '../Button';

/* ─── Story-only placeholder (data URI, no network) ─── */

const portrait =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#e4b596"/><text x="200" y="260" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#5a3a28">400 × 500</text></svg>',
  );

/**
 * MediaBlock — a media slot stacked above a ContentBlock. Always stacked;
 * for media beside copy, compose Split + Image + ContentBlock.
 * @summary A media slot stacked above a ContentBlock
 */
const meta: Meta<typeof MediaBlock> = {
  title: 'Content/media-block',
  component: MediaBlock,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    media: { control: false },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
    actions: { control: false },
    titleAs: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'div', 'p'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl'] },
    onColor: { control: { type: 'boolean' } },
  },
};

export default meta;
type Story = StoryObj<typeof MediaBlock>;

/**
 * A portrait over a name, role, and short bio — the team-member shape.
 * @summary Portrait over name, role, and bio
 */
export const Default: Story = {
  args: {
    media: <Image src={portrait} alt="Placeholder portrait" ratio="4-5" />,
    title: 'Team member name',
    subtitle: 'Role',
    description: 'A short bio — one or two sentences about focus and experience.',
    actions: (
      <Button variant="secondary" size="sm">
        Read bio
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <MediaBlock {...args} />
    </div>
  ),
};
