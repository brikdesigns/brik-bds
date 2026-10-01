import type { Meta, StoryObj } from '@storybook/react-vite';
import { TypographyScale, FontWeightShowcase } from './_components';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Foundation/Typography',
  tags: ['surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The semantic type scale — heading / body / label / display roles, weights, and line heights — rendered live from the `--heading-*` / `--body-*` / `--label-*` / `--display-*` tokens. Pick a role by composition layer (see build-standards/headings); this gallery shows what each resolves to in the active typography mode.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ─── Live token maps (var refs — mode-aware, no hardcoded px) ─── */

const HEADING = {
  tiny: 'var(--bds-heading-tiny)',
  sm: 'var(--bds-heading-sm)',
  md: 'var(--bds-heading-md)',
  lg: 'var(--bds-heading-lg)',
  xl: 'var(--bds-heading-xl)',
  xxl: 'var(--bds-heading-xxl)',
  huge: 'var(--bds-heading-huge)',
};

const BODY = {
  tiny: 'var(--bds-body-tiny)',
  xs: 'var(--bds-body-xs)',
  sm: 'var(--bds-body-sm)',
  md: 'var(--bds-body-md)',
  lg: 'var(--bds-body-lg)',
  xl: 'var(--bds-body-xl)',
  huge: 'var(--bds-body-huge)',
};

const LABEL = {
  tiny: 'var(--bds-label-tiny)',
  xs: 'var(--bds-label-xs)',
  sm: 'var(--bds-label-sm)',
  md: 'var(--bds-label-md)',
  lg: 'var(--bds-label-lg)',
  xl: 'var(--bds-label-xl)',
};

const DISPLAY = {
  sm: 'var(--bds-display-sm)',
  md: 'var(--bds-display-md)',
  lg: 'var(--bds-display-lg)',
  xl: 'var(--bds-display-xl)',
};

// Weight token suffixes match the real --font-weight-* names; the numeric
// value drives the sample and is shown alongside.
const WEIGHTS = {
  thin: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

const LINE_HEIGHTS = ['tight', 'snug', 'moderate', 'normal', 'relaxed', 'loose'] as const;

/* ─── Helpers ─────────────────────────────────────────────────── */

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--bds-padding-xl)', fontFamily: 'var(--bds-font-family-body)' }}>{children}</div>
);

/* ─── Roles ───────────────────────────────────────────────────── */

/** @summary Heading, body, label, display roles + line heights */
export const Roles: Story = {
  render: () => (
    <Page>
      <TypographyScale title="Display" scale={DISPLAY} prefix="--display" />
      <TypographyScale title="Heading" scale={HEADING} prefix="--heading" />
      <TypographyScale title="Body" scale={BODY} prefix="--body" />
      <TypographyScale title="Label" scale={LABEL} prefix="--label" />

      <h3
        style={{
          fontFamily: 'var(--bds-font-family-heading)',
          fontSize: 'var(--bds-heading-sm)',
          marginBottom: 'var(--bds-gap-md)',
          color: 'var(--bds-text-primary)',
        }}
      >
        Line heights
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-lg)' }}>
        {LINE_HEIGHTS.map((name) => (
          <div key={name} style={{ display: 'flex', gap: 'var(--bds-gap-lg)', alignItems: 'flex-start' }}>
            <code
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 'var(--bds-body-xs)',
                width: '200px',
                flexShrink: 0,
                color: 'var(--bds-text-muted)',
                paddingTop: '2px',
              }}
            >
              --font-line-height-{name}
            </code>
            <p
              style={{
                margin: 0,
                maxWidth: '360px',
                fontSize: 'var(--bds-body-md)',
                lineHeight: `var(--font-line-height-${name})`,
                color: 'var(--bds-text-primary)',
              }}
            >
              The quick brown fox jumps over the lazy dog and keeps on running past the second line.
            </p>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* ─── Weights ─────────────────────────────────────────────────── */

/** @summary The seven --font-weight-* tokens */
export const Weights: Story = {
  render: () => (
    <Page>
      <FontWeightShowcase weights={WEIGHTS} />
    </Page>
  ),
};
