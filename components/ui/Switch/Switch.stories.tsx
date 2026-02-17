import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/switch',
  component: Switch,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text',
    },
    size: {
      control: 'radio',
      options: ['lg', 'md', 'sm'],
      description: 'Size variant',
    },
    checked: {
      control: 'boolean',
      description: 'Checked state (controlled)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: 'Enable feature',
    size: 'lg',
  },
};

export const Checked: Story = {
  args: {
    label: 'Enable feature',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled switch',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled and checked',
    defaultChecked: true,
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Switch size="lg" label="Large (56x32)" />
<Switch size="md" label="Medium (32x18)" />
<Switch size="sm" label="Small (28x16)" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch size="lg" label="Large" />
      <Switch size="md" label="Medium" />
      <Switch size="sm" label="Small" />
    </div>
  ),
};

export const SizesChecked: Story = {
  name: 'Sizes (checked)',
  parameters: {
    docs: {
      source: {
        code: `<Switch size="lg" label="Large" defaultChecked />
<Switch size="md" label="Medium" defaultChecked />
<Switch size="sm" label="Small" defaultChecked />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch size="lg" label="Large" defaultChecked />
      <Switch size="md" label="Medium" defaultChecked />
      <Switch size="sm" label="Small" defaultChecked />
    </div>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [enabled, setEnabled] = useState(false);

<Switch
  label="Enable notifications"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>`,
      },
    },
  },
  render: () => {
    const [enabled, setEnabled] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Switch
          label="Enable notifications"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <p
          style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--secondary)',
            margin: 0,
          }}
        >
          Current state: <strong>{enabled ? 'Enabled' : 'Disabled'}</strong>
        </p>
      </div>
    );
  },
};

export const SettingsPanel: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Switch label="Email notifications" checked={notifications} onChange={...} />
<Switch label="Dark mode" checked={darkMode} onChange={...} />
<Switch label="Analytics tracking" checked={analytics} onChange={...} />`,
      },
    },
  },
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [analytics, setAnalytics] = useState(true);

    return (
      <div
        style={{
          width: '320px',
          padding: '24px',
          backgroundColor: 'var(--_color---background--primary)',
          border: '1px solid var(--_color---border--secondary)',
          borderRadius: 'var(--_border-radius---lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--_typography---font-family--heading)',
            fontSize: 'var(--_typography---heading--small)',
            margin: '0 0 8px 0',
          }}
        >
          Preferences
        </h3>
        <Switch
          label="Email notifications"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        <Switch
          label="Dark mode"
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
        <Switch
          label="Analytics tracking"
          checked={analytics}
          onChange={(e) => setAnalytics(e.target.checked)}
        />
      </div>
    );
  },
};

export const CompactSettings: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Switch size="sm" label="Auto-save" />
<Switch size="sm" label="Spell check" defaultChecked />
<Switch size="sm" label="Line numbers" defaultChecked />`,
      },
    },
  },
  render: () => (
    <div
      style={{
        width: '240px',
        padding: '16px',
        backgroundColor: 'var(--_color---background--primary)',
        border: '1px solid var(--_color---border--secondary)',
        borderRadius: 'var(--_border-radius---lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--_typography---font-family--heading)',
          fontSize: 'var(--_typography---heading--tiny)',
          margin: 0,
        }}
      >
        Editor settings
      </h3>
      <Switch size="sm" label="Auto-save" />
      <Switch size="sm" label="Spell check" defaultChecked />
      <Switch size="sm" label="Line numbers" defaultChecked />
    </div>
  ),
};
