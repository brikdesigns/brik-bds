import type { Meta, StoryObj } from '@storybook/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowUpRightFromSquare, faTag, faCircle, faCertificate, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { Tag } from './Tag';

const meta = {
  title: 'Components/tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    disabled: { control: 'boolean' },
    onRemove: { action: 'removed' },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default tag at medium size
 */
export const Default: Story = {
  args: {
    children: 'Tag',
    size: 'md',
  },
};

/**
 * All three sizes
 */
export const AllSizes: Story = {
  args: { children: 'Tag' },
  parameters: {
    docs: {
      source: {
        code: `<Tag size="sm">Tag</Tag>
<Tag size="md">Tag</Tag>
<Tag size="lg">Tag</Tag>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--md)', alignItems: 'center' }}>
      <Tag size="sm">Tag</Tag>
      <Tag size="md">Tag</Tag>
      <Tag size="lg">Tag</Tag>
    </div>
  ),
};

/**
 * With left icon
 */
export const WithLeftIcon: Story = {
  args: {
    children: 'Tag',
    size: 'lg',
    icon: <FontAwesomeIcon icon={faCertificate} />,
  },
};

/**
 * With right icon
 */
export const WithRightIcon: Story = {
  args: {
    children: 'Tag',
    size: 'lg',
    trailingIcon: <FontAwesomeIcon icon={faCircleXmark} />,
  },
};

/**
 * With both icons — left and right
 */
export const WithBothIcons: Story = {
  args: { children: 'Tag' },
  parameters: {
    docs: {
      source: {
        code: `<Tag size="sm" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Tag</Tag>
<Tag size="md" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Tag</Tag>
<Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Tag</Tag>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--md)', alignItems: 'center' }}>
      <Tag size="sm" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Tag</Tag>
      <Tag size="md" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Tag</Tag>
      <Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Tag</Tag>
    </div>
  ),
};

/**
 * Icon positions — left only, right only, both
 */
export const IconPositions: Story = {
  args: { children: 'Tag' },
  parameters: {
    docs: {
      source: {
        code: `<Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />}>Left icon</Tag>
<Tag size="lg" trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Right icon</Tag>
<Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Both icons</Tag>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--md)', alignItems: 'center' }}>
      <Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />}>Left icon</Tag>
      <Tag size="lg" trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Right icon</Tag>
      <Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Both icons</Tag>
    </div>
  ),
};

/**
 * With remove button
 */
export const WithRemove: Story = {
  args: {
    children: 'Removable',
    size: 'md',
    onRemove: () => {},
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    size: 'md',
    disabled: true,
  },
};

/**
 * Multiple tags — real-world usage
 */
export const MultipleTags: Story = {
  args: { children: 'Tag' },
  parameters: {
    docs: {
      source: {
        code: `<Tag size="md">Design</Tag>
<Tag size="md" icon={<FontAwesomeIcon icon={faTag} />}>Development</Tag>
<Tag size="md" icon={<FontAwesomeIcon icon={faCircle} />}>Marketing</Tag>
<Tag size="md" icon={<FontAwesomeIcon icon={faStar} />}>Featured</Tag>
<Tag size="md" trailingIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}>External</Tag>
<Tag size="md" onRemove={() => {}}>Removable</Tag>
<Tag size="md" disabled>Archived</Tag>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---gap--sm)', flexWrap: 'wrap' }}>
      <Tag size="md">Design</Tag>
      <Tag size="md" icon={<FontAwesomeIcon icon={faTag} />}>Development</Tag>
      <Tag size="md" icon={<FontAwesomeIcon icon={faCircle} />}>Marketing</Tag>
      <Tag size="md" icon={<FontAwesomeIcon icon={faStar} />}>Featured</Tag>
      <Tag size="md" trailingIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}>External</Tag>
      <Tag size="md" onRemove={() => {}}>Removable</Tag>
      <Tag size="md" disabled>Archived</Tag>
    </div>
  ),
};
