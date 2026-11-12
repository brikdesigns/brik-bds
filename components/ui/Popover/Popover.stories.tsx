import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { Popover } from './Popover';
import { Button } from '../Button';

/* ─── Shared Content ──────────────────────────────────── */

const sampleContent = (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--bds-gap-sm)',
    fontFamily: 'var(--bds-font-family-body)',
    fontSize: 'var(--bds-body-md)',
    color: 'var(--bds-text-primary)',
  }}>
    <strong style={{ fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number }}>
      Popover title
    </strong>
    <p style={{ margin: 0, color: 'var(--bds-text-secondary)' }}>
      This is some helpful content inside the popover panel.
    </p>
  </div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Popover> = {
  title: 'Components/popover',
  component: Popover,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '120px' /* bds-lint-ignore — space for popover overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: { control: false, description: 'Popover panel content.' },
    panelLabel: { control: 'text', description: 'Accessible name for the dialog panel.' },
    children: { control: false, description: 'The trigger element.' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
    isOpen: {
      control: false,
      description: 'Controlled open state. Leave unset for uncontrolled mode (Popover manages its own state).',
    },
    onOpenChange: {
      control: false,
      description: 'Controlled change handler — fires with the next open state on trigger interaction.',
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Popover manages its own open
   state internally when `isOpen` is left unset, so args alone
   drive the trigger interaction — no render/hook wiring needed.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Click the trigger to reveal the panel. Switch `placement` and `trigger`
 * via Controls.
 *
 * @summary Floating content panel anchored to a trigger
 */
export const Default: Story = {
  args: {
    content: sampleContent,
    panelLabel: 'Popover details',
    placement: 'bottom',
    trigger: 'click',
    children: <Button variant="outline">Click me</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   PLACEMENTS — narrow axis-only-gallery exception (ADR-006): side
   by side is the entire point, and the Controls panel can only
   show one placement at a time. Mirrors the sibling Tooltip file.
   ═══════════════════════════════════════════════════════════════ */

/* `placement` is a Control on Default — the four-placement comparison lives
   in Popover.mdx as a docs-local demo (#1489). */

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — trigger ARIA, panel name, focus, controlled
   (#3070). The panel renders in a Radix portal, so it is queried
   from `screen`, not the canvas.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Click trigger ARIA, panel name, focus-in, Escape return */
export const InteractionTestClickAria: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: Default.args,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Click me' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The panel is named through the `panelLabel` prop.
    const panel = await screen.findByRole('dialog', { name: 'Popover details' });
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true));

    // Escape closes and returns focus to the trigger.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/** @summary Hover opens the panel and leaves focus on the trigger */
export const InteractionTestHoverKeepsFocus: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { ...Default.args, trigger: 'hover' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Click me' });
    trigger.focus();
    await userEvent.hover(trigger);
    await screen.findByRole('dialog', { name: 'Popover details' });
    await expect(trigger).toHaveFocus();
  },
};

/** @summary Outside click closes a controlled popover */
export const InteractionTestOutsideClickCloses: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Popover
          isOpen={open}
          onOpenChange={setOpen}
          content={sampleContent}
          panelLabel="Popover details"
        >
          <Button variant="outline">Controlled</Button>
        </Popover>
        <button type="button" onClick={() => setOpen(true)}>
          Open from outside
        </button>
        <p data-testid="open-state">{String(open)}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open from outside' }));
    await expect(canvas.getByTestId('open-state')).toHaveTextContent('true');
    await screen.findByRole('dialog', { name: 'Popover details' });

    // Outside click closes it and reports through onOpenChange.
    await userEvent.click(canvas.getByTestId('open-state'));
    await waitFor(() => expect(canvas.getByTestId('open-state')).toHaveTextContent('false'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};
