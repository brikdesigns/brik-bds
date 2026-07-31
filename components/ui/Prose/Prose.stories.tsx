import type { Meta, StoryObj } from '@storybook/react-vite';
import { Prose } from './Prose';
// Spacing-density mode overrides — see ContentBlock.stories.tsx for why this
// is imported directly rather than relying on the main Storybook preview.
import '../../../tokens/modes-spacing.css';

const SAMPLE_HTML = `
  <h2>Event details</h2>
  <p>Join us for an evening of networking, learning, and celebration.</p>
  <p>Doors open at 6pm; the program starts promptly at 6:30pm. Light refreshments will be served throughout the evening.</p>
  <p>Space is limited — <a href="#">reserve your spot</a> before the deadline.</p>
`;

/**
 * Prose — free-form CMS-HTML Block. Formalizes brikdesigns' `.rich-content`;
 * renders already-sanitized HTML and owns element-adjacency rhythm.
 * @summary Sanitized rich-text Block — owns heading/paragraph rhythm
 */
const meta: Meta<typeof Prose> = {
  title: 'Blocks/prose',
  component: Prose,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Prose>;

const Frame = ({ width = '480px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/**
 * A heading followed by paragraphs — the medium heading→paragraph gap, then
 * the wide paragraph→paragraph gap between consecutive paragraphs.
 * @summary Heading + paragraphs, sanitized HTML
 */
export const Default: Story = {
  args: { html: SAMPLE_HTML },
  render: (args) => (
    <Frame>
      <Prose {...args} />
    </Frame>
  ),
};

/**
 * Empty/falsy `html` renders nothing — Prose is a no-op, not an empty wrapper.
 * @summary Empty `html` renders nothing
 */
export const EmptyHtml: Story = {
  render: () => (
    <Frame>
      <Prose html="" />
    </Frame>
  ),
};

/**
 * The heading→paragraph and paragraph→paragraph gaps hold across all four
 * `[data-mode-spacing]` density modes — the wide gap stays visibly larger
 * than the medium gap in every mode (ADR-023 §3 monotonic guarantee).
 * @summary Rhythm across all four spacing density modes
 */
export const SpacingModes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--gap-xl)',
      }}
    >
      {(['default', 'compact', 'comfortable', 'spacious'] as const).map((mode) => (
        <div key={mode} data-mode-spacing={mode === 'default' ? undefined : mode}>
          <Frame width="400px">
            <p
              style={{
                margin: '0 0 8px',
                fontFamily: 'var(--font-family-label)',
                fontSize: 'var(--label-sm)',
                color: 'var(--text-secondary)',
                textTransform: 'capitalize',
              }}
            >
              {mode}
            </p>
            <Prose html={SAMPLE_HTML} />
          </Frame>
        </div>
      ))}
    </div>
  ),
};
