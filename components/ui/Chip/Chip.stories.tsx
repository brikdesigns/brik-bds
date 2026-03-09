import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTag } from '@fortawesome/free-solid-svg-icons';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Indicator/chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    appearance: {
      control: 'select',
      options: ['dark', 'light'],
    },
    showDropdown: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Neutral',
    icon: <FontAwesomeIcon icon={faFilter} />,
    showDropdown: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-lg)', alignItems: 'center' }}>
      <Chip label="Neutral" variant="secondary" appearance="dark" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
      <Chip label="Neutral" variant="secondary" appearance="light" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
      <Chip label="Brand" variant="primary" appearance="dark" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
      <Chip label="Brand" variant="primary" appearance="light" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-lg)', alignItems: 'center' }}>
      <Chip label="Small" size="sm" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
      <Chip label="Medium" size="md" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
      <Chip label="Large" size="lg" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
    </div>
  ),
};

export const Removable: Story = {
  args: {
    label: 'Removable',
    icon: <FontAwesomeIcon icon={faTag} />,
    onRemove: () => alert('Removed!'),
  },
};

export const PrimaryLight: Story = {
  args: {
    label: 'Brand',
    variant: 'primary',
    appearance: 'light',
    icon: <FontAwesomeIcon icon={faFilter} />,
    showDropdown: true,
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    icon: <FontAwesomeIcon icon={faFilter} />,
    showDropdown: true,
  },
};
