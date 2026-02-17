import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleXmark, faTriangleExclamation, faBell, faShieldHalved, faGear } from '@fortawesome/free-solid-svg-icons';
import { CardControl } from './CardControl';
import { Badge } from '../Badge';
import { Switch } from '../Switch';
import { Button } from '../Button';

const meta = {
  title: 'Components/card-control',
  component: CardControl,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text',
    },
    description: {
      control: 'text',
      description: 'Description text',
    },
  },
} satisfies Meta<typeof CardControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic control card with a toggle switch
 */
export const WithSwitch: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CardControl
  title="Notifications"
  description="Receive email notifications for updates"
  badge={<Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faCheck} />} />}
  action={<Switch checked={enabled} onChange={handleChange} />}
/>`,
      },
    },
  },
  render: (args) => {
    const [checked, setChecked] = useState(true);

    return (
      <CardControl
        {...args}
        badge={
          <Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faCheck} />} />
        }
        action={
          <Switch
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        }
      />
    );
  },
  args: {
    title: 'Notifications',
    description: 'Receive email notifications for updates',
  },
};

/**
 * Control card with a button action
 */
export const WithButton: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CardControl
  title="Security Settings"
  description="Configure two-factor authentication"
  badge={<Badge size="xs" status="info" icon={<FontAwesomeIcon icon={faShieldHalved} />} />}
  action={<Button variant="outline" size="sm">Configure</Button>}
/>`,
      },
    },
  },
  render: (args) => (
    <CardControl
      {...args}
      badge={
        <Badge size="xs" status="info" icon={<FontAwesomeIcon icon={faShieldHalved} />} />
      }
      action={<Button variant="outline" size="sm">Configure</Button>}
    />
  ),
  args: {
    title: 'Security Settings',
    description: 'Configure two-factor authentication',
  },
};

/**
 * Control card with error status badge
 */
export const ErrorStatus: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CardControl
  title="Connection Failed"
  description="Unable to reach the API server"
  badge={<Badge size="xs" status="error" icon={<FontAwesomeIcon icon={faCircleXmark} />} />}
  action={<Button variant="primary" size="sm">Retry</Button>}
/>`,
      },
    },
  },
  render: (args) => (
    <CardControl
      {...args}
      badge={
        <Badge size="xs" status="error" icon={<FontAwesomeIcon icon={faCircleXmark} />} />
      }
      action={<Button variant="primary" size="sm">Retry</Button>}
    />
  ),
  args: {
    title: 'Connection Failed',
    description: 'Unable to reach the API server',
  },
};

/**
 * Control card with warning badge
 */
export const WarningStatus: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CardControl
  title="Storage Almost Full"
  description="You have used 90% of your available storage"
  badge={<Badge size="xs" status="warning" icon={<FontAwesomeIcon icon={faTriangleExclamation} />} />}
  action={<Button variant="outline" size="sm">Upgrade</Button>}
/>`,
      },
    },
  },
  render: (args) => (
    <CardControl
      {...args}
      badge={
        <Badge size="xs" status="warning" icon={<FontAwesomeIcon icon={faTriangleExclamation} />} />
      }
      action={<Button variant="outline" size="sm">Upgrade</Button>}
    />
  ),
  args: {
    title: 'Storage Almost Full',
    description: 'You have used 90% of your available storage',
  },
};

/**
 * Multiple control cards in a settings-like layout
 */
export const SettingsGroup: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CardControl title="Notifications" description="..." badge={...} action={<Switch />} />
<CardControl title="Dark Mode" description="..." badge={...} action={<Switch />} />
<CardControl title="Security" description="..." badge={...} action={<Button>Configure</Button>} />`,
      },
    },
  },
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---lg)', maxWidth: '600px' }}>
        <CardControl
          title="Notifications"
          description="Receive email notifications for updates"
          badge={
            <Badge size="xs" status="positive" icon={<FontAwesomeIcon icon={faBell} />} />
          }
          action={
            <Switch
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          }
        />
        <CardControl
          title="Dark Mode"
          description="Switch to a darker color theme"
          badge={
            <Badge size="xs" status="neutral" icon={<FontAwesomeIcon icon={faGear} />} />
          }
          action={
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          }
        />
        <CardControl
          title="Security"
          description="Configure two-factor authentication"
          badge={
            <Badge size="xs" status="info" icon={<FontAwesomeIcon icon={faShieldHalved} />} />
          }
          action={<Button variant="outline" size="sm">Configure</Button>}
        />
      </div>
    );
  },
  args: {
    title: '',
    description: '',
  },
};

/**
 * Minimal card without badge or description
 */
export const Minimal: Story = {
  parameters: {
    docs: {
      source: {
        code: `<CardControl
  title="Auto-save"
  action={<Switch />}
/>`,
      },
    },
  },
  render: (args) => {
    const [checked, setChecked] = useState(false);

    return (
      <CardControl
        {...args}
        action={
          <Switch
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        }
      />
    );
  },
  args: {
    title: 'Auto-save',
  },
};
