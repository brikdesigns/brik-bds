import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackgroundPattern } from '../BackgroundPattern';
import { MediaBand } from './MediaBand';

/* ─── Fixtures ────────────────────────────────────────────────── */

/**
 * Band content — stands in for a real section body. `block="tall"` gives the
 * band enough height that two 80px seam fades read as edges rather than
 * swallowing the whole band.
 */
const BandContent = ({
  label = 'How we work',
  block = 'default',
}: {
  label?: string;
  block?: 'default' | 'tall';
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-md)',
      padding: `${block === 'tall' ? 'var(--space-2400)' : 'var(--space-1600)'} var(--space-800)`,
      textAlign: 'center',
    }}
  >
    <h2
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-heading)',
        fontSize: 'var(--heading-lg)',
        color: 'var(--text-primary)',
      }}
    >
      {label}
    </h2>
    <p
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-secondary)',
      }}
    >
      Content sits at z-index 2, above the decorative layer.
    </p>
  </div>
);

/**
 * A decorative graphic that deliberately overflows the band, to show
 * `overflow: clip` doing its job.
 */
const BleedingGraphic = () => (
  <svg
    viewBox="0 0 400 200"
    preserveAspectRatio="xMidYMid slice"
    style={{ position: 'absolute', inset: '-20%', width: '140%', height: '140%' }}
  >
    <circle cx="80" cy="60" r="110" fill="var(--surface-brand-secondary)" />
    <circle cx="320" cy="150" r="90" fill="var(--surface-secondary)" />
  </svg>
);

/**
 * Full-bleed wrapper. The preview decorator centers every canvas story in a
 * flex container ([preview.tsx](../../../.storybook/preview.tsx) `withTheme`),
 * so a band left bare shrinks to fit-content and stops reading as a page band.
 */
const FullWidth = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%' }}>{children}</div>
);

/** A neighbouring section, so a seam fade has something to blend into. */
const NeighbourBand = ({ label }: { label: string }) => (
  <div
    style={{
      background: 'var(--surface-primary)',
      padding: 'var(--space-1200) var(--space-800)',
      textAlign: 'center',
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--label-md)',
      color: 'var(--text-muted)',
    }}
  >
    {label}
  </div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof MediaBand> = {
  title: 'Containers/media-band',
  component: MediaBand,
  tags: ['surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Stacking-context band: a clipped positioned parent with a decorative layer at `z-index: 0`, content at `z-index: 2`, and an optional seam-fade at `z-index: 4`. Depth comes from gradients and token scrims, never `mix-blend-mode`.',
      },
    },
  },
  argTypes: {
    graphic: {
      control: false,
      description:
        'Decorative layer content (z:0). Rendered `aria-hidden` and non-interactive. Leave empty to paint `--bds-media-band-graphic` instead.',
    },
    children: { control: false, description: 'Band content (z:2).' },
    seam: {
      control: 'select',
      options: ['none', 'top', 'bottom', 'both'],
      description: 'Which edges carry a seam-fade gradient.',
    },
    as: { control: false, description: 'Element to render as — pass `section` for a page band.' },
  },
};

export default meta;
type Story = StoryObj<typeof MediaBand>;

/* ═══════════════════════════════════════════════════════════════
   Default is the args-driven sandbox; `seam` is a listed axis so it
   reads as a Control here (ADR-010 matrix Q2/Q3). The two extra stories
   are irreducible renders (Q4): `SeamBetweenSections` needs sibling
   bands to have anything to blend into, and `GraphicFromToken` needs a
   theme-level custom-property override with the slot left empty.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    as: 'section',
    seam: 'none',
    graphic: <BackgroundPattern variant="dot-grid" fade />,
    children: <BandContent />,
  },
  render: (args) => (
    <FullWidth>
      <MediaBand {...args} />
    </FullWidth>
  ),
};

/** @summary Seam fade dissolving the band into its neighbours */
export const SeamBetweenSections: Story = {
  args: {
    as: 'section',
    seam: 'both',
    graphic: <BleedingGraphic />,
    children: <BandContent label="Workflow" block="tall" />,
  },
  render: (args) => (
    <FullWidth>
      <NeighbourBand label="Preceding section" />
      <MediaBand
        {...args}
        style={{ '--bds-media-band-surface': 'var(--surface-secondary)' } as React.CSSProperties}
      />
      <NeighbourBand label="Following section" />
    </FullWidth>
  ),
};

/** @summary Graphic supplied by a client theme token, slot left empty */
export const GraphicFromToken: Story = {
  args: {
    as: 'section',
    seam: 'none',
    children: <BandContent label="Themed graphic" />,
  },
  render: (args) => (
    <FullWidth>
      <MediaBand
        {...args}
        style={
          {
            // The per-client graphic-swap path: a theme sets this custom property
            // and the decorative layer paints it with no slot content at all.
            // Kept clear of the centered heading — a decorative layer must not
            // eat the contrast of the content sitting above it.
            '--bds-media-band-graphic':
              'radial-gradient(circle at 12% 50%, var(--surface-brand-primary) 0%, transparent 45%)',
            '--bds-media-band-surface': 'var(--surface-secondary)',
          } as React.CSSProperties
        }
      />
    </FullWidth>
  ),
};
