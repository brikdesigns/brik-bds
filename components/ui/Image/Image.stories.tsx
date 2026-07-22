import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from './Image';

/* ─── Story-only placeholders (data URI, no network) ─── */

const landscape =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="#e4b596"/><text x="400" y="235" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#5a3a28">800 × 450</text></svg>',
  );

const portrait =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 800"><rect width="450" height="800" fill="#a8c8b8"/><text x="225" y="410" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#2e4d3f">450 × 800</text></svg>',
  );

const meta: Meta<typeof Image> = {
  title: 'Foundation/Assets/image',
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

/** @summary Aspect-ratio slugs from the --aspect-* family */
export const Ratios: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-lg)' }}>
      {(['1-1', '3-2', '4-3', '3-4', '16-9', '9-16'] as const).map((r) => (
        <div key={r}>
          <p
            style={{
              margin: '0 0 var(--gap-sm)',
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            ratio=&quot;{r}&quot;
          </p>
          <Image src={landscape} alt="" ratio={r} />
        </div>
      ))}
    </div>
  ),
};

/** @summary object-fit modes inside a fixed ratio */
export const FitModes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-lg)' }}>
      {(['cover', 'contain', 'fill'] as const).map((f) => (
        <div key={f}>
          <p
            style={{
              margin: '0 0 var(--gap-sm)',
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            fit=&quot;{f}&quot;
          </p>
          {/* Portrait source in a square frame — the difference is visible */}
          <Image src={portrait} alt="" ratio="1-1" fit={f} />
        </div>
      ))}
    </div>
  ),
};

/** @summary Figure with a figcaption */
export const WithCaption: Story = {
  args: {
    src: portrait,
    alt: 'Dr. Alice Chen in the clinic',
    ratio: '3-4',
    caption: 'Dr. Alice Chen, Lead Orthodontist',
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Image {...args} />
    </div>
  ),
};

/** @summary Eager-loaded LCP hero (fetchpriority high) */
export const Eager: Story = {
  args: {
    src: landscape,
    alt: 'Above-the-fold hero image',
    ratio: '21-9',
    eager: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <Image {...args} />
    </div>
  ),
};
