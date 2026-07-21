import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/progress-bar',
  component: ProgressBar,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value from 0 to 100. Clamped to range.',
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers (`aria-label`).',
    },
    fillColor: {
      control: 'color',
      description: 'Override fill bar color. Defaults to brand-primary.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox, all variation via Controls
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    value: 35,
    label: 'Progress',
  },
};
