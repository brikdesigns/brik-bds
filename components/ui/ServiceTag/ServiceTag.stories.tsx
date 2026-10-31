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
      options: ['text', 'icon-text', 'icon', 'dot'],
      description:
        'Display mode: colored pill (`text`), pill + glyph (`icon-text`), icon-only square (`icon`), or a color-dot marker + label on a neutral pill (`dot`).',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    icon: {
      control: false,
      description:
        'Custom glyph (e.g. `<Icon icon="ph:check" />`) that replaces the resolved service icon. Decorative, sized per `size`, inherits the service text color. Rendered by `icon` and `icon-text`; ignored by `text` and `dot`.',
    },
    trailing: {
      control: false,
      description:
        'Node rendered inside the tag after the label — e.g. `MultiSelect`’s dismiss control. Inherits the service text color. Ignored by the `icon` and `dot` variants.',
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
