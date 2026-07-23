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

/* ─── Character headshots (The Office) ────────────────────────── */

const headshots = {
  michael: 'https://randomuser.me/api/portraits/men/32.jpg',
  dwight:  'https://randomuser.me/api/portraits/men/44.jpg',
  jim:     'https://randomuser.me/api/portraits/men/75.jpg',
  pam:     'https://randomuser.me/api/portraits/women/68.jpg',
};

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox, photo-backed avatar. Size,
   status, and color are Controls (ADR-010 Q2).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive Avatar — photo-backed, size/status/color via Controls */
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
