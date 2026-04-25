import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUploader } from './FileUploader';

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

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof FileUploader> = {
  title: 'Components/Control/file-uploader',
  component: FileUploader,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Drag and drop files here',
    helperText: 'PDF, JPG, or PNG up to 10MB',
    accept: '.pdf,.jpg,.png',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — States: default, size limit, error, disabled
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Default</SectionLabel>
        <FileUploader
          label="Drag and drop files here"
          helperText="PDF, JPG, or PNG up to 10MB"
          accept=".pdf,.jpg,.png"
        />
      </div>

      <div>
        <SectionLabel>With size limit</SectionLabel>
        <FileUploader
          label="Upload document"
          helperText="Max 2MB"
          maxSize={2 * 1024 * 1024}
          accept=".pdf"
        />
      </div>

      <div>
        <SectionLabel>Error state</SectionLabel>
        <FileUploader
          label="Upload files"
          error="File type not supported"
        />
      </div>

      <div>
        <SectionLabel>Disabled</SectionLabel>
        <FileUploader
          label="Upload files"
          helperText="Uploads are currently disabled"
          disabled
        />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Interactive with file list
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
  render: () => {
    function UploadWithFileList() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <div>
          <SectionLabel>Upload with file list</SectionLabel>
          <Stack gap="var(--gap-md)">
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
          </Stack>
        </div>
      );
    }

    return <UploadWithFileList />;
  },
};
