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
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
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
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

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
