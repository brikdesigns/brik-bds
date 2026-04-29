import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertBanner } from './AlertBanner';
import { Button } from '../Button';

/**
 * **Deprecated** — use `<Banner tone="warning|error|information">` instead.
 * Same shape, same Badge, same surface. This story remains only as a reference
 * for migration. See [ADR-004](../../docs/adrs/ADR-004-component-bloat-guardrails.md) §3.
 * @summary [Deprecated] use Banner with tone prop
 */
const meta: Meta<typeof AlertBanner> = {
  title: 'Deprecated/Feedback/alert-banner',
  component: AlertBanner,
  tags: ['!manifest'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: { control: 'radio', options: ['warning', 'error', 'information'] },
  },
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

/** Args-driven sandbox. Kept for migration reference only. New code should use `Banner`.
 *  @summary [Deprecated] live playground */
export const Playground: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    variant: 'information',
    action: <Button variant="primary" size="sm">Primary button</Button>,
  },
};
