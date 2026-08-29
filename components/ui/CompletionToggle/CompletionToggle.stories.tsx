import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CompletionToggle } from './CompletionToggle';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof CompletionToggle> = {
  title: 'Components/completion-toggle',
  component: CompletionToggle,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Current completion state. Seeds the in-story `useState` on initial render; click the toggle in the canvas to flip it interactively.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the toggle — non-interactive, muted appearance.',
    },
    accent: {
      control: 'radio',
      options: ['neutral', 'brand'],
      description: 'Hover affordance on the incomplete state. `brand` tints the hover with a brand-primary border + brand-secondary fill.',
    },
    onCheckedChange: {
      action: 'checked-changed',
      description: 'Called with the new boolean state when the toggle is clicked.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CompletionToggle>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven canonical instance. CompletionToggle is fully
   controlled (no internal state), so the render wraps it with a
   useState hook seeded from `args.checked`. Click the toggle in the
   canvas to flip; the `disabled` Control locks it.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Circular completion toggle for task / item state */
export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    accent: 'neutral',
  },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <CompletionToggle {...args} checked={checked} onCheckedChange={setChecked} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Mark complete' });

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    // Round-trip the state: not-complete → complete → not-complete.
    // aria-label flips to "Mark incomplete" while checked so the next
    // canvas.getByRole query has to match the new accessible name.
    await userEvent.click(toggle);
    await expect(canvas.getByRole('button', { name: 'Mark incomplete' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Mark incomplete' }));
    await expect(canvas.getByRole('button', { name: 'Mark complete' })).toHaveAttribute('aria-pressed', 'false');

    // Blur so the post-play canvas matches the canonical idle state.
    (canvas.getByRole('button', { name: 'Mark complete' }) as HTMLElement).blur();
  },
};
