import type { Meta, StoryObj } from '@storybook/react-vite';
import { CountUp } from './CountUp';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof CountUp> = {
  title: 'Content/count-up',
  component: CountUp,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    children: {
      control: 'text',
      description:
        'The final stat, rendered verbatim. The number counts up to its value; any prefix/suffix/grouping is preserved (`4,800+` counts to 4,800 then re-appends `+`). A value with no number renders static.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--heading-3xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CountUp>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.

   CountUp is a single-appearance component (ADR-010 matrix): its only input
   is the value it counts to (a `children` text Control), and every stat shape
   — bare integer, grouped thousands, percentage, unit suffix, currency prefix
   — is the SAME component reading a different string, not a distinct visual
   state (Q3). So this file ships only `Default`; the MDX page demos the value
   shapes as a docs-local row.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    children: '4,800+',
  },
};
