import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileCard } from './FileCard';
import { FileUploader } from '../FileUploader/FileUploader';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80';
const SAMPLE_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path fill="%23333" d="M14 4l3 7h7l-5.5 4 2 7L14 18l-6.5 4 2-7L4 11h7z"/></svg>';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof FileCard> = {
  title: 'Components/file-card',
  component: FileCard,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
} satisfies Meta<typeof FileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking. */
export const Playground: Story = {
  args: {
    preview: 'image',
    src: SAMPLE_IMAGE,
    aspectRatio: '1-1',
    name: 'hero.jpg',
    meta: '1600 × 900 • 248 KB',
    href: SAMPLE_IMAGE,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Preview modes + aspect ratios + actions
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side — preview modes, aspect ratios, and action presence. */
export const Variants: Story = {
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Preview: image (1:1)</SectionLabel>
        <FileCard
          preview="image"
          src={SAMPLE_IMAGE}
          name="profile-photo.jpg"
          meta="600 × 600 • 142 KB"
          href={SAMPLE_IMAGE}
          onReplace={() => {}}
          onDelete={() => {}}
        />
      </div>

      <div>
        <SectionLabel>Preview: image (16:9 — hero)</SectionLabel>
        <FileCard
          preview="image"
          src={SAMPLE_IMAGE}
          aspectRatio="16-9"
          name="hero-banner.jpg"
          meta="1600 × 900 • 248 KB"
          href={SAMPLE_IMAGE}
          onReplace={() => {}}
          onDelete={() => {}}
        />
      </div>

      <div>
        <SectionLabel>Preview: svg</SectionLabel>
        <FileCard
          preview="svg"
          src={SAMPLE_SVG}
          name="industry-small-biz-primary.svg"
          meta="28 × 28 • 673 B"
          onReplace={() => {}}
          onDelete={() => {}}
        />
      </div>

      <div>
        <SectionLabel>Preview: icon (non-renderable type)</SectionLabel>
        <FileCard
          preview="icon"
          name="brand-guidelines.pdf"
          meta="PDF • 2.4 MB"
          onReplace={() => {}}
          onDelete={() => {}}
        />
      </div>

      <div>
        <SectionLabel>No actions (read-only display)</SectionLabel>
        <FileCard
          preview="image"
          src={SAMPLE_IMAGE}
          name="archived-photo.jpg"
          meta="800 × 600 • 96 KB"
          href={SAMPLE_IMAGE}
        />
      </div>

      <div>
        <SectionLabel>Disabled</SectionLabel>
        <FileCard
          preview="image"
          src={SAMPLE_IMAGE}
          name="locked-asset.jpg"
          meta="400 × 400 • 64 KB"
          onReplace={() => {}}
          onDelete={() => {}}
          disabled
        />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Composition with FileUploader
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common composition with `FileUploader` — empty state vs populated state. */
export const Patterns: Story = {
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
  render: () => {
    function UploaderPair() {
      const [url, setUrl] = useState<string | null>(null);
      return (
        <Stack gap="var(--gap-md)">
          <SectionLabel>Empty + populated states</SectionLabel>
          {url ? (
            <FileCard
              preview="image"
              src={url}
              aspectRatio="16-9"
              name="uploaded.jpg"
              meta="1600 × 900 • image/jpeg"
              href={url}
              onReplace={() => setUrl(null)}
              onDelete={() => setUrl(null)}
            />
          ) : (
            <FileUploader
              label="Drop or click to upload"
              helperText="JPEG · PNG · WebP · AVIF — max 10MB"
              accept="image/*"
              onChange={(files) => {
                const file = files[0];
                if (file) setUrl(URL.createObjectURL(file));
              }}
            />
          )}
        </Stack>
      );
    }
    return <UploaderPair />;
  },
};
