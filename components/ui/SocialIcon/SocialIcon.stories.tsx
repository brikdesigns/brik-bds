import type { Meta, StoryObj } from '@storybook/react-vite';
import { SocialIcon, SOCIAL_ICON_PLATFORMS } from './SocialIcon';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SocialIcon> = {
  title: 'Assets/social-icon',
  component: SocialIcon,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    platform: {
      control: 'select',
      options: SOCIAL_ICON_PLATFORMS,
      description: 'Which social mark to render.',
    },
    type: {
      control: 'select',
      options: ['badge', 'glyph'],
      description:
        '`badge` fills the background with the emphasis color and knocks the glyph out white. `glyph` leaves the background neutral/transparent and colors the glyph.',
    },
    emphasis: {
      control: 'select',
      options: ['neutral', 'brand', 'accent', 'inverse'],
      description:
        'Hue source: `neutral` (`--bds-text-muted`), `brand` (the platform\'s Foundations brand-color token — every platform has one), `accent` (`--bds-text-brand-primary`), `inverse` (near-black `--bds-surface-inverse`).',
    },
    tone: { table: { disable: true } },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    label: {
      control: 'text',
      description: 'Accessible-name override (defaults to the platform\'s display name, e.g. "YouTube").',
    },
    decorative: {
      control: 'boolean',
      description: 'Render aria-hidden when a sibling text label already names the platform.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SocialIcon>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    platform: 'youtube',
    type: 'badge',
    emphasis: 'neutral',
    size: 'lg',
  },
};

/* ═══════════════════════════════════════════════════════════════
   PER-STATE — Q3 semantic values (ADR-010). Each pairs a `type` with an
   `emphasis`, distinct from Default's `badge` / `neutral`. The full
   platform × type × emphasis matrix lives in SocialIcon.mdx (`MarkMatrix`).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Platform-colored badge with a white knocked-out glyph */
export const Badge: Story = {
  args: { platform: 'youtube', type: 'badge', emphasis: 'brand', size: 'lg' },
};

/** @summary Bare neutral mark on a transparent background */
export const Glyph: Story = {
  args: { platform: 'youtube', type: 'glyph', emphasis: 'neutral', size: 'lg' },
};

/** @summary Bare mark colored with the platform's brand token */
export const Brand: Story = {
  args: { platform: 'youtube', type: 'glyph', emphasis: 'brand', size: 'lg' },
};

/** @summary Near-black badge for light surfaces */
export const Inverse: Story = {
  args: { platform: 'youtube', type: 'badge', emphasis: 'inverse', size: 'lg' },
};
