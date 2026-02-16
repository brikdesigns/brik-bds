import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'secondary', 'ghost'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Primary Button',
  },
  parameters: {
    docs: {
      source: {
        code: `<Button variant="primary" size="md">Primary Button</Button>`,
      },
    },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    children: 'Outline Button',
  },
  parameters: {
    docs: {
      source: {
        code: `<Button variant="outline" size="md">Outline Button</Button>`,
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Button',
  },
  parameters: {
    docs: {
      source: {
        code: `<Button variant="secondary" size="md">Secondary Button</Button>`,
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Ghost Button',
  },
  parameters: {
    docs: {
      source: {
        code: `<Button variant="ghost" size="md">Ghost Button</Button>`,
      },
    },
  },
};

// Sizes
export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small',
  },
};

export const Medium: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Medium',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large',
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: true,
    children: 'Full Width Button',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// Disabled state
export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    children: 'Disabled',
  },
};

// All variants showcase
export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

// All sizes
export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Medium</Button>
<Button variant="primary" size="lg">Large</Button>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
    </div>
  ),
};

// Button grid - all combinations
export const ButtonGrid: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Medium</Button>
<Button variant="primary" size="lg">Large</Button>

<Button variant="outline" size="sm">Small</Button>
<Button variant="outline" size="md">Medium</Button>
<Button variant="outline" size="lg">Large</Button>

<Button variant="secondary" size="sm">Small</Button>
<Button variant="secondary" size="md">Medium</Button>
<Button variant="secondary" size="lg">Large</Button>

<Button variant="ghost" size="sm">Small</Button>
<Button variant="ghost" size="md">Medium</Button>
<Button variant="ghost" size="lg">Large</Button>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['primary', 'outline', 'secondary', 'ghost'] as const).map((variant) => (
        <div key={variant}>
          <div style={{
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
            color: 'var(--_color---text--muted)',
          }}>
            {variant}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button variant={variant} size="sm">Small</Button>
            <Button variant={variant} size="md">Medium</Button>
            <Button variant={variant} size="lg">Large</Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Interactive States ──────────────────────────────────────────

/**
 * Interactive states demonstration - hover, focus, active, disabled
 *
 * Try interacting with the buttons to see:
 * - Hover: Darkens by 10% (brightness filter)
 * - Active/Pressed: Darkens by 15% + slight downward shift
 * - Focus: Brand-colored outline (keyboard navigation)
 * - Disabled: 50% opacity
 */
export const InteractiveStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all interactive states. **Hover** over buttons to see the darkening effect. **Click** to see active state. **Tab** to see focus outlines. Each variant has custom hover behavior.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Hover Instructions */}
      <div style={{
        padding: 16,
        backgroundColor: 'var(--_color---surface--secondary)',
        borderRadius: 'var(--_border-radius---md)',
        fontFamily: 'var(--_typography---font-family--body)',
        fontSize: '14px',
      }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Interactive State Guide:</strong>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>Hover:</strong> Move your mouse over any button</li>
          <li><strong>Active:</strong> Click and hold on any button</li>
          <li><strong>Focus:</strong> Press Tab to navigate between buttons</li>
          <li><strong>Disabled:</strong> See the last column for disabled states</li>
        </ul>
      </div>

      {/* State Comparison Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr',
        gap: '16px 24px',
        alignItems: 'center',
      }}>
        {/* Header Row */}
        <div />
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--muted)' }}>
          Default
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--muted)' }}>
          Hover (try it!)
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--muted)' }}>
          Focus (tab)
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--muted)' }}>
          Disabled
        </div>

        {/* Primary Row */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--secondary)' }}>
          Primary
        </div>
        <Button variant="primary" size="md">Button</Button>
        <Button variant="primary" size="md">Hover me</Button>
        <Button variant="primary" size="md">Tab here</Button>
        <Button variant="primary" size="md" disabled>Disabled</Button>

        {/* Outline Row */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--secondary)' }}>
          Outline
        </div>
        <Button variant="outline" size="md">Button</Button>
        <Button variant="outline" size="md">Hover me</Button>
        <Button variant="outline" size="md">Tab here</Button>
        <Button variant="outline" size="md" disabled>Disabled</Button>

        {/* Secondary Row */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--secondary)' }}>
          Secondary
        </div>
        <Button variant="secondary" size="md">Button</Button>
        <Button variant="secondary" size="md">Hover me</Button>
        <Button variant="secondary" size="md">Tab here</Button>
        <Button variant="secondary" size="md" disabled>Disabled</Button>

        {/* Ghost Row */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--_color---text--secondary)' }}>
          Ghost
        </div>
        <Button variant="ghost" size="md">Button</Button>
        <Button variant="ghost" size="md">Hover me</Button>
        <Button variant="ghost" size="md">Tab here</Button>
        <Button variant="ghost" size="md" disabled>Disabled</Button>
      </div>

      {/* Variant-Specific Hover Behaviors */}
      <div style={{
        padding: 16,
        backgroundColor: 'var(--_color---surface--secondary)',
        borderRadius: 'var(--_border-radius---md)',
        fontFamily: 'var(--_typography---font-family--body)',
        fontSize: '14px',
      }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Variant-Specific Hover Behaviors:</strong>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>Primary:</strong> Darkens by 10% (filter: brightness(0.9))</li>
          <li><strong>Outline:</strong> Fills with brand color + inverse text</li>
          <li><strong>Secondary:</strong> Darkens border to primary color</li>
          <li><strong>Ghost:</strong> Shows secondary background</li>
        </ul>
      </div>
    </div>
  ),
};

// ─── Click Counter ───────────────────────────────────────────────

/**
 * Interactive click counter - demonstrates React state + Storybook Actions
 */
export const ClickCounter: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates stateful interaction with buttons. The counter updates on click, and all interactions are logged to the Actions panel below.',
      },
    },
  },
  render: () => {
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleAsyncClick = () => {
      setIsLoading(true);
      setTimeout(() => {
        setCount(count + 1);
        setIsLoading(false);
      }, 1500);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        {/* Counter Display */}
        <div style={{
          fontFamily: 'var(--_typography---font-family--heading)',
          fontSize: 'var(--_typography---heading--large)',
          color: 'var(--_color---text--primary)',
        }}>
          Count: {count}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => setCount(count + 1)}
          >
            Increment
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setCount(Math.max(0, count - 1))}
            disabled={count === 0}
          >
            Decrement
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleAsyncClick}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Async +1'}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => setCount(0)}
            disabled={count === 0}
          >
            Reset
          </Button>
        </div>

        {/* Loading State Explanation */}
        {isLoading && (
          <div style={{
            padding: 12,
            backgroundColor: 'var(--_color---surface--secondary)',
            borderRadius: 'var(--_border-radius---md)',
            fontSize: 14,
            color: 'var(--_color---text--muted)',
          }}>
            Simulating async operation... button is disabled during load
          </div>
        )}
      </div>
    );
  },
};
