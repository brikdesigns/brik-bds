import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactIcon, CONTACT_ICON_PLATFORMS } from './ContactIcon';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ContactIcon> = {
  title: 'Assets/contact-icon',
  component: ContactIcon,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    platform: {
      control: 'select',
      options: CONTACT_ICON_PLATFORMS,
      description: 'Which contact mark to render.',
    },
    type: {
      control: 'select',
      options: ['badge', 'glyph'],
      description:
        '`badge` fills the background with the emphasis color and knocks the glyph out white. `glyph` leaves the background neutral/transparent and colors the glyph.',
    },
    emphasis: {
      control: 'select',
      options: ['neutral', 'accent'],
      description:
        'Hue source: `neutral` (`--bds-text-muted`), `accent` (`--bds-text-brand-primary`). Contact marks have no brand identity, so there is no `brand` value (see `SocialIcon`).',
    },
    tone: { table: { disable: true } },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    label: {
      control: 'text',
      description: 'Accessible-name override (defaults to the mark\'s display name, e.g. "Email").',
    },
    decorative: {
      control: 'boolean',
      description: 'Render aria-hidden when a sibling text label already names the mark.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContactIcon>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    platform: 'email',
    type: 'glyph',
    emphasis: 'neutral',
    size: 'lg',
  },
};

/* ═══════════════════════════════════════════════════════════════
   PER-STATE — Q3 semantic values (ADR-010). Each differs from Default's
   `glyph` / `neutral`. The full platform × type × emphasis matrix lives in
   ContactIcon.mdx (`MarkMatrix`).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Neutral badge: glyph knocked out on a filled tile */
export const Badge: Story = {
  args: { platform: 'email', type: 'badge', emphasis: 'neutral', size: 'lg' },
};

/** @summary Bare glyph colored with the brand accent */
export const Accent: Story = {
  args: { platform: 'email', type: 'glyph', emphasis: 'accent', size: 'lg' },
};
