import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from './Frame';

const meta: Meta<typeof Frame> = {
  title: 'Layouts/frame',
  component: Frame,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Aspect-ratio container for images, videos, and illustration slots. Pair with `<img>`/`<video>`/`<svg>` inside; the `fit` prop controls how content fills the frame. Use named presets (`square`, `wide`, etc.) for the common Brik shapes; pass `customRatio` for arbitrary values.',
      },
    },
  },
  argTypes: {
    ratio: { control: 'select', options: ['square', 'portrait', 'landscape', 'wide', 'ultrawide'] },
    fit: { control: 'select', options: ['cover', 'contain', 'fill', 'none'] },
    customRatio: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Frame>;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-xs)', // bds-lint-ignore
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      color: 'var(--text-muted)',
      marginBottom: 'var(--gap-sm)',
    }}
  >
    {children}
  </div>
);

const PlaceholderImage = () => (
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="var(--surface-secondary)" />
    <text
      x="200"
      y="160"
      textAnchor="middle"
      fontFamily="var(--font-family-body)"
      fontSize="20"
      fill="var(--text-muted)"
    >
      400 × 300 placeholder
    </text>
  </svg>
);

/** @summary Interactive playground */
export const Playground: Story = {
  args: { ratio: 'landscape', fit: 'cover' },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Frame {...args}>
        <PlaceholderImage />
      </Frame>
    </div>
  ),
};

/** @summary All named ratio presets */
export const RatioPresets: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--gap-lg)' }}>
      {(['square', 'portrait', 'landscape', 'wide', 'ultrawide'] as const).map((r) => (
        <div key={r}>
          <SectionLabel>ratio=&quot;{r}&quot;</SectionLabel>
          <Frame ratio={r}>
            <PlaceholderImage />
          </Frame>
        </div>
      ))}
    </div>
  ),
};

/** @summary Custom ratio via the `customRatio` prop */
export const CustomRatio: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', maxWidth: 480 }}>
      <div>
        <SectionLabel>customRatio=&quot;5 / 2&quot;</SectionLabel>
        <Frame customRatio="5 / 2">
          <PlaceholderImage />
        </Frame>
      </div>
      <div>
        <SectionLabel>customRatio=&quot;1.618&quot; (golden)</SectionLabel>
        <Frame customRatio="1.618">
          <PlaceholderImage />
        </Frame>
      </div>
    </div>
  ),
};

/** @summary Object-fit modes — cover crops, contain letterboxes */
export const FitModes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--gap-lg)' }}>
      {(['cover', 'contain', 'fill', 'none'] as const).map((f) => (
        <div key={f}>
          <SectionLabel>fit=&quot;{f}&quot;</SectionLabel>
          <Frame ratio="square" fit={f} style={{ background: 'var(--surface-secondary)' }}>
            <img
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTM1MzM1Ii8+PC9zdmc+"
              alt=""
              style={{ width: '100%', height: '100%' }}
            />
          </Frame>
        </div>
      ))}
    </div>
  ),
};

/** @summary Real-world: card image area */
export const CardImageArea: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 320,
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden',
      }}
    >
      <Frame ratio="wide" fit="cover">
        <PlaceholderImage />
      </Frame>
      <div style={{ padding: 'var(--padding-lg)' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-sm)' }}>
          Card title
        </h3>
        <p style={{ margin: 'var(--gap-xs) 0 0', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
          Frame holds the image area's shape regardless of the underlying media.
        </p>
      </div>
    </div>
  ),
};
