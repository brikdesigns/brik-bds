import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Image } from './Image';

/* ─── Story-only placeholders (data URI, no network) ─── */

const landscape =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="#e4b596"/><text x="400" y="235" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#5a3a28">800 × 450</text></svg>',
  );

const meta: Meta<typeof Image> = {
  title: 'Assets/image',
  component: Image,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'SEO- and CLS-aware `<img>` wrapper. Renders a semantic `<figure>` + `<img>` (+ optional `<figcaption>`); lazy loads and async-decodes by default. Set `ratio` to lock the shape to the `--aspect-*` token family (reserves layout space before load); set `eager` for the above-the-fold LCP image.',
      },
    },
  },
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    ratio: {
      control: 'select',
      options: ['1-1', '3-2', '4-3', '3-4', '4-5', '16-9', '9-16', '21-9'],
    },
    fit: { control: 'select', options: ['cover', 'contain', 'fill', 'none'] },
    position: { control: 'text' },
    eager: { control: 'boolean' },
    caption: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

/** @summary Interactive playground */
export const Default: Story = {
  args: {
    src: landscape,
    alt: 'Team collaborating at a whiteboard',
    ratio: '16-9',
    fit: 'cover',
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Image {...args} />
    </div>
  ),
};

/* `ratio` is a Control on Default — the slug gallery lives in Image.mdx
   as a docs-local demo (rule 5, #1489 / #1502). */

/* `fit` is a Control on Default — the mode gallery lives in Image.mdx
   as a docs-local demo (rule 5, #1489 / #1502). */

/**
 * `eager` is non-visual (Rule 3) — it renders identically to `Default`,
 * differing only in the `<img>` loading hints. Assert the wiring instead of
 * snapshotting an identical frame: `eager` must set `loading="eager"` +
 * `fetchpriority="high"` (Image.tsx), the LCP-image contract.
 *
 * @summary InteractionTest — eager sets loading + fetchpriority hints
 */
export const InteractionTestEagerHints: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    src: landscape,
    alt: 'Above-the-fold hero image',
    ratio: '21-9',
    eager: true,
  },
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole('img');
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
  },
};
