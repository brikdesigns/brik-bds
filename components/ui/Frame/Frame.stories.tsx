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
    anchor: { control: 'inline-radio', options: ['width', 'height'] },
    customRatio: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Frame>;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-xs)', // bds-lint-ignore — story-only inline demo style, not shipped component CSS
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
export const Default: Story = {
  args: { ratio: 'landscape', fit: 'cover' },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Frame {...args}>
        <PlaceholderImage />
      </Frame>
    </div>
  ),
};

/* `ratio` is a Control on Default — the preset gallery lives in Frame.mdx
   as a docs-local demo (rule 5, #1489 / #1502). */

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

/* `fit` is a Control on Default — the mode gallery lives in Frame.mdx
   as a docs-local demo (rule 5, #1489 / #1502). */

/**
 * Default Frame is width-anchored (fills the container, height derives from
 * ratio). `anchor="height"` inverts that: the caller sets a height and the
 * ratio derives the width. Used for fixed-height thumbnail rows (e.g.
 * `FileCard`) where wide ratios must stay tall enough to read.
 *
 * bds-lint-ignore — the subject is `anchor`, not `ratio`: showing that height
 * anchoring inverts the sizing model needs ratio varied underneath it, so it is
 * a two-axis interaction rather than one axis (#1502).
 * @summary Height-anchored — fixed height, ratio drives width
 */
export const HeightAnchored: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--gap-lg)' }}>
      {(['1-1', '4-3', '16-9', '21-9'] as const).map((r) => (
        <div key={r}>
          <SectionLabel>ratio=&quot;{r}&quot;</SectionLabel>
          <Frame
            ratio={r}
            anchor="height"
            fit="cover"
            style={{ height: 'var(--size-1400)', background: 'var(--surface-secondary)' }}
          >
            <PlaceholderImage />
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
