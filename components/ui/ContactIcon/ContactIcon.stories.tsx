import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactIcon, CONTACT_ICON_PLATFORMS } from './ContactIcon';
import type { ContactIconEmphasis, ContactIconType } from './ContactIcon';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ContactIcon> = {
  title: 'Foundation/Assets/contact-icon',
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
        'Hue source: `neutral` (`--text-muted`), `accent` (`--text-brand-primary`). Contact marks have no brand identity, so there is no `brand` value (see `SocialIcon`).',
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
    type: 'badge',
    emphasis: 'neutral',
    size: 'lg',
  },
};

/* ═══════════════════════════════════════════════════════════════
   ALL MARKS — the full type × emphasis matrix, every bundled mark.
   Irreducible: a single args set can't show 20 combinations at once
   (mirrors SocialIcon's own coverage gallery — brik-bds#1716 split).
   ═══════════════════════════════════════════════════════════════ */

const TYPES: ContactIconType[] = ['badge', 'glyph'];
const EMPHASES: ContactIconEmphasis[] = ['neutral', 'accent'];

/**
 * Every bundled mark across the full `type` × `emphasis` matrix — the coverage
 * grid brik-bds#1716 asked for.
 * @summary Full type × emphasis matrix, every bundled mark
 */
export const AllMarks: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      {CONTACT_ICON_PLATFORMS.map((platform) => (
        <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
          <span
            style={{
              width: '80px',
              flexShrink: 0,
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--label-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            {platform}
          </span>
          <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
            {TYPES.flatMap((type) =>
              EMPHASES.map((emphasis) => (
                <div key={`${type}-${emphasis}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-2xs)' }}>
                  <ContactIcon platform={platform} type={type} emphasis={emphasis} size="sm" />
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {type}/{emphasis}
                  </span>
                </div>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  ),
};
