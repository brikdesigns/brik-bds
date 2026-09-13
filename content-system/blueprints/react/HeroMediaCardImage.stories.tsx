import type { Meta, StoryObj } from '@storybook/react-vite';

import { HeroMediaCardImage } from './HeroMediaCardImage';
import { placeholderImage } from './_fixtures';

const meta: Meta<typeof HeroMediaCardImage> = {
  title: 'Blueprints/hero media card image',
  component: HeroMediaCardImage,
  tags: ['surface-web'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    ratio: {
      control: 'select',
      options: [
        '1-1', '3-2', '2-3', '4-3', '3-4', '4-5', '16-9', '9-16', '21-9',
        'square', 'photo-landscape', 'photo-portrait', 'cinema',
      ],
      description: 'A `FrameRatio` slug — see `components/ui/Frame/Frame.tsx`.',
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A `Frame`-wrapped image (`.bds-hero__image-frame` + `.bds-hero__image`), class-identical to the `@deprecated` `HeroSplitImageCardOverlay` adapter\'s inline markup (brik-bds#2284). Composes as the first child of `<HeroMediaCard>`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroMediaCardImage>;

/** @summary Frame-wrapped hero image — switch `ratio` via Controls */
export const Default: Story = {
  args: {
    src: placeholderImage(320, 320, '#eaf1fb', '#1f3d70', 'Hero'),
    alt: '',
    ratio: 'square',
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <HeroMediaCardImage {...args} />
    </div>
  ),
};
