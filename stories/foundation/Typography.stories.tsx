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
  tiny: 'var(--heading-tiny)',
  sm: 'var(--heading-sm)',
  md: 'var(--heading-md)',
  lg: 'var(--heading-lg)',
  xl: 'var(--heading-xl)',
  xxl: 'var(--heading-xxl)',
  huge: 'var(--heading-huge)',
};

const BODY = {
  tiny: 'var(--body-tiny)',
  xs: 'var(--body-xs)',
  sm: 'var(--body-sm)',
  md: 'var(--body-md)',
  lg: 'var(--body-lg)',
  xl: 'var(--body-xl)',
  huge: 'var(--body-huge)',
};

const LABEL = {
  tiny: 'var(--label-tiny)',
  xs: 'var(--label-xs)',
  sm: 'var(--label-sm)',
  md: 'var(--label-md)',
  lg: 'var(--label-lg)',
  xl: 'var(--label-xl)',
};

const DISPLAY = {
  sm: 'var(--display-sm)',
  md: 'var(--display-md)',
  lg: 'var(--display-lg)',
  xl: 'var(--display-xl)',
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
  <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)' }}>{children}</div>
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
          fontFamily: 'var(--font-family-heading)',
          fontSize: 'var(--heading-sm)',
          marginBottom: 'var(--gap-md)',
          color: 'var(--text-primary)',
        }}
      >
        Line heights
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        {LINE_HEIGHTS.map((name) => (
          <div key={name} style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'flex-start' }}>
            <code
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 'var(--body-xs)',
                width: '200px',
                flexShrink: 0,
                color: 'var(--text-muted)',
                paddingTop: '2px',
              }}
            >
              --font-line-height-{name}
            </code>
            <p
              style={{
                margin: 0,
                maxWidth: '360px',
                fontSize: 'var(--body-md)',
                lineHeight: `var(--font-line-height-${name})`,
                color: 'var(--text-primary)',
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
