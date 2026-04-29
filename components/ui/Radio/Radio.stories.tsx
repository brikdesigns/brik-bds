import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';

/**
 * Radio — single radio button with label. Group via shared `name`. For
 * full mutually-exclusive groups, repeat `Radio` with the same `name`.
 * @summary Single radio button (group via shared name)
 */
const meta = {
  title: 'Components/Form/radio',
  component: Radio,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

const Stack = ({ children, gap = 'var(--gap-md)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Option 1', name: 'playground', value: 'option1' },
};

/* ─── States ─────────────────────────────────────────────────── */

/** Default unchecked.
 *  @summary Unchecked radio */
export const Unchecked: Story = {
  args: { name: 'states', value: 'default', label: 'Default' },
};

/** Checked.
 *  @summary Checked radio */
export const Checked: Story = {
  args: { name: 'states-checked', value: 'checked', label: 'Checked', defaultChecked: true },
};

/** Disabled, unchecked.
 *  @summary Disabled radio */
export const Disabled: Story = {
  args: { name: 'states-disabled', value: 'disabled', label: 'Disabled', disabled: true },
};

/** Disabled, checked.
 *  @summary Disabled checked radio */
export const DisabledChecked: Story = {
  args: { name: 'states-disabled-checked', value: 'disabled-checked', label: 'Disabled checked', disabled: true, checked: true },
};

/* ─── Group recipes ──────────────────────────────────────────── */

/** Vertical group — multiple Radios with the same `name`. The canonical
 *  multi-option shape.
 *  @summary Vertical radio group */
export const VerticalGroup: Story = {
  args: { name: 'vertical', value: 'a', label: 'Option' },
  render: () => (
    <Stack>
      <Radio name="vertical-group" value="a" label="Option A" defaultChecked />
      <Radio name="vertical-group" value="b" label="Option B" />
      <Radio name="vertical-group" value="c" label="Option C" />
    </Stack>
  ),
};

/** Horizontal group — same group, side-by-side. Use for compact yes/no/maybe.
 *  @summary Horizontal radio group */
export const HorizontalGroup: Story = {
  args: { name: 'horizontal', value: 'a', label: 'Option' },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-lg)', alignItems: 'center' }}>
      <Radio name="horizontal-group" value="a" label="Option A" defaultChecked />
      <Radio name="horizontal-group" value="b" label="Option B" />
      <Radio name="horizontal-group" value="c" label="Option C" />
    </div>
  ),
};

/** Interactive — `useState` drives the selected value. Render is required
 *  for the controlled-state demo.
 *  @summary Interactive controlled radio group */
export const Interactive: Story = {
  args: { name: 'interactive', value: 'pro', label: 'Plan' },
  render: () => {
    const Demo = () => {
      const [plan, setPlan] = useState('pro');
      return (
        <Stack>
          {[
            { value: 'basic', label: 'Basic Plan - $9/month' },
            { value: 'pro', label: 'Pro Plan - $29/month' },
            { value: 'enterprise', label: 'Enterprise - Custom pricing' },
          ].map((opt) => (
            <Radio
              key={opt.value}
              name="plan"
              value={opt.value}
              label={opt.label}
              checked={plan === opt.value}
              onChange={(e) => setPlan(e.target.value)}
            />
          ))}
        </Stack>
      );
    };
    return <Demo />;
  },
};
