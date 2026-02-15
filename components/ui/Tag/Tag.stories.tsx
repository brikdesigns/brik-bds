import type { Meta, StoryObj } from '@storybook/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowUpRightFromSquare, faTag, faCircle } from '@fortawesome/free-solid-svg-icons';
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

export const WithIcon: Story = {
  args: {
    children: 'Featured',
    icon: <FontAwesomeIcon icon={faStar} />,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    children: 'External',
    trailingIcon: <FontAwesomeIcon icon={faArrowUpRightFromSquare} />,
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
      <Tag icon={<FontAwesomeIcon icon={faTag} />}>Development</Tag>
      <Tag icon={<FontAwesomeIcon icon={faCircle} />}>Marketing</Tag>
      <Tag icon={<FontAwesomeIcon icon={faStar} />}>Featured</Tag>
      <Tag onRemove={() => {}}>Removable</Tag>
      <Tag disabled>Archived</Tag>
    </div>
  ),
};
