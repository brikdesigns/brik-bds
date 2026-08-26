import type { Meta, StoryObj } from '@storybook/react-vite';
import { Marquee } from './Marquee';

/* ─── Fixture ─────────────────────────────────────────────────── */

const logoNames = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Hooli'];

const LogoItems = () => (
  <>
    {logoNames.map((name) => (
      <span
        key={name}
        style={{
          fontFamily: 'var(--font-family-label)',
          fontSize: 'var(--label-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
    ))}
  </>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Marquee> = {
  title: 'Components/marquee',
  component: Marquee,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    children: {
      control: false,
      description: 'Item set to scroll — rendered twice internally for a seamless loop.',
    },
    direction: {
      control: 'select',
      options: ['ltr', 'rtl'],
      description: 'Scroll direction.',
    },
    pauseOnHover: {
      control: 'boolean',
      description: 'Pause the scroll animation on hover.',
    },
    fade: {
      control: 'boolean',
      description: 'Apply an edge fade mask (transparent → opaque → transparent).',
    },
    gap: {
      control: 'text',
      description: 'Gap between items — CSS length; number is treated as px. Overrides `--bds-marquee-gap`.',
    },
    logoHeight: {
      control: 'text',
      description: 'Height applied to img/svg item children — CSS length; number is treated as px. Overrides `--bds-marquee-logo-height`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Marquee>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.

   Marquee is a single-appearance component (ADR-010 matrix): `direction`
   is a listed axis (Control + MDX demo, never a story), `pauseOnHover`
   and `fade` are boolean toggles (Q2 — Controls only), `gap` and
   `logoHeight` are tuning values, not semantic starting points. No
   distinct visual state clears the Q3 bar, so this file ships only
   `Default`.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    direction: 'ltr',
    pauseOnHover: false,
    fade: true,
    children: <LogoItems />,
  },
};
