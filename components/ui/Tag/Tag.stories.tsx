import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';

const meta = {
  title: 'UI/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    onRemove: { action: 'removed' },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Category',
  },
};

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 1l1.545 3.13L11 4.635 8.5 7.07l.59 3.43L6 8.885 2.91 10.5l.59-3.43L1 4.635l3.455-.505L6 1z" />
  </svg>
);

export const WithIcon: Story = {
  args: {
    children: 'Featured',
    icon: <StarIcon />,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    children: 'External',
    trailingIcon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M9 3L3 9M9 3v4M9 3H5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
};

export const WithRemove: Story = {
  args: {
    children: 'Removable',
    onRemove: () => {},
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const MultipleTags: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Tag>Design</Tag>
      <Tag>Development</Tag>
      <Tag>Marketing</Tag>
      <Tag icon={<StarIcon />}>Featured</Tag>
      <Tag onRemove={() => {}}>Removable</Tag>
      <Tag disabled>Archived</Tag>
    </div>
  ),
};
