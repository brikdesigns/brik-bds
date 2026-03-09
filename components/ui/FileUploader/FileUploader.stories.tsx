import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUploader } from './FileUploader';

const meta: Meta<typeof FileUploader> = {
  title: 'Components/Control/file-uploader',
  component: FileUploader,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Drag and drop files here',
    helperText: 'PDF, JPG, or PNG up to 10MB',
    accept: '.pdf,.jpg,.png',
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

export const WithFileList: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
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
  },
};

export const WithSizeLimit: Story = {
  args: {
    label: 'Upload document',
    helperText: 'Max 2MB',
    maxSize: 2 * 1024 * 1024,
    accept: '.pdf',
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

export const WithError: Story = {
  args: {
    label: 'Upload files',
    error: 'File type not supported',
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

export const Disabled: Story = {
  args: {
    label: 'Upload files',
    helperText: 'Uploads are currently disabled',
    disabled: true,
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};
