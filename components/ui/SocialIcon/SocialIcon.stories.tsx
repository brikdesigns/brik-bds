import type { Meta, StoryObj } from '@storybook/react-vite';
import { SocialIcon, SOCIAL_ICON_PLATFORMS } from './SocialIcon';
import type { SocialIconEmphasis, SocialIconType } from './SocialIcon';

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
   ALL MARKS — the full type × emphasis matrix, every bundled platform.
   Irreducible: a single args set can't show 36 combinations at once
   (mirrors `Assets/icon-catalog` / Logo's `CreditCard` coverage galleries;
   Icon's `BundledSet` was folded into that catalog's offline flag, #2628).
   ═══════════════════════════════════════════════════════════════ */

const TYPES: SocialIconType[] = ['badge', 'glyph'];
const EMPHASES: SocialIconEmphasis[] = ['neutral', 'brand', 'accent', 'inverse'];

/**
 * Every bundled platform across the full `type` × `emphasis` matrix — the
 * coverage grid brik-bds#1716 asked for, extended to the `inverse` value in
 * brik-bds#2274. Every platform has a Foundations brand-color token, so
 * `brand` never falls back to a neutral here (contrast the pre-split #1713
 * behavior).
 * @summary Full type × emphasis matrix, every bundled platform
 */
export const AllMarks: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-md)' }}>
      {SOCIAL_ICON_PLATFORMS.map((platform) => (
        <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 'var(--bds-gap-md)' }}>
          <span
            style={{
              width: '80px',
              flexShrink: 0,
              fontFamily: 'var(--bds-font-family-label)',
              fontSize: 'var(--bds-label-sm)',
              color: 'var(--bds-text-secondary)',
            }}
          >
            {platform}
          </span>
          <div style={{ display: 'flex', gap: 'var(--bds-gap-md)', flexWrap: 'wrap' }}>
            {TYPES.flatMap((type) =>
              EMPHASES.map((emphasis) => (
                <div key={`${type}-${emphasis}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--bds-gap-tiny)' }}>
                  <SocialIcon platform={platform} type={type} emphasis={emphasis} size="sm" />
                  <span style={{ fontSize: '0.625rem', color: 'var(--bds-text-muted)' }}>
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
