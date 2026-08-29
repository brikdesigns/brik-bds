import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Collapsible } from './Collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'Components/collapsible',
  component: Collapsible,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  argTypes: {
    sectionLabel: { control: 'text' },
    title: { control: 'text' },
    children: {
      control: false,
      description: 'Content revealed when expanded.',
    },
    isOpen: {
      control: false,
      description: 'Controlled: whether the section is expanded. Pair with `onOpenChange` — uncontrolled callers use `defaultOpen`.',
    },
    onOpenChange: {
      control: false,
      description: 'Callback fired when open state changes.',
    },
    defaultOpen: { control: 'boolean' },
    headerActions: {
      control: false,
      description: 'Additional actions rendered in the header alongside the toggle.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

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
 * Controlled mode — clicking the header fires `onOpenChange`, the parent's
 * `useState` flows back through `isOpen`, and `aria-expanded` flips. Asserts
 * the controlled loop rather than snapshotting a frame identical to `Default`.
 *
 * @summary onOpenChange drives isOpen; aria-expanded flips
 */
export const InteractionTestControlled: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Collapsible
        sectionLabel="Section 01"
        title="Controlled by parent state"
        isOpen={open}
        onOpenChange={setOpen}
      >
        This section&apos;s open state is controlled externally by the parent&apos;s useState.
      </Collapsible>
    );
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Controlled by parent state/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    // onOpenChange → setOpen(true) → isOpen=true → aria-expanded flips: proves the controlled loop.
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};
