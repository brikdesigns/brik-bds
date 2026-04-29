import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter';

/**
 * Meter — single-value horizontal gauge with status colors. Use for compliance
 * scores, capacity readouts, or any 0-to-max indicator. Indicator-family —
 * non-interactive.
 * @summary Single-value gauge with status colors
 */
const meta: Meta<typeof Meter> = {
  title: 'Components/Indicator/meter',
  component: Meter,
  parameters: { layout: 'centered' },
  argTypes: {
    status: { control: 'select', options: ['positive', 'warning', 'error', 'neutral'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'number', min: 0, max: 100 } },
    max: { control: { type: 'number', min: 1, max: 100 } },
    showValue: { control: 'boolean' },
    labelPosition: { control: 'select', options: ['above', 'below'] },
  },
  decorators: [(Story) => <div style={{ width: 300 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Meter>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { value: 6, max: 7, status: 'positive', label: 'Pass' },
};

/* ─── Status variants ────────────────────────────────────────── */

/** Positive — green fill. Compliance pass, healthy capacity.
 *  @summary Positive status (green) */
export const Pass: Story = {
  args: { value: 6, max: 7, status: 'positive', label: 'Pass' },
};

/** Warning — yellow fill. Borderline state, attention recommended.
 *  @summary Warning status (yellow) */
export const Fair: Story = {
  args: { value: 4, max: 10, status: 'warning', label: 'Fair' },
};

/** Error — red fill. Compliance fail, critical capacity.
 *  @summary Error status (red) */
export const Fail: Story = {
  args: { value: 1, max: 5, status: 'error', label: 'Fail' },
};

/** Neutral — muted fill. Pending or unscored state.
 *  @summary Neutral status (no result yet) */
export const Neutral: Story = {
  args: { value: 0, max: 7, status: 'neutral', label: 'Pending' },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** All three sizes side-by-side. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Meter value={6} max={7} status="positive" label="sm" size="sm" />
      <Meter value={6} max={7} status="positive" label="md" size="md" />
      <Meter value={6} max={7} status="positive" label="lg" size="lg" />
    </div>
  ),
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Hide the formatted value. Use when the surrounding context provides the number.
 *  @summary Bar without value display */
export const NoValue: Story = {
  args: { value: 3, max: 10, status: 'warning', label: 'Fair', showValue: false },
};

/** Custom value formatter — pass any `(value, max) => string`. Useful for
 *  percentages, ratios, or unit suffixes.
 *  @summary Custom value formatter */
export const CustomFormatter: Story = {
  args: {
    value: 85,
    max: 100,
    status: 'positive',
    label: 'Pass',
    valueFormatter: (value: number, max: number) => `${Math.round((value / max) * 100)}%`,
  },
};

/* ─── Label position axis ────────────────────────────────────── */

/** Side-by-side comparison of `labelPosition` values. ADR-006 axis-gallery exception.
 *  @summary Label-position comparison */
export const LabelPositions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, width: 600 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>labelPosition=&quot;above&quot;</p>
        <Meter value={6} max={7} status="positive" label="Pass" labelPosition="above" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>labelPosition=&quot;below&quot;</p>
        <Meter value={6} max={7} status="positive" label="Pass" labelPosition="below" />
      </div>
    </div>
  ),
};
