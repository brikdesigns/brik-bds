import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUploader } from './FileUploader';

/**
 * FileUploader — drag-and-drop file input with optional size limit, accept
 * filter, and multi-file support. Renders a dashed-border drop surface with
 * label, helper text, and click-to-browse.
 * @summary Drag-and-drop file input
 */
const meta: Meta<typeof FileUploader> = {
  title: 'Components/Control/file-uploader',
  component: FileUploader,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof FileUploader>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    label: 'Drag and drop files here',
    helperText: 'PDF, JPG, or PNG up to 10MB',
    accept: '.pdf,.jpg,.png',
  },
};

/** Default — most common shape. Helper text describes accepted formats and size cap.
 *  @summary Default uploader */
export const Default: Story = {
  args: {
    label: 'Drag and drop files here',
    helperText: 'PDF, JPG, or PNG up to 10MB',
    accept: '.pdf,.jpg,.png',
  },
};

/** With explicit size limit — `maxSize` rejects files over the cap.
 *  @summary Uploader with size limit */
export const WithSizeLimit: Story = {
  args: {
    label: 'Upload document',
    helperText: 'Max 2MB',
    maxSize: 2 * 1024 * 1024,
    accept: '.pdf',
  },
};

/** Error state — `error` prop overrides the helper line and applies the error treatment.
 *  @summary Uploader with error */
export const Error: Story = {
  args: {
    label: 'Upload files',
    error: 'File type not supported',
  },
};

/** Disabled — drop surface and click handler suppressed.
 *  @summary Disabled uploader */
export const Disabled: Story = {
  args: {
    label: 'Upload files',
    helperText: 'Uploads are currently disabled',
    disabled: true,
  },
};

/** Multi-file with controlled state — confirms the file list updates as files
 *  drop in. Render is required for the controlled-state demo.
 *  @summary Multi-file uploader with controlled file list */
export const MultiFileInteractive: Story = {
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
  render: () => {
    const Demo = () => {
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
    };
    return <Demo />;
  },
};
