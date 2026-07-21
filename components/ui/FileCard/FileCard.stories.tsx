import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FileCard } from './FileCard';
import { FileUploader } from '../FileUploader/FileUploader';

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80';
const SAMPLE_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path fill="%23333" d="M14 4l3 7h7l-5.5 4 2 7L14 18l-6.5 4 2-7L4 11h7z"/></svg>';

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
   DEFAULT — preview="image", all variation via Controls
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
   Q3 — dedicated stories per `preview` value
   ═══════════════════════════════════════════════════════════════ */

/** @summary SVG preview — renders `src` directly, no aspect-ratio crop */
export const Svg: Story = {
  args: {
    preview: 'svg',
    src: SAMPLE_SVG,
    name: 'industry-small-biz-primary.svg',
    meta: '28 × 28 • 673 B',
    onReplace: fn(),
    onDelete: fn(),
  },
};

/** @summary Icon preview — generic placeholder for non-renderable file types */
export const Icon: Story = {
  args: {
    preview: 'icon',
    name: 'brand-guidelines.pdf',
    meta: 'PDF • 2.4 MB',
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
