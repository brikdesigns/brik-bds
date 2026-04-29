import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { CardControl } from './CardControl';
import { Badge } from '../Badge';
import { Switch } from '../Switch';
import { Button } from '../Button';

/**
 * CardControl — settings/control tile with leading badge, title + description,
 * and an action slot (typically a Switch or Button). Equivalent to
 * `<Card preset="control">` (added in v0.39.0). Both APIs are first-class.
 * @summary Settings tile (badge + title + description + action)
 */
const meta: Meta<typeof CardControl> = {
  title: 'Components/Card/card-control',
  component: CardControl,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: '100%', maxWidth: 600 }}><Story /></div>],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    actionAlign: { control: 'inline-radio', options: ['center', 'top'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  render: (args) => {
    const Demo = () => {
      const [checked, setChecked] = useState(true);
      return (
        <CardControl
          {...args}
          badge={<Badge size="xs" status="positive" icon={<Icon icon="ph:check" />} />}
          action={<Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
        />
      );
    };
    return <Demo />;
  },
  args: {
    title: 'Notifications',
    description: 'Receive email notifications for updates',
    actionAlign: 'center',
  },
};

/* ─── Action axis ────────────────────────────────────────────── */

/** With Switch action — the canonical setting toggle.
 *  @summary CardControl with Switch */
export const WithSwitch: Story = {
  args: {
    title: 'Notifications',
    description: 'Receive email notifications for updates',
    badge: <Badge size="xs" status="positive" icon={<Icon icon="ph:check" />} />,
    action: <Switch checked onChange={() => {}} />,
  },
};

/** With Button action — for settings that open a configuration panel.
 *  @summary CardControl with Button */
export const WithButton: Story = {
  args: {
    title: 'Security Settings',
    description: 'Configure two-factor authentication',
    badge: <Badge size="xs" status="info" icon={<Icon icon="ph:shield-check" />} />,
    action: <Button variant="outline" size="sm">Configure</Button>,
  },
};

/* ─── Action alignment axis ──────────────────────────────────── */

/** Center alignment (default) — vertically centered with the title row.
 *  @summary Centered action */
export const ActionCentered: Story = {
  args: {
    title: 'Push notifications',
    description: 'Get alerts for replies, mentions, and direct messages across all of your connected devices.',
    badge: <Badge size="xs" status="info" icon={<Icon icon="ph:bell" />} />,
    action: <Button variant="outline" size="sm">Configure</Button>,
    actionAlign: 'center',
  },
};

/** Top alignment — anchors the action to the upper-right corner. Use when
 *  the description is long enough that center alignment looks awkward.
 *  @summary Top-aligned action */
export const ActionTopAligned: Story = {
  args: {
    title: 'Push notifications',
    description: 'Get alerts for replies, mentions, and direct messages across all of your connected devices.',
    badge: <Badge size="xs" status="info" icon={<Icon icon="ph:bell" />} />,
    action: <Button variant="outline" size="sm">Configure</Button>,
    actionAlign: 'top',
  },
};

/* ─── Status axes ────────────────────────────────────────────── */

/** Error status — uses an error-tone Badge for failed/blocked settings.
 *  @summary Error-status CardControl */
export const ErrorStatus: Story = {
  args: {
    title: 'Connection Failed',
    description: 'Unable to reach the API server',
    badge: <Badge size="xs" status="error" icon={<Icon icon="ph:x-circle" />} />,
    action: <Button variant="primary" size="sm">Retry</Button>,
  },
};

/** Warning status — uses a warning-tone Badge for caution states.
 *  @summary Warning-status CardControl */
export const WarningStatus: Story = {
  args: {
    title: 'Storage Almost Full',
    description: 'You have used 90% of your available storage',
    badge: <Badge size="xs" status="warning" icon={<Icon icon="ph:warning" />} />,
    action: <Button variant="outline" size="sm">Upgrade</Button>,
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Minimal — no badge or description. Use for terse single-line toggles.
 *  @summary Minimal CardControl */
export const Minimal: Story = {
  args: {
    title: 'Auto-save',
    action: <Switch checked={false} onChange={() => {}} />,
  },
};

/** Multi-row toggle panel — the canonical notification-preferences layout.
 *  @summary Toggle-switch panel composition */
export const ToggleSwitchPanel: Story = {
  render: () => {
    const Demo = () => {
      const [email, setEmail] = useState(true);
      const [sms, setSms] = useState(false);
      const [product, setProduct] = useState(true);
      const [marketing, setMarketing] = useState(false);

      return (
        <Stack>
          <CardControl
            actionAlign="top"
            title="Email updates"
            description="Product announcements, billing receipts, and security alerts delivered to your inbox."
            badge={<Badge size="xs" status="positive" icon={<Icon icon="ph:envelope" />} />}
            action={<Switch checked={email} onChange={(e) => setEmail(e.target.checked)} />}
          />
          <CardControl
            actionAlign="top"
            title="SMS alerts"
            description="Critical security alerts sent to your verified phone number. Carrier rates may apply."
            badge={<Badge size="xs" status="info" icon={<Icon icon="ph:device-mobile" />} />}
            action={<Switch checked={sms} onChange={(e) => setSms(e.target.checked)} />}
          />
          <CardControl
            actionAlign="top"
            title="Product updates"
            description="New features, product news, and the occasional deep-dive on what the team is shipping."
            badge={<Badge size="xs" status="info" icon={<Icon icon="ph:sparkle" />} />}
            action={<Switch checked={product} onChange={(e) => setProduct(e.target.checked)} />}
          />
          <CardControl
            actionAlign="top"
            title="Marketing emails"
            description="Seasonal promotions and partner offers. You can unsubscribe at any time from the footer of any email."
            badge={<Badge size="xs" status="warning" icon={<Icon icon="ph:megaphone" />} />}
            action={<Switch checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />}
          />
        </Stack>
      );
    };
    return <Demo />;
  },
};
