import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SelectableMediaTile } from './SelectableMediaTile';

/* ─── Deterministic placeholder images (story-only) ──────────────────
   Inline SVG data-URIs so Chromatic snapshots never depend on the
   network. Each is a flat-colour swatch with a label. */

const swatch = (label: string, bg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="${bg}"/><text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
  )}`;

const PHOTOS = [
  { id: 'hero', name: 'hero-exterior.jpg', src: swatch('Hero', '#3b5bdb') },
  { id: 'lobby', name: 'lobby-wide.jpg', src: swatch('Lobby', '#2f9e44') },
  { id: 'team', name: 'team-portrait.jpg', src: swatch('Team', '#e8590c') },
];

/* ─── Grid helper (story-only) ───────────────────────────────────── */

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 140px)',
      gap: 'var(--gap-sm)',
    }}
  >
    {children}
  </div>
);

/* ─── Meta ───────────────────────────────────────────────────────── */

const meta: Meta<typeof SelectableMediaTile> = {
  title: 'Blocks/selectable-media-tile',
  component: SelectableMediaTile,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    src: { control: 'text', description: 'Image source URL.' },
    alt: { control: 'text', description: 'Image alt text — required.' },
    caption: { control: 'text', description: 'Caption below the image (ReactNode).' },
    selected: {
      control: 'boolean',
      description: 'Persistent toggle state — brand ring + check overlay, sets `aria-pressed`.',
    },
    disabled: { control: 'boolean', description: 'Mutes styling and blocks the click.' },
    aspectRatio: {
      control: 'text',
      description: 'CSS aspect-ratio for the image box. Default `4 / 3`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectableMediaTile>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * A single tile. Toggle `selected` / `disabled` and edit `caption` /
 * `aspectRatio` via Controls.
 *
 * @summary Vertical image tile — image + caption + selected state
 */
export const Default: Story = {
  args: {
    src: PHOTOS[0].src,
    alt: 'Hero exterior photo',
    caption: 'hero-exterior.jpg',
    selected: false,
    disabled: false,
  },
  render: (args) => (
    <div style={{ width: 140 }}>
      <SelectableMediaTile {...args} onClick={() => {}} />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   PICKER — single-select image grid (the photo-pinner pattern)
   ═══════════════════════════════════════════════════════════════ */

/**
 * A hero-photo picker: an image grid where one tile is pinned at a
 * time. Clicking the pinned tile clears it. Selection is a brand ring
 * + check overlay + emphasised caption; `aria-pressed` tracks state.
 *
 * @summary Single-select photo grid — one pinned tile at a time
 */
export const Picker: Story = {
  render: () => {
    const [pinned, setPinned] = React.useState<string | null>('lobby');
    return (
      <Grid>
        {PHOTOS.map((photo) => (
          <SelectableMediaTile
            key={photo.id}
            src={photo.src}
            alt={photo.name}
            caption={photo.name}
            selected={pinned === photo.id}
            onClick={() => setPinned(pinned === photo.id ? null : photo.id)}
          />
        ))}
      </Grid>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lobby = canvas.getByRole('button', { name: /lobby-wide/ });
    const team = canvas.getByRole('button', { name: /team-portrait/ });

    // Lobby is pinned initially.
    await expect(lobby).toHaveAttribute('aria-pressed', 'true');
    await expect(team).toHaveAttribute('aria-pressed', 'false');

    // Pin Team → moves the pressed state.
    await userEvent.click(team);
    await expect(team).toHaveAttribute('aria-pressed', 'true');
    await expect(lobby).toHaveAttribute('aria-pressed', 'false');

    // Clicking the pinned tile again clears it.
    await userEvent.click(team);
    await expect(team).toHaveAttribute('aria-pressed', 'false');
  },
};
