import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { CardControl } from './CardControl';
import { Badge } from '../Badge';
import { Switch } from '../Switch';
import { Button } from '../Button';

const meta: Meta<typeof CardControl> = {
  title: 'Containers/card-control',
  component: CardControl,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    title: {
      control: 'text',
      description: 'Control label shown as the primary text.',
    },
    description: {
      control: 'text',
      description: 'Optional supporting copy displayed below the title.',
    },
    actionAlign: {
      control: 'inline-radio',
      options: ['center', 'top'],
      description: '`center` (default) aligns the action to the vertical midline; `top` anchors it to the upper-right corner — use for long descriptions.',
    },
    badge: {
      control: false,
      description: 'Optional leading element (typically a `<Badge>` with a status icon) rendered before the text block.',
    },
    action: {
      control: false,
      description: 'Trailing action element — typically a `<Switch>`, `<Button>`, or link.',
    },
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

/** @summary Interactive sandbox — Switch action wired via local state (Q4) */
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

/**
 * `actionAlign="center"` vs `actionAlign="top"` — use `top` when the
 * description wraps to multiple lines so the CTA anchors to the upper-right
 * corner rather than drifting to the vertical center.
 *
 * @summary actionAlign — center vs top alignment
 */
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

/* ─── Patterns (Q4 — stateful compositions) ─────────────────── */

/**
 * Three settings rows with mixed action types (Switch + Button) wired
 * via local state. The stateful Switch action requires hook-driven state
 * that args can't express.
 *
 * @summary Settings panel — mixed actions, live state
 */
export const SettingsPanel: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
      <Stack>
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

/**
 * Multi-row notification panel using `actionAlign="top"` switches — a common
 * settings-page layout where each row is independently toggled.
 *
 * @summary Notification preferences — multi-row toggle panel
 */
export const ToggleSwitchPanel: Story = {
  render: () => {
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
  },
};
