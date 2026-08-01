import type { Meta, StoryObj } from '@storybook/react-vite';
import { SpacingScale, SemanticSpacing } from './_components';
import { spaceScale, semanticSpace } from '../../tokens';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Foundation/Spacing',
  tags: ['surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The spacing scale — the primitive `--space-*` step ladder plus the semantic `--padding-*` (container edges) and `--gap-*` (between siblings) tokens. Both semantic families modulate under the `data-mode-spacing` density modes; see the Modes story and build-standards/content-rhythm for when to reach for gap vs padding.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ─── Semantic maps derived from the token source (no hardcoding) ─── */

const PADDING = Object.fromEntries(
  Object.entries(semanticSpace).filter(
    ([k]) => !k.startsWith('gap--') && !['button', 'input'].includes(k)
  )
);

const GAP = Object.fromEntries(
  Object.entries(semanticSpace)
    .filter(([k]) => k.startsWith('gap--'))
    .map(([k, v]) => [k.replace('gap--', ''), v])
);

/* ─── Helpers ─────────────────────────────────────────────────── */

const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)' }}>{children}</div>
);

const SampleCard = () => (
  <div
    style={{
      background: 'var(--surface-primary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--padding-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-sm)',
      maxWidth: 280,
    }}
  >
    <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-sm)', color: 'var(--text-primary)' }}>
      Card title
    </h3>
    <p style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
      Title, description, actions — <code>padding-lg</code> outer, <code>gap-sm</code> between rows.
    </p>
    <div style={{ display: 'flex', gap: 'var(--gap-xs)', justifyContent: 'flex-end' }}>
      <span style={{ padding: 'var(--padding-xs) var(--padding-sm)', border: '1px solid var(--border-primary)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--label-sm)', color: 'var(--text-primary)' }}>Cancel</span>
      <span style={{ padding: 'var(--padding-xs) var(--padding-sm)', background: 'var(--background-brand-primary)', color: 'var(--text-on-color-dark)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--label-sm)' }}>Save</span>
    </div>
  </div>
);

/* ─── Scale ───────────────────────────────────────────────────── */

/** @summary Primitive step ladder + semantic padding and gap */
export const Scale: Story = {
  render: () => (
    <Page>
      <SemanticSpacing title="Padding — container edges" tokens={PADDING} varPrefix="--padding" />
      <SemanticSpacing title="Gap — between siblings" tokens={GAP} varPrefix="--gap" />
      <SpacingScale title="Primitive step ladder" scale={spaceScale} prefix="--space" />
    </Page>
  ),
};

/* ─── Modes ───────────────────────────────────────────────────── */

const MODES = ['default', 'compact', 'comfortable', 'spacious'] as const;

/** @summary Padding and gap across the four density modes */
export const Modes: Story = {
  render: () => (
    <div
      style={{
        padding: 'var(--padding-lg)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--gap-md)',
        background: 'var(--surface-secondary)',
      }}
    >
      {MODES.map((mode) => (
        <div
          key={mode}
          data-mode-spacing={mode === 'default' ? undefined : mode}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}
        >
          <code
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 'var(--body-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            {mode === 'default' ? '<div>' : `data-mode-spacing="${mode}"`}
          </code>
          <SampleCard />
        </div>
      ))}
    </div>
  ),
};
