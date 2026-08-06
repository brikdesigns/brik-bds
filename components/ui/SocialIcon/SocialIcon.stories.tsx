import type { Meta, StoryObj } from '@storybook/react-vite';
import { SocialIcon, SOCIAL_ICON_PLATFORMS } from './SocialIcon';
import type { SocialIconTone, SocialIconType } from './SocialIcon';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SocialIcon> = {
  title: 'Foundation/Assets/social-icon',
  component: SocialIcon,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    platform: {
      control: 'select',
      options: SOCIAL_ICON_PLATFORMS,
      description: 'Which social/contact mark to render.',
    },
    type: {
      control: 'select',
      options: ['badge', 'glyph'],
      description:
        '`badge` fills the background with the tone color and knocks the glyph out white. `glyph` leaves the background neutral/transparent and colors the glyph.',
    },
    tone: {
      control: 'select',
      options: ['grayscale', 'brand', 'accent'],
      description:
        'Recolor scheme: `grayscale` (neutral `--text-muted`), `brand` (the platform\'s flat brand color — falls back to grayscale for non-platform marks), `accent` (`--text-brand-primary`).',
    },
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
    tone: 'grayscale',
    size: 'lg',
  },
};

/* ═══════════════════════════════════════════════════════════════
   ALL MARKS — the full type × tone matrix, every bundled platform.
   Irreducible: a single args set can't show 60 combinations at once
   (mirrors Icon's `BundledSet` / Logo's `CreditCard` coverage galleries).
   ═══════════════════════════════════════════════════════════════ */

const TYPES: SocialIconType[] = ['badge', 'glyph'];
const TONES: SocialIconTone[] = ['grayscale', 'brand', 'accent'];

/**
 * Every bundled platform across the full `type` × `tone` matrix — the
 * coverage grid brik-bds#1713 asked for. `brand` falls back to the neutral
 * `grayscale` fill for the 5 non-platform marks (message/email/website/
 * calendar/phone), which have no brand color.
 * @summary Full type × tone matrix, every bundled platform
 */
export const AllMarks: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      {SOCIAL_ICON_PLATFORMS.map((platform) => (
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
              TONES.map((tone) => (
                <div key={`${type}-${tone}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-2xs)' }}>
                  <SocialIcon platform={platform} type={type} tone={tone} size="sm" />
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {type}/{tone}
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
