import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollapsibleCard } from './CollapsibleCard';

const meta: Meta<typeof CollapsibleCard> = {
  title: 'Containers/collapsible-card',
  component: CollapsibleCard,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  argTypes: {
    sectionLabel: { control: 'text' },
    title: { control: 'text' },
    defaultOpen: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CollapsibleCard>;

/**
 * Args-driven sandbox. Toggle `defaultOpen` and `sectionLabel` via Controls.
 *
 * @summary Expandable content section with header toggle
 */
export const Default: Story = {
  args: {
    sectionLabel: 'Section 01',
    title: 'Overview and Goals',
    defaultOpen: false,
    children: 'This is the collapsible content area. It can contain any content including text, lists, tables, or nested components.',
  },
};

/**
 * Controlled mode — `isOpen` + `onOpenChange` wired via `useState`. Use when
 * parent state must drive the open/closed transition (e.g. "expand all" /
 * "collapse all" buttons, wizard steps, or accordion groups).
 *
 * @summary Controlled open state via isOpen + onOpenChange
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
        <div style={{ display: 'flex', gap: 'var(--gap-sm)' }}>
          <button type="button" onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>Expand</button>
          <button type="button" onClick={() => setOpen(false)} style={{ cursor: 'pointer' }}>Collapse</button>
        </div>
        <CollapsibleCard
          sectionLabel="Section 01"
          title="Controlled by parent state"
          isOpen={open}
          onOpenChange={setOpen}
        >
          This card's open state is controlled externally. The parent's Expand / Collapse
          buttons drive the transition — the card's own toggle fires onOpenChange but does
          not manage state internally.
        </CollapsibleCard>
      </div>
    );
  },
};
