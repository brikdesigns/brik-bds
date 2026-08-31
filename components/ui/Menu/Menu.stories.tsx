import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Menu } from './Menu';
import { FilterButton } from '../FilterButton';
import { Button } from '../Button';
import { ServiceTag } from '../ServiceTag/ServiceTag';

/* ─── Layout helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore — story-only inline demo style, not shipped component CSS
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

/* ─── Shared data ─────────────────────────────────────── */

const sampleItems = [
  { id: '1', label: 'Brand design', icon: <Icon icon="ph:palette" />, onClick: () => {} },
  { id: '2', label: 'Marketing design', icon: <Icon icon="ph:megaphone" />, onClick: () => {} },
  { id: '3', label: 'Product design', icon: <Icon icon="ph:package" />, onClick: () => {} },
  { id: '4', label: 'Back office design', icon: <Icon icon="ph:wrench" />, onClick: () => {} },
  { id: '5', label: 'Information design', icon: <Icon icon="ph:info" />, onClick: () => {} },
  { id: '6', label: 'Templates', icon: <Icon icon="ph:stack" />, onClick: () => {} },
];

const filterOptions = sampleItems.map((item) => ({
  id: item.id,
  label: item.label,
  icon: item.icon,
}));

// Items segmented under section headers (e.g. one group per service line).
const groupedItems = [
  {
    label: 'Design',
    items: [
      { id: 'brand', label: 'Brand design', icon: <Icon icon="ph:palette" />, onClick: () => {} },
      { id: 'product', label: 'Product design', icon: <Icon icon="ph:package" />, onClick: () => {} },
    ],
  },
  {
    label: 'Growth',
    items: [
      { id: 'marketing', label: 'Marketing design', icon: <Icon icon="ph:megaphone" />, onClick: () => {} },
      { id: 'info', label: 'Information design', icon: <Icon icon="ph:info" />, onClick: () => {} },
    ],
  },
];

// Items whose content is a line-colored ServiceTag node instead of icon+label.
const serviceTagItems = [
  { id: 'brand', label: 'Brand', content: <ServiceTag category="brand" variant="icon-text" label="Brand" />, onClick: () => {} },
  { id: 'marketing', label: 'Marketing', content: <ServiceTag category="marketing" variant="icon-text" label="Marketing" />, onClick: () => {} },
  { id: 'product', label: 'Product', content: <ServiceTag category="product" variant="icon-text" label="Product" />, onClick: () => {} },
];

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Containers/menu',
  component: Menu,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    isOpen: { control: 'boolean', description: 'Whether the menu panel is visible' },
    placement: {
      control: 'inline-radio',
      options: ['bottom', 'top'],
      description: 'Direction the panel opens relative to its trigger',
    },
    activeId: { control: 'text', description: 'ID of the item to highlight as active' },
  },
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

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — static open menu for the Controls panel
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical menu, rendered open. Items carry an icon + label; pass
 * `activeId` to highlight one, `header` for a non-interactive label row,
 * and `item.disabled` to lock a row.
 *
 * @summary Floating dropdown of selectable items
 */
