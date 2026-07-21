import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUploader } from './FileUploader';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof FileUploader> = {
  title: 'Components/file-uploader',
  component: FileUploader,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  argTypes: {
    accept: {
      control: 'text',
      description: 'Accepted file types — extension (`.svg`), MIME type (`image/svg+xml`), or wildcard (`image/*`).',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow selecting more than one file at a time.',
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes. Oversized files are rejected with an inline error.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the dropzone — non-interactive, muted appearance.',
    },
    label: {
      control: 'text',
      description: 'Label text shown inside the dropzone.',
    },
    helperText: {
      control: 'text',
      description: 'Hint text below the label. Hidden when `error` is present.',
    },
    error: {
      control: 'text',
      description: 'Error message. Replaces `helperText` and applies the error style.',
    },
    onChange: {
      action: 'changed',
      description: 'Called with the accepted `File[]` after validation.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox, all variation via Controls
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    label: 'Drag and drop files here',
    helperText: 'PDF, JPG, PNG, or SVG up to 10MB',
    accept: '.pdf,.jpg,.png,.svg',
  },
};

/* ═══════════════════════════════════════════════════════════════
   Q4 — irreducible: live selected-file list, args can't express
   ═══════════════════════════════════════════════════════════════ */

/** @summary Multi-file selection with a live selected-file list */
export const WithFileList: Story = {
  render: () => {
    function UploadWithFileList() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <FileUploader
            label="Upload images"
            accept="image/*"
            multiple
            helperText="Select one or more images"
            onChange={setFiles}
          />
          {files.length > 0 && (
            <div style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-sm)',
              color: 'var(--text-secondary)',
            }}>
              {files.map((f) => (
                <div key={f.name}>{f.name} ({(f.size / 1024).toFixed(1)} KB)</div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return <UploadWithFileList />;
  },
};
