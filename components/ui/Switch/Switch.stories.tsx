import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Switch

A themed toggle switch component for binary on/off states.

## Features
- Smooth slide animation
- Theme-aware colors
- Keyboard accessible
- Controlled and uncontrolled modes
- Optional label

## Usage
Use switches for:
- Settings toggles (notifications, dark mode)
- Feature flags
- Binary preferences
- Instant state changes (vs checkbox for form submission)

## Controlled vs Uncontrolled
- **Controlled**: Pass \`checked\` and \`onChange\` props
- **Uncontrolled**: Use \`defaultChecked\` for initial state

## Theme Integration
The checked state uses brand primary color, adapting to each theme.

## Accessibility
- Uses proper \`role="switch"\` attribute
- Supports keyboard navigation (Space/Enter)
- Focus visible states
- Works with screen readers
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text',
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

// Basic examples
export const Unchecked: Story = {
  args: {
    label: 'Enable feature',
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

// Interactive example
export const Controlled: Story = {
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

// Contextual examples
export const SettingsPanel: Story = {
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
          border: '1px solid var(--_color---border--default)',
          borderRadius: 'var(--_border-radius---lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--_typography---font-family--heading)',
            fontSize: 'var(--_typography---heading--sm)',
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

export const WithDescriptions: Story = {
  render: () => {
    const [marketing, setMarketing] = useState(false);
    const [security, setSecurity] = useState(true);

    return (
      <div
        style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Switch
            label="Marketing emails"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
          <p
            style={{
              fontFamily: 'var(--_typography---font-family--body)',
              fontSize: 'var(--_typography---body--sm)',
              color: 'var(--_color---text--secondary)',
              margin: '0 0 0 56px',
            }}
          >
            Receive promotional emails and product updates
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Switch
            label="Two-factor authentication"
            checked={security}
            onChange={(e) => setSecurity(e.target.checked)}
          />
          <p
            style={{
              fontFamily: 'var(--_typography---font-family--body)',
              fontSize: 'var(--_typography---body--sm)',
              color: 'var(--_color---text--secondary)',
              margin: '0 0 0 56px',
            }}
          >
            Require a verification code when signing in
          </p>
        </div>
      </div>
    );
  },
};

export const FeatureFlags: Story = {
  render: () => {
    const [features, setFeatures] = useState({
      beta: false,
      experimental: false,
      advanced: true,
    });

    const toggleFeature = (feature: keyof typeof features) => {
      setFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }));
    };

    return (
      <div
        style={{
          width: '360px',
          padding: '24px',
          backgroundColor: 'var(--_color---background--secondary)',
          borderRadius: 'var(--_border-radius---lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--_typography---font-family--heading)',
            fontSize: 'var(--_typography---heading--sm)',
            margin: 0,
          }}
        >
          Feature Flags
        </h3>
        <Switch
          label="Beta features"
          checked={features.beta}
          onChange={() => toggleFeature('beta')}
        />
        <Switch
          label="Experimental mode"
          checked={features.experimental}
          onChange={() => toggleFeature('experimental')}
        />
        <Switch
          label="Advanced settings"
          checked={features.advanced}
          onChange={() => toggleFeature('advanced')}
        />
      </div>
    );
  },
};
