import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Menu } from './Menu';
import { Button } from '../Button';

/**
 * Menu — dropdown action list. Composes with `FilterButton` (single-select) or
 * `Button` (action menu). Supports icons, active highlight, and disabled items.
 * @summary Dropdown action list
 */
const meta = {
  title: 'Components/Navigation/menu',
  component: Menu,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 360, padding: 'var(--padding-lg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  { id: '1', label: 'Brand design', icon: <Icon icon="ph:palette" />, onClick: () => {} },
  { id: '2', label: 'Marketing design', icon: <Icon icon="ph:megaphone" />, onClick: () => {} },
  { id: '3', label: 'Product design', icon: <Icon icon="ph:package" />, onClick: () => {} },
  { id: '4', label: 'Back office design', icon: <Icon icon="ph:wrench" />, onClick: () => {} },
  { id: '5', label: 'Information design', icon: <Icon icon="ph:info" />, onClick: () => {} },
  { id: '6', label: 'Templates', icon: <Icon icon="ph:stack" />, onClick: () => {} },
];

/** Args-driven sandbox. The menu is forced open with `isOpen` so Controls
 *  can edit the items array.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    items: sampleItems,
    isOpen: true,
    onClose: () => {},
    style: { position: 'relative' },
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** With icons — leading icon for each item.
 *  @summary Menu with icons */
export const WithIcons: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    items: sampleItems,
    style: { position: 'relative' },
  },
};

/** Text-only with one disabled item — minimal action menu.
 *  @summary Text-only menu with disabled item */
export const TextOnlyWithDisabled: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    items: [
      { id: '1', label: 'Edit', onClick: () => {} },
      { id: '2', label: 'Duplicate', onClick: () => {} },
      { id: '3', label: 'Archive', onClick: () => {} },
      { id: '4', label: 'Delete', disabled: true },
    ],
    style: { position: 'relative' },
  },
};

/** With active highlight — `activeId` marks the currently-selected item.
 *  @summary Menu with active item */
export const WithActiveItem: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    items: sampleItems,
    activeId: '2',
    style: { position: 'relative' },
  },
};

/* ─── Interactive ────────────────────────────────────────────── */

/** Button-triggered action menu — `useState` controls open state. The canonical
 *  "row actions" recipe (Edit / Duplicate / Archive / Delete).
 *  @summary Button trigger with action menu */
export const ButtonTrigger: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    items: [],
  },
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Button variant="outline" onClick={() => setOpen(!open)}>
            Actions
          </Button>
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
    };
    return <Demo />;
  },
};
