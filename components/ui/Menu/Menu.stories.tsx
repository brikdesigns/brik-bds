import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Menu } from './Menu';
import { FilterButton } from '../FilterButton';
import { Button } from '../Button';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
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

/* ─── Shared Data ─────────────────────────────────────── */

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

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Navigation/Menu/menu',
  component: Menu,
  tags: ['surface-shared'],
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

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Static open menu for Controls panel
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    items: sampleItems,
    isOpen: true,
    onClose: () => {},
    style: { position: 'relative' },
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — With icons, text-only, active item, disabled
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  args: { items: sampleItems, isOpen: true, onClose: () => {} },
  render: () => (
    <Stack>
      <div>
        <SectionLabel>With icons</SectionLabel>
        <Menu
          isOpen
          onClose={() => {}}
          items={sampleItems}
          style={{ position: 'relative' }}
        />
      </div>

      <div>
        <SectionLabel>Text-only with disabled item</SectionLabel>
        <Menu
          isOpen
          onClose={() => {}}
          items={[
            { id: '1', label: 'Edit', onClick: () => {} },
            { id: '2', label: 'Duplicate', onClick: () => {} },
            { id: '3', label: 'Archive', onClick: () => {} },
            { id: '4', label: 'Delete', disabled: true },
          ]}
          style={{ position: 'relative' }}
        />
      </div>

      <div>
        <SectionLabel>With active item</SectionLabel>
        <Menu
          isOpen
          onClose={() => {}}
          items={sampleItems}
          activeId="2"
          style={{ position: 'relative' }}
        />
      </div>

      <div>
        <SectionLabel>With header (string)</SectionLabel>
        <Menu
          isOpen
          onClose={() => {}}
          header="Northstar Dental"
          items={[
            { id: '1', label: 'Account settings', icon: <Icon icon="ph:gear" />, onClick: () => {} },
            { id: '2', label: 'Switch practice', icon: <Icon icon="ph:swap" />, onClick: () => {} },
            { id: '3', label: 'Sign out', icon: <Icon icon="ph:sign-out" />, onClick: () => {} },
          ]}
          style={{ position: 'relative' }}
        />
      </div>

      <div>
        <SectionLabel>With header (custom node)</SectionLabel>
        <Menu
          isOpen
          onClose={() => {}}
          header={
            <>
              <span style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'var(--body-md)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 0 }}>
                Dr. Sara Patel
              </span>
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0 }}>
                sara@northstardental.com
              </span>
            </>
          }
          items={[
            { id: '1', label: 'Profile', icon: <Icon icon="ph:user" />, onClick: () => {} },
            { id: '2', label: 'Sign out', icon: <Icon icon="ph:sign-out" />, onClick: () => {} },
          ]}
          style={{ position: 'relative' }}
        />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — FilterButton trigger + Button trigger
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  args: { items: sampleItems, isOpen: true, onClose: () => {} },
  render: () => {
    function MenuPatterns() {
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
    return <MenuPatterns />;
  },
};
