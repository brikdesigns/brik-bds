import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContentBlock } from './ContentBlock';
import { Button } from '../Button';
// Spacing-density mode overrides — not imported by the main Storybook preview
// (product apps opt in per-surface), so the mode demo below imports it
// directly to exercise `[data-mode-spacing]` against real CSS.
import '../../../tokens/modes-spacing.css';

/**
 * ContentBlock — fixed-slot Block-layer unit (title / subtitle / description /
 * actions). Owns the vertical rhythm BETWEEN its own slots (ADR-023).
 * @summary Fixed-slot content unit — title, subtitle, description, actions
 */
const meta: Meta<typeof ContentBlock> = {
  title: 'Blocks/content-block',
  component: ContentBlock,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
    titleAs: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'div', 'p'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    onColor: {
      control: { type: 'boolean' },
      description:
        'Swaps the text slots to `--text-on-color-dark` for a block on a filled brand/dark surface. On `--surface-brand-primary` the pair is 3.78:1 — AA-large, not AA.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContentBlock>;

const Frame = ({
  width = '360px',
  background = 'var(--surface-primary)',
  children,
}: {
  width?: string;
  background?: string;
  children: React.ReactNode;
}) => <div style={{ width, padding: 'var(--padding-lg)', background }}>{children}</div>;

/**
 * All four slots filled — the full shape.
 * @summary All four slots — title, subtitle, description, actions
 */
export const Default: Story = {
  args: {
    title: 'Membership Plans',
    subtitle: 'Choose the plan that fits your practice',
    description:
      'Every plan includes unlimited support, quarterly reviews, and access to the client portal.',
    actions: <Button variant="primary">View Plans</Button>,
  },
  render: (args) => (
    <Frame>
      <ContentBlock {...args} />
    </Frame>
  ),
};

/**
 * Each slot is independently omittable — subtitle and actions dropped here,
 * leaving title→description at the medium gap with no tight step in between.
 * @summary Subtitle and actions omitted
 */
export const OmittedSlots: Story = {
  render: () => (
    <Frame>
      <ContentBlock
        title="First Impressions"
        description="75% of website credibility comes from design — a first impression forms in about 0.05 seconds."
      />
    </Frame>
  ),
};

/**
 * `onColor` — the block sitting on a filled brand band. All three text slots
 * swap to `--text-on-color-dark`, so the consumer never pushes a per-instance
 * `color` into a slot the block owns. `--text-on-color-dark` is mode-invariant
 * white, so the same story holds in light and dark.
 *
 * Contrast: white on `--surface-brand-primary` (`--color-poppy-500`) is
 * **3.78:1 — AA-large (3:1), not AA (4.5:1)**. Brand-primary fills are gated
 * AA-large by policy (`tokens/contrast-pairings.json`, BDS-22 / ADR-015). The
 * title is large text and unaffected; keep `description` short on a band.
 * @summary On a filled brand band — on-color text slots
 */
export const OnColor: Story = {
  args: {
    title: 'Get in touch',
    description: 'Starting a new project or want to collaborate with us?',
    actions: <Button variant="on-color">Let&apos;s Talk</Button>,
    onColor: true,
  },
  render: (args) => (
    <Frame background="var(--surface-brand-primary)">
      <ContentBlock {...args} />
    </Frame>
  ),
};

/**
 * The rhythm holds across all four `[data-mode-spacing]` density modes —
 * tight title→subtitle stays smaller than the medium subtitle→description
 * step in every mode (ADR-023 §3 monotonic guarantee).
 *
 * bds-lint-ignore — the assertion is a *relationship across* modes (tight stays
 * smaller than medium in all four), so the four must be visible at once; the
 * spacing-mode toolbar global shows one at a time (#1502).
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
          <Frame width="300px">
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
            <ContentBlock
              title="Membership Plans"
              subtitle="Choose the plan that fits your practice"
              description="Every plan includes unlimited support and quarterly reviews."
              actions={<Button variant="primary">View Plans</Button>}
            />
          </Frame>
        </div>
      ))}
    </div>
  ),
};
