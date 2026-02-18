import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faBullhorn, faBox, faWrench, faCircleInfo, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { Menu } from './Menu';
import { Button } from '../Button';

const sampleItems = [
  { id: '1', label: 'Brand design', icon: <FontAwesomeIcon icon={faPalette} />, onClick: () => {} },
  { id: '2', label: 'Marketing design', icon: <FontAwesomeIcon icon={faBullhorn} />, onClick: () => {} },
  { id: '3', label: 'Product design', icon: <FontAwesomeIcon icon={faBox} />, onClick: () => {} },
  { id: '4', label: 'Service design', icon: <FontAwesomeIcon icon={faWrench} />, onClick: () => {} },
  { id: '5', label: 'Information design', icon: <FontAwesomeIcon icon={faCircleInfo} />, onClick: () => {} },
  { id: '6', label: 'Templates', icon: <FontAwesomeIcon icon={faLayerGroup} />, onClick: () => {} },
];

const meta = {
  title: 'Components/menu',
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
 * Menu triggered by a button click
 */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [open, setOpen] = useState(false);

<div style={{ position: 'relative' }}>
  <Button onClick={() => setOpen(!open)}>Services</Button>
  <Menu
    isOpen={open}
    onClose={() => setOpen(false)}
    items={items}
  />
</div>`,
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button onClick={() => setOpen(!open)}>Services</Button>
        <Menu
          isOpen={open}
          onClose={() => setOpen(false)}
          items={sampleItems}
          style={{ top: '100%', left: 0, marginTop: 'var(--_space---gap--md)' }}
        />
      </div>
    );
  },
  args: {
    items: sampleItems,
    isOpen: false,
    onClose: () => {},
  },
};

/**
 * Menu with an active/selected item
 */
export const WithActiveItem: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Menu
  isOpen={true}
  onClose={handleClose}
  items={items}
  activeId="2"
/>`,
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState('2');

    const items = sampleItems.map((item) => ({
      ...item,
      onClick: () => {
        setActiveId(item.id);
        setOpen(false);
      },
    }));

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button onClick={() => setOpen(!open)}>
          {sampleItems.find((i) => i.id === activeId)?.label ?? 'Select'}
        </Button>
        <Menu
          isOpen={open}
          onClose={() => setOpen(false)}
          items={items}
          activeId={activeId}
          style={{ top: '100%', left: 0, marginTop: 'var(--_space---gap--md)' }}
        />
      </div>
    );
  },
  args: {
    items: sampleItems,
    isOpen: false,
    onClose: () => {},
  },
};

/**
 * Menu without icons
 */
export const TextOnly: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Menu
  isOpen={open}
  onClose={() => setOpen(false)}
  items={[
    { id: '1', label: 'Edit' },
    { id: '2', label: 'Duplicate' },
    { id: '3', label: 'Delete', disabled: true },
  ]}
/>`,
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button variant="outline" onClick={() => setOpen(!open)}>Actions</Button>
        <Menu
          isOpen={open}
          onClose={() => setOpen(false)}
          items={[
            { id: '1', label: 'Edit', onClick: () => setOpen(false) },
            { id: '2', label: 'Duplicate', onClick: () => setOpen(false) },
            { id: '3', label: 'Archive', onClick: () => setOpen(false) },
            { id: '4', label: 'Delete', disabled: true },
          ]}
          style={{ top: '100%', left: 0, marginTop: 'var(--_space---gap--md)' }}
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
 * Static open menu for documentation
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
