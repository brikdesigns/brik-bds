import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within, fn } from 'storybook/test';
import { Switch } from './Switch';

/**
 * Switch — binary on/off toggle. Use for settings, feature flags, and any
 * stateful toggle. Three sizes (`lg`/`md`/`sm`).
 * @summary Binary on/off toggle
 */
const meta: Meta<typeof Switch> = {
  title: 'Components/Control/switch',
  component: Switch,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    size: { control: 'radio', options: ['lg', 'md', 'sm'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

const Stack = ({ children, gap = 'var(--gap-lg)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/** Args-driven sandbox. Includes a click-fires-onChange interaction test.
 *  @summary Live playground with interaction test */
export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    label: 'Enable feature',
    size: 'lg',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(1));
  },
};

/** Disabled switches must not fire onChange. Asserts the contract.
 *  @summary Interaction test: disabled blocks toggle */
export const DisabledClickBlocked: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { label: 'Locked setting', size: 'lg', disabled: true, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** All three sizes — unchecked. ADR-006 axis-gallery exception.
 *  @summary All sizes (unchecked) */
export const Sizes: Story = {
  render: () => (
    <Stack>
      <Switch size="lg" label="Large (56x32)" />
      <Switch size="md" label="Medium (32x18)" />
      <Switch size="sm" label="Small (28x16)" />
    </Stack>
  ),
};

/** All three sizes — checked. Confirms the on-state appearance at every size.
 *  @summary All sizes (checked) */
export const SizesChecked: Story = {
  render: () => (
    <Stack>
      <Switch size="lg" label="Large" defaultChecked />
      <Switch size="md" label="Medium" defaultChecked />
      <Switch size="sm" label="Small" defaultChecked />
    </Stack>
  ),
};

/* ─── States ─────────────────────────────────────────────────── */

/** Default state — off, enabled.
 *  @summary Default switch */
export const Default: Story = {
  args: { label: 'Default' },
};

/** Checked — on state.
 *  @summary Checked switch */
export const Checked: Story = {
  args: { label: 'Checked', defaultChecked: true },
};

/** Disabled — non-interactive, off.
 *  @summary Disabled switch */
export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};

/** Disabled checked — non-interactive, on.
 *  @summary Disabled checked switch */
export const DisabledChecked: Story = {
  args: { label: 'Disabled checked', disabled: true, defaultChecked: true },
};
