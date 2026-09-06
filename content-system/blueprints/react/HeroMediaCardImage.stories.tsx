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
    ratio: { control: false, description: 'A `FrameRatio` slug — see `components/ui/Frame/Frame.tsx`.' },
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

/** @summary Default square image frame */
export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <HeroMediaCardImage
        src={placeholderImage(320, 320, '#eaf1fb', '#1f3d70', 'Hero')}
        alt=""
        ratio="square"
      />
    </div>
  ),
};

/** @summary Alternate ratio — 4:5 portrait */
export const PortraitRatio: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <HeroMediaCardImage
        src={placeholderImage(320, 400, '#eaf1fb', '#1f3d70', 'Hero')}
        alt=""
        ratio="4-5"
      />
    </div>
  ),
};
