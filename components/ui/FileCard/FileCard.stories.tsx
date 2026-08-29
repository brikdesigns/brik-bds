import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FileCard } from './FileCard';
import { FileUploader } from '../FileUploader/FileUploader';

// Deterministic SVG data-URI photo placeholder — replaces Unsplash (#1319);
// hex values are image content, not UI chrome.
const SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#d8e4d4"/>' +
      '<circle cx="320" cy="60" r="28" fill="#f2e9c9"/>' +
      '<path d="M0 300l120-140 90 100 70-70 120 110z" fill="#5f7a56"/>' +
      '</svg>',
  );
/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof FileCard> = {
  title: 'Components/file-card',
  component: FileCard,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
  argTypes: {
    preview: {
      control: 'select',
      options: ['image', 'svg', 'icon'],
      description: 'Render mode for the preview thumbnail. `icon` renders a generic placeholder for non-renderable types.',
    },
    src: {
      control: 'text',
      description: 'Source URL for the preview. Required for `preview="image"` and `preview="svg"`.',
    },
    aspectRatio: {
      control: 'select',
      options: ['1-1', '3-2', '2-3', '4-3', '3-4', '16-9', '9-16', '21-9', 'square', 'photo-landscape', 'photo-portrait', 'cinema'],
      description: 'Aspect-ratio slug applied to the preview thumbnail. Maps to the `--aspect-*` token family.',
    },
    name: {
      control: 'text',
      description: 'Filename label.',
    },
    meta: {
      control: 'text',
      description: 'Optional metadata line — typically dimensions / size / mime info.',
    },
    href: {
      control: 'text',
      description: 'When set, the preview becomes a link that opens the file in a new tab.',
    },
    onReplace: {
      action: 'replace',
      description: 'Replace action handler. When omitted, the Replace button is not rendered.',
    },
    onDelete: {
      action: 'delete',
      description: 'Delete action handler. When omitted, the Delete button is not rendered.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable action buttons while preserving the visual.',
    },
    previewAlt: {
      control: 'text',
      description: 'Accessible alt text for image / svg previews. Falls back to `name`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.

   `preview` (image / svg / icon) is a select Control, not a per-value story:
   image and svg share one render path (both go through <Image>), and icon is a
   boolean-ish placeholder toggle — neither clears the ADR-010 Q3 bar for a
   dedicated story. `aspectRatio`, `href`, `disabled`, and the action handlers
   are all Controls here too.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    preview: 'image',
    src: SAMPLE_IMAGE,
    aspectRatio: '1-1',
    name: 'hero.jpg',
    meta: '1600 × 900 • 248 KB',
    href: SAMPLE_IMAGE,
    onReplace: fn(),
    onDelete: fn(),
  },
};

/* ═══════════════════════════════════════════════════════════════
   Q4 — irreducible: FileUploader/FileCard swap driven by upload state
   ═══════════════════════════════════════════════════════════════ */

/** @summary Empty-to-populated upload flow composed with `FileUploader` */
export const UploadFlow: Story = {
  render: () => {
    function UploaderPair() {
      const [url, setUrl] = useState<string | null>(null);
      return url ? (
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
      );
    }
    return <UploaderPair />;
  },
};
