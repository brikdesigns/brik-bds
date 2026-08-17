import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PeriodNav } from './PeriodNav';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof PeriodNav> = {
  title: 'Components/period-nav',
  component: PeriodNav,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 480, minHeight: 120 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Current-period label rendered between the controls (e.g. "August 2025").',
    },
    prevLabel: {
      control: 'text',
      description: 'Visible text + accessible name for the Previous control. Default "Previous".',
    },
    nextLabel: {
      control: 'text',
      description: 'Visible text + accessible name for the Next control. Default "Next".',
    },
    prevDisabled: {
      control: 'boolean',
      description:
        'Force the Previous control disabled. Defaults to disabled when neither `onPrev` nor `hrefPrev` is set (the first period).',
    },
    nextDisabled: {
      control: 'boolean',
      description:
        'Force the Next control disabled. Defaults to disabled when neither `onNext` nor `hrefNext` is set (the last period).',
    },
    onPrev: { action: 'prev', description: 'Called when Previous is activated (button mode).' },
    onNext: { action: 'next', description: 'Called when Next is activated (button mode).' },
    hrefPrev: { control: false, description: 'href for Previous (link mode — renders an anchor).' },
    hrefNext: { control: false, description: 'href for Next (link mode — renders an anchor).' },
  },
};

export default meta;
type Story = StoryObj<typeof PeriodNav>;

/* ═══════════════════════════════════════════════════════════════
   BOTH ENABLED — a mid-timeline period with a previous AND a next.
   Both controls are live secondary buttons.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Mid-timeline period — both controls live */
export const Default: Story = {
  args: {
    'aria-label': 'Browse months',
    label: 'August 2025',
    onPrev: fn(),
    onNext: fn(),
  },
};

/* ═══════════════════════════════════════════════════════════════
   FIRST PERIOD — the earliest period: no earlier one to step back
   to, so Previous is disabled and Next is live.
   ═══════════════════════════════════════════════════════════════ */

/** @summary First period — Previous disabled */
export const FirstPeriod: Story = {
  args: {
    'aria-label': 'Browse months',
    label: 'January 2025',
    prevDisabled: true,
    onNext: fn(),
  },
};

/* ═══════════════════════════════════════════════════════════════
   LAST PERIOD — the latest period: no later one to step forward to,
   so Next is disabled and Previous is live.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Last period — Next disabled */
export const LastPeriod: Story = {
  args: {
    'aria-label': 'Browse months',
    label: 'December 2025',
    onPrev: fn(),
    nextDisabled: true,
  },
};
