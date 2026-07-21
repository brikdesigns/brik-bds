import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceTag } from './ServiceTag';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ServiceTag> = {
  title: 'Components/service-tag',
  component: ServiceTag,
  tags: ['surface-web'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    category: {
      control: 'select',
      options: ['brand', 'marketing', 'information', 'product', 'back-office', 'service'],
      description:
        'Service line — determines color and default label. `service` is a @deprecated alias of `back-office`.',
    },
    variant: {
      control: 'select',
      options: ['text', 'icon-text', 'icon'],
      description: 'Display mode: colored pill (`text`), pill + glyph (`icon-text`), or icon-only square (`icon`).',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceTag>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    category: 'marketing',
    variant: 'icon-text',
    size: 'md',
    label: 'Marketing Design',
    serviceName: 'Custom Standard Web Development and Design',
  },
};
