import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Avatar> = {
  title: 'Foundation/Assets/avatar',
  component: Avatar,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Name used to generate initials when no image loads.',
    },
    src: {
      control: 'text',
      description: 'Image source URL. Falls back to initials when omitted or on load error.',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size token. Default `md`.',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy', 'away'],
      description: 'Presence status dot. Omit for none.',
    },
    color: {
      control: 'select',
      options: [undefined, 'green', 'purple', 'blue', 'orange', 'yellow', 'red'],
      description: 'Accent color for the initials fallback. No effect when an image loads.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

/* ─── Deterministic headshots ─────────────────────────────────────
   SVG data-URI silhouettes replace randomuser.me (#1319) — stories
   must render identically offline / in Chromatic. Hex values are
   image content (fake photography), not UI chrome. */

const headshot = (bg: string, fg: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
      `<rect width="96" height="96" fill="${bg}"/>` +
      `<circle cx="48" cy="36" r="16" fill="${fg}"/>` +
      `<path d="M18 96c4-20 16-30 30-30s26 10 30 30z" fill="${fg}"/>` +
      `</svg>`,
  );

const headshots = {
  michael: headshot('#dbe7f4', '#41618c'),
  dwight:  headshot('#e9e2d0', '#6b5d3a'),
  jim:     headshot('#dcefe0', '#3c6b49'),
  pam:     headshot('#f4e4e0', '#8c5a4e'),
};

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox, photo-backed avatar. Size,
   status, and color are Controls (ADR-010 Q2).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Photo Avatar — size/status/color via Controls */
export const Default: Story = {
  args: {
    name: 'Michael Scott',
    src: headshots.michael,
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   INITIALS — Q3 starting template: initials-only fallback, no
   image source. A distinct content-type an agent reaches for
   directly (e.g. a contact with no photo on file).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Initials-only fallback — no image source */
export const Initials: Story = {
  args: {
    name: 'Dwight Schrute',
    size: 'lg',
  },
};

/* ═══════════════════════════════════════════════════════════════
   AVATARGROUP — Q4 irreducible composition: overlapping avatar
   stack. Negative-margin + border overlap across multiple
   instances can't be expressed by a single Avatar's args.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Overlapping stacked-avatar group composition */
export const AvatarGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', marginLeft: 'var(--padding-sm)' }}>
      {([
        { name: 'Michael Scott', src: headshots.michael },
        { name: 'Dwight Schrute', src: headshots.dwight },
        { name: 'Jim Halpert', src: headshots.jim },
        { name: 'Pam Beesly', src: headshots.pam },
        { name: '+2', src: undefined },
      ]).map((user) => (
        <Avatar
          key={user.name}
          name={user.name}
          src={user.src}
          size="md"
          style={{ marginLeft: '-12px', border: '2px solid var(--background-input)' }}
        />
      ))}
    </div>
  ),
};
