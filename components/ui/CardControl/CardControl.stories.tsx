import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { CardControl } from './CardControl';
import { Badge } from '../Badge';
import { Switch } from '../Switch';
import { Button } from '../Button';

const meta: Meta<typeof CardControl> = {
  title: 'Displays/Card/card-control',
  component: CardControl,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    actionAlign: { control: 'inline-radio', options: ['center', 'top'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%', maxWidth: 600 }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
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
};

/* ─── Action alignment ───────────────────────────────────────── */

/** @summary Action alignment */
export const ActionAlignment: Story = {
  render: () => (
    <Stack>
      <SectionLabel>actionAlign = "center" (default)</SectionLabel>
      <CardControl
        title="Push notifications"
        description="Get alerts for replies, mentions, and direct messages across all of your connected devices."
        badge={<Badge size="xs" status="info" icon={<Icon icon="ph:bell" />} />}
        action={<Button variant="outline" size="sm">Configure</Button>}
      />

      <SectionLabel>actionAlign = "top" — CTA anchored to upper-right</SectionLabel>
      <CardControl
        actionAlign="top"
        title="Push notifications"
        description="Get alerts for replies, mentions, and direct messages across all of your connected devices."
        badge={<Badge size="xs" status="info" icon={<Icon icon="ph:bell" />} />}
        action={<Button variant="outline" size="sm">Configure</Button>}
      />

      <SectionLabel>actionAlign = "top" — with switch toggle</SectionLabel>
      <CardControl
        actionAlign="top"
        title="Two-factor authentication"
        description="Require a verification code from your authenticator app in addition to your password on every sign-in."
        badge={<Badge size="xs" status="positive" icon={<Icon icon="ph:shield-check" />} />}
        action={<Switch checked onChange={() => {}} />}
      />
    </Stack>
  ),
};

/* ─── Variants ───────────────────────────────────────────────── */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>With switch action</SectionLabel>
      <CardControl
        title="Notifications"
        description="Receive email notifications for updates"
        badge={<Badge size="xs" status="positive" icon={<Icon icon="ph:check" />} />}
        action={<Switch checked onChange={() => {}} />}
      />

      <SectionLabel>With button action</SectionLabel>
      <CardControl
        title="Security Settings"
        description="Configure two-factor authentication"
        badge={<Badge size="xs" status="info" icon={<Icon icon="ph:shield-check" />} />}
        action={<Button variant="outline" size="sm">Configure</Button>}
      />

      <SectionLabel>Error status</SectionLabel>
      <CardControl
        title="Connection Failed"
        description="Unable to reach the API server"
        badge={<Badge size="xs" status="error" icon={<Icon icon="ph:x-circle" />} />}
        action={<Button variant="primary" size="sm">Retry</Button>}
      />

      <SectionLabel>Warning status</SectionLabel>
      <CardControl
        title="Storage Almost Full"
        description="You have used 90% of your available storage"
        badge={<Badge size="xs" status="warning" icon={<Icon icon="ph:warning" />} />}
        action={<Button variant="outline" size="sm">Upgrade</Button>}
      />

      <SectionLabel>Minimal (no badge or description)</SectionLabel>
      <CardControl
        title="Auto-save"
        action={<Switch checked={false} onChange={() => {}} />}
      />
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
      <Stack>
        <SectionLabel>Settings panel</SectionLabel>
        <CardControl
          title="Notifications"
          description="Receive email notifications for updates"
          badge={<Badge size="xs" status="positive" icon={<Icon icon="ph:bell" />} />}
          action={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
        />
        <CardControl
          title="Dark Mode"
          description="Switch to a darker color theme"
          badge={<Badge size="xs" status="info" icon={<Icon icon="ph:gear" />} />}
          action={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
        />
        <CardControl
          title="Security"
          description="Configure two-factor authentication"
          badge={<Badge size="xs" status="info" icon={<Icon icon="ph:shield-check" />} />}
          action={<Button variant="outline" size="sm">Configure</Button>}
        />
      </Stack>
    );
  },
};

/* ─── Toggle switch panel ────────────────────────────────────── */

/** @summary Toggle switch panel */
export const ToggleSwitchPanel: Story = {
  render: () => {
    const [email, setEmail] = useState(true);
    const [sms, setSms] = useState(false);
    const [product, setProduct] = useState(true);
    const [marketing, setMarketing] = useState(false);

    return (
      <Stack>
        <SectionLabel>Notification preferences — multi-row toggle panel</SectionLabel>
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
  },
};