export const Default: Story = {
  args: {
    items: sampleItems,
    isOpen: true,
    onClose: () => {},
    style: { position: 'relative' },
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — item-structure compositions
   ═══════════════════════════════════════════════════════════════ */

/**
 * Pass `MenuItemGroup` entries (`{ label, items }`) to segment the menu
 * under section headers. Each group renders as a `role="group"` named by
 * its label; flat items and groups can be mixed. Irreducible — the group
 * structure lives in the `items` array.
 *
 * @summary Items segmented under labelled group headers
 */
export const Grouped: Story = {
  args: {
    items: groupedItems,
    isOpen: true,
    onClose: () => {},
    style: { position: 'relative' },
  },
};

/**
 * Each item can carry a `content` ReactNode instead of a plain `label` —
 * here `ServiceTag`s, so a service picker reads as tags rather than text.
 *
 * Kept deliberately (#1490): `content` lives per-item inside the `items`
 * array, so it cannot be surfaced as a top-level Control. Without this story
 * the slot is invisible to both the Controls panel and MCP consumers.
 *
 * @summary Custom node (ServiceTag) as item content
 */
export const CustomContent: Story = {
  args: {
    items: serviceTagItems,
    isOpen: true,
    onClose: () => {},
    style: { position: 'relative' },
  },
};

/* ═══════════════════════════════════════════════════════════════
   PATTERNS — trigger + open-state compositions
   ═══════════════════════════════════════════════════════════════ */

/**
 * A Menu needs a trigger and open state. These are the canonical
 * integrations: a `FilterButton` trigger, a `Button` trigger with an
 * action menu, and an "Add" menu whose items carry a `description`.
 * Irreducible — each wires `isOpen` / `onClose` through a hook.
 *
 * @summary Trigger integrations (FilterButton / Button / Add menu)
 */
export const WithTrigger: Story = {
  args: { items: sampleItems, isOpen: true, onClose: () => {} },
  render: () => {
    function MenuTriggers() {
      const [filterValue, setFilterValue] = useState<string | undefined>();
      const [actionOpen, setActionOpen] = useState(false);
      const [addOpen, setAddOpen] = useState(false);

      return (
        <Stack>
          <div>
            <SectionLabel>FilterButton trigger</SectionLabel>
            <FilterButton
              label="Services"
              value={filterValue}
              onChange={setFilterValue}
              options={filterOptions}
            />
          </div>

          <div>
            <SectionLabel>Button trigger with actions</SectionLabel>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button variant="outline" onClick={() => setActionOpen(!actionOpen)}>
                Actions
              </Button>
              <Menu
                isOpen={actionOpen}
                onClose={() => setActionOpen(false)}
                items={[
                  { id: '1', label: 'Edit', onClick: () => setActionOpen(false) },
                  { id: '2', label: 'Duplicate', onClick: () => setActionOpen(false) },
                  { id: '3', label: 'Archive', onClick: () => setActionOpen(false) },
                  { id: '4', label: 'Delete', disabled: true },
                ]}
                style={{ top: '100%', left: 0, marginTop: 'var(--gap-md)' }}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Add menu — items with description</SectionLabel>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button variant="primary" onClick={() => setAddOpen(!addOpen)}>
                + Add Task
              </Button>
              <Menu
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                items={[
                  { id: 'checklist', label: 'Checklist', description: 'Recurring to-do lists', onClick: () => setAddOpen(false) },
                  { id: 'procedure', label: 'Procedure', description: 'Step-by-step workflows', onClick: () => setAddOpen(false) },
                  { id: 'compliance', label: 'Compliance', description: 'Regulatory & safety tasks', onClick: () => setAddOpen(false) },
                ]}
                style={{ top: '100%', left: 0, marginTop: 'var(--gap-md)', minWidth: 280 }}
              />
            </div>
          </div>
        </Stack>
      );
    }
    return <MenuTriggers />;
  },
};

/**
 * `placement="top"` opens the panel upward, anchored to the trigger's top edge
 * — no consumer inline `bottom` / `top: auto` override. Use it when the trigger
 * sits near the bottom of the viewport (e.g. a sidebar-footer switcher).
 * Irreducible — the upward flip only shows against a real trigger.
 *
 * Kept deliberately (#1490) and exempt from the axis rule (#1489): the two
 * panels are hook-driven — `placement` here is a state machine against a real
 * trigger, not a side-by-side of one prop's values.
 *
 * @summary Panel opens upward with placement="top"
 */
export const Placement: Story = {
  args: { items: sampleItems, isOpen: true, onClose: () => {} },
  render: () => {
    function PlacementDemo() {
      const [topOpen, setTopOpen] = useState(true);
      const [bottomOpen, setBottomOpen] = useState(true);
      const actions = [
        { id: '1', label: 'Edit', onClick: () => {} },
        { id: '2', label: 'Duplicate', onClick: () => {} },
        { id: '3', label: 'Archive', onClick: () => {} },
      ];
      return (
        <div style={{ display: 'flex', gap: 'var(--gap-2xl)', alignItems: 'center' }}>
          <div>
            <SectionLabel>placement=&quot;bottom&quot;</SectionLabel>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button variant="outline" onClick={() => setBottomOpen((o) => !o)}>
                Down
              </Button>
              <Menu isOpen={bottomOpen} onClose={() => {}} items={actions} style={{ left: 0 }} />
            </div>
          </div>
          <div style={{ marginTop: 200 }}>
            <SectionLabel>placement=&quot;top&quot;</SectionLabel>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button variant="outline" onClick={() => setTopOpen((o) => !o)}>
                Up
              </Button>
              <Menu
                isOpen={topOpen}
                onClose={() => {}}
                items={actions}
                placement="top"
                style={{ left: 0 }}
              />
            </div>
          </div>
        </div>
      );
    }
    return <PlacementDemo />;
  },
};

/**
 * 24 items overflow the panel's max-height and scroll inside it.
 *
 * Kept deliberately (#1490): the flag proposed folding this into a Control
 * alongside `placement`, but the overflow contract is driven by item *count*,
 * not by a prop — there is nothing to toggle. It is the only place the
 * height cap and inner scroll are visible.
 *
 * @summary Long item list scrolls inside a height-capped panel
 */
export const Scrolling: Story = {
  args: {
    items: Array.from({ length: 24 }, (_, i) => ({
      id: String(i + 1),
      label: `Menu item ${i + 1}`,
      onClick: () => {},
    })),
    isOpen: true,
    onClose: () => {},
    style: { position: 'relative' },
  },
};
