import type { Meta, StoryObj } from '@storybook/react-vite';

import { BlockMedia } from './BlockMedia';
import { placeholderImage } from './_fixtures';

const poster = placeholderImage(640, 360, '#eaf1fb', '#1f3d70', 'Poster');
// A non-loading source: the stories capture the primitive's frame + poster, not
// video playback (which is non-deterministic in a screenshot). With no loadable
// media the `<video>` rests on its poster, so the baseline is stable.
const videoSrc = '/blueprints-block-media-placeholder.mp4';

const meta: Meta<typeof BlockMedia> = {
  title: 'Blueprints/block media',
  component: BlockMedia,
  tags: ['surface-web'],
  argTypes: {
    media: {
      control: 'inline-radio',
      options: ['image', 'video', 'bg-video', 'none'],
      description: 'The media axis (ADR-039) — which element the primitive renders.',
    },
    src: { control: 'text', description: 'Image src, or video src for `video` / `bg-video`.' },
    poster: { control: 'text', description: 'Poster still for `video` / `bg-video`.' },
    alt: { control: 'text', description: 'Alt text for `image` (empty = decorative).' },
    ratio: {
      control: 'select',
      options: [
        '1-1', '3-2', '2-3', '4-3', '3-4', '4-5', '16-9', '9-16', '21-9',
        'square', 'photo-landscape', 'photo-portrait', 'cinema',
      ],
      description: 'The `Frame` aspect ratio the primitive locks to.',
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The shared media-axis primitive (ADR-039 §Media axis, brik-bds#2493). Renders `image` / `video` / `bg-video` / `none` through `<Frame>`, so a blueprint never hand-rolls a `<video>` tag or an `aspect-ratio`. `bg-video` is reduced-motion-gated by construction. Twin of the Astro rail\'s `_Media.astro`.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <BlockMedia {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof BlockMedia>;

/** @summary Media primitive — switch `media` / `ratio` via Controls */
export const Default: Story = {
  args: {
    media: 'image',
    src: placeholderImage(640, 360, '#eaf1fb', '#1f3d70', 'Media'),
    alt: '',
    ratio: '16-9',
  },
};

/** @summary Image — a lazy-loaded still inside a ratio-locked Frame */
export const Image: Story = {
  args: {
    media: 'image',
    src: placeholderImage(640, 360, '#eaf1fb', '#1f3d70', 'Image'),
    alt: '',
    ratio: '16-9',
  },
};

/** @summary Video — a foreground, user-controlled player (no autoplay) */
export const Video: Story = {
  args: {
    media: 'video',
    src: videoSrc,
    poster,
    ratio: '16-9',
  },
};

/**
 * `bg-video` is an ambient autoplay/muted/loop video, reduced-motion-gated by
 * construction: `autoPlay={!reduced}`, so under `prefers-reduced-motion` the
 * poster shows and nothing animates. Lazy via `preload="none"`.
 *
 * @summary Bg-video — ambient loop, reduced-motion-gated + lazy
 */
export const BgVideo: Story = {
  args: {
    media: 'bg-video',
    src: videoSrc,
    poster,
    ratio: '16-9',
  },
};
