import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faBullhorn,
  faBox,
  faWrench,
  faCircleInfo,
  faLayerGroup,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import { Menu } from './Menu';
import { FilterButton } from '../FilterButton';

const sampleItems = [
  { id: '1', label: 'Brand design', icon: <FontAwesomeIcon icon={faPalette} />, onClick: () => {} },
  { id: '2', label: 'Marketing design', icon: <FontAwesomeIcon icon={faBullhorn} />, onClick: () => {} },
  { id: '3', label: 'Product design', icon: <FontAwesomeIcon icon={faBox} />, onClick: () => {} },
  { id: '4', label: 'Back office design', icon: <FontAwesomeIcon icon={faWrench} />, onClick: () => {} },
  { id: '5', label: 'Information design', icon: <FontAwesomeIcon icon={faCircleInfo} />, onClick: () => {} },
  { id: '6', label: 'Templates', icon: <FontAwesomeIcon icon={faLayerGroup} />, onClick: () => {} },
];

const filterOptions = sampleItems.map((item) => ({
  id: item.id,
  label: item.label,
  icon: item.icon,
}));

const meta = {
  title: 'Navigation/Menu/menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the menu is visible',
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Menu triggered by a FilterButton — the chevron signals dropdown interactivity.
 */
export const Default: Story = {
  render: () => (
    <FilterButton
      label="Services"
      options={filterOptions}
    />
  ),
  args: {
    items: sampleItems,
    isOpen: false,
    onClose: () => {},
  },
};

/**
 * Menu with a pre-selected value — FilterButton shows active state.
 */
export const WithActiveItem: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('2');

    return (
      <FilterButton
        label="Services"
        value={value}
        onChange={setValue}
        options={filterOptions}
      />
    );
  },
  args: {
    items: sampleItems,
    isOpen: false,
    onClose: () => {},
  },
};

/**
 * Menu without icons — plain text options with a chevron trigger.
 */
export const TextOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const triggerStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--gap-md)',
      padding: 'var(--padding-md) var(--padding-lg)',
      backgroundColor: 'var(--surface-secondary)',
      borderRadius: 'var(--border-radius-md)',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-family-label)',
      fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
      fontSize: 'var(--label-md)',
      lineHeight: 'var(--font-line-height-tight)',
      color: 'var(--text-primary)',
    };

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={triggerStyles}
        >
          <span>Actions</span>
          <FontAwesomeIcon icon={faCaretDown} style={{ fontSize: 'var(--icon-sm)' }} />
        </button>
        <Menu
          isOpen={open}
          onClose={() => setOpen(false)}
          items={[
            { id: '1', label: 'Edit', onClick: () => setOpen(false) },
            { id: '2', label: 'Duplicate', onClick: () => setOpen(false) },
            { id: '3', label: 'Archive', onClick: () => setOpen(false) },
            { id: '4', label: 'Delete', disabled: true },
          ]}
          style={{ top: '100%', left: 0, marginTop: 'var(--gap-md)' }}
        />
      </div>
    );
  },
  args: {
    items: [],
    isOpen: false,
    onClose: () => {},
  },
};

/**
 * Static open menu for documentation — shows the panel layout.
 */
export const StaticOpen: Story = {
  render: () => (
    <div style={{ position: 'relative', height: '300px' }}>
      <Menu
        isOpen
        onClose={() => {}}
        items={sampleItems}
        style={{ position: 'relative' }}
      />
    </div>
  ),
  args: {
    items: sampleItems,
    isOpen: true,
    onClose: () => {},
  },
};
