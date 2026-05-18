import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { CardControl } from './CardControl';
import { Badge } from '../Badge';
import { Switch } from '../Switch';

/**
 * @deprecated Use `Card preset="control"` instead. See the
 * [Card](?path=/docs/containers-card--docs) page for the canonical reference.
 * CardControl is kept during the migration window (see #657).
 */
const meta: Meta<typeof CardControl> = {
  title: 'Deprecated/card-control',
  component: CardControl,
  tags: ['surface-shared', '!manifest'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    actionAlign: { control: 'inline-radio', options: ['center', 'top'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * @deprecated Use `Card preset="control"` — see Card stories for the canonical reference.
 * @summary Deprecated: use Card preset="control"
 */
export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);
    return (
      <CardControl
        {...args}
        badge={<Badge size="xs" status="positive" icon={<Icon icon="ph:check" />} />}
        action={<Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
      />
    );
  },
  args: {
    title: 'Notifications',
    description: 'Receive email notifications for updates',
    actionAlign: 'center',
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};
