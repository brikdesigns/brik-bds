import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Action/button',
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
    loading: {
      control: 'boolean',
      description: 'Loading state — shows spinner and disables interaction',
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
    <div style={{ display: 'flex', gap: 'var(--padding-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
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
    <div style={{ display: 'flex', gap: 'var(--padding-sm)', alignItems: 'center' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      {(['primary', 'outline', 'secondary', 'ghost'] as const).map((variant) => (
        <div key={variant}>
          <div style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-xs)', // bds-lint-ignore — closest to 0.75rem (12px)
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--gap-md)',
            color: 'var(--text-muted)',
          }}>
            {variant}
          </div>
          <div style={{ display: 'flex', gap: 'var(--padding-sm)', alignItems: 'center' }}>
            <Button variant={variant} size="sm">Small</Button>
            <Button variant={variant} size="md">Medium</Button>
            <Button variant={variant} size="lg">Large</Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Icons ──────────────────────────────────────────────────────

/** Simple inline SVG icons for stories (no dependency on icon libraries) */
const ArrowRight = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8.354 1.646a.5.5 0 0 0-.708.708L12.793 7.5H2a.5.5 0 0 0 0 1h10.793l-5.147 5.146a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708l-6-6z" />
  </svg>
);

const Plus = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
  </svg>
);

const Download = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.1a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-2.1a.5.5 0 0 1 1 0v2.1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5v-2.1a.5.5 0 0 1 .5-.5z" />
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
  </svg>
);

/**
 * Icons — left (iconBefore) and right (iconAfter) icon slots
 *
 * Use `iconBefore` for leading icons and `iconAfter` for trailing icons.
 * Pass any ReactNode — SVG, FontAwesome, Lucide, etc. Use `1em` sizing
 * so the icon scales with the button's font size.
 */
export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Buttons support `iconBefore` and `iconAfter` props. Icons inherit `currentColor` and scale with font size when sized in `em` units.',
      },
      source: {
        code: `<Button iconAfter={<ArrowRight />}>Get started</Button>
<Button variant="outline" iconBefore={<Plus />}>Add item</Button>
<Button variant="secondary" iconAfter={<Download />}>Download</Button>
<Button variant="ghost" iconBefore={<Plus />}>New</Button>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--padding-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" iconAfter={<ArrowRight />}>Get started</Button>
      <Button variant="outline" iconBefore={<Plus />}>Add item</Button>
      <Button variant="secondary" iconAfter={<Download />}>Download</Button>
      <Button variant="ghost" iconBefore={<Plus />}>New</Button>
    </div>
  ),
};

/**
 * Icons across all sizes — verifies gap scales correctly
 */
export const IconSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <div style={{
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--gap-md)',
            color: 'var(--text-muted)',
          }}>
            {size}
          </div>
          <div style={{ display: 'flex', gap: 'var(--padding-sm)', alignItems: 'center' }}>
            <Button variant="primary" size={size} iconBefore={<Plus />}>Create</Button>
            <Button variant="outline" size={size} iconAfter={<ArrowRight />}>Continue</Button>
            <Button variant="ghost" size={size} iconBefore={<Download />}>Export</Button>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-huge)' }}>
      {/* Hover Instructions */}
      <div style={{
        padding: 'var(--padding-md)',
        backgroundColor: 'var(--surface-secondary)',
        borderRadius: 'var(--border-radius-md)',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-sm)',
      }}>
        <strong style={{ display: 'block', marginBottom: 'var(--gap-md)' }}>Interactive State Guide:</strong>
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
        gap: 'var(--gap-lg) var(--gap-xl)',
        alignItems: 'center',
      }}>
        {/* Header Row */}
        <div />
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-muted)' }}>
          Default
        </div>
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-muted)' }}>
          Hover (try it!)
        </div>
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-muted)' }}>
          Focus (tab)
        </div>
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-muted)' }}>
          Disabled
        </div>

        {/* Primary Row */}
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-secondary)' }}>
          Primary
        </div>
        <Button variant="primary" size="md">Button</Button>
        <Button variant="primary" size="md">Hover me</Button>
        <Button variant="primary" size="md">Tab here</Button>
        <Button variant="primary" size="md" disabled>Disabled</Button>

        {/* Outline Row */}
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-secondary)' }}>
          Outline
        </div>
        <Button variant="outline" size="md">Button</Button>
        <Button variant="outline" size="md">Hover me</Button>
        <Button variant="outline" size="md">Tab here</Button>
        <Button variant="outline" size="md" disabled>Disabled</Button>

        {/* Secondary Row */}
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-secondary)' }}>
          Secondary
        </div>
        <Button variant="secondary" size="md">Button</Button>
        <Button variant="secondary" size="md">Hover me</Button>
        <Button variant="secondary" size="md">Tab here</Button>
        <Button variant="secondary" size="md" disabled>Disabled</Button>

        {/* Ghost Row */}
        <div style={{ fontSize: 'var(--body-xs)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-secondary)' }}>
          Ghost
        </div>
        <Button variant="ghost" size="md">Button</Button>
        <Button variant="ghost" size="md">Hover me</Button>
        <Button variant="ghost" size="md">Tab here</Button>
        <Button variant="ghost" size="md" disabled>Disabled</Button>
      </div>

      {/* Variant-Specific Hover Behaviors */}
      <div style={{
        padding: 'var(--padding-md)',
        backgroundColor: 'var(--surface-secondary)',
        borderRadius: 'var(--border-radius-md)',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-sm)',
      }}>
        <strong style={{ display: 'block', marginBottom: 'var(--gap-md)' }}>Variant-Specific Hover Behaviors:</strong>
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

// ─── Loading State ──────────────────────────────────────────────

/**
 * Loading state - spinner replaces content while preserving button width
 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
    children: 'Submit',
  },
  parameters: {
    docs: {
      source: {
        code: `<Button variant="primary" loading>Submit</Button>`,
      },
    },
  },
};

/**
 * Loading state across all variants
 */
export const LoadingVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Button variant="primary" loading>Primary</Button>
<Button variant="outline" loading>Outline</Button>
<Button variant="secondary" loading>Secondary</Button>
<Button variant="ghost" loading>Ghost</Button>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--padding-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" loading>Primary</Button>
      <Button variant="outline" loading>Outline</Button>
      <Button variant="secondary" loading>Secondary</Button>
      <Button variant="ghost" loading>Ghost</Button>
    </div>
  ),
};

/**
 * Interactive loading toggle - click to trigger a loading state
 */
export const LoadingToggle: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Click the button to simulate an async action. The spinner replaces the text while preserving the button width.',
      },
      source: {
        code: `const [loading, setLoading] = useState(false);
const handleClick = () => {
  setLoading(true);
  setTimeout(() => setLoading(false), 2000);
};
<Button variant="primary" loading={loading} onClick={handleClick}>Save Changes</Button>`,
      },
    },
  },
  render: () => {
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <div style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'center' }}>
        <Button variant="primary" loading={loading} onClick={handleClick}>
          Save Changes
        </Button>
        <Button variant="outline" loading={loading} onClick={handleClick}>
          Save Changes
        </Button>
      </div>
    );
  },
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', alignItems: 'flex-start' }}>
        {/* Counter Display */}
        <div style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: 'var(--heading-lg)',
          color: 'var(--text-primary)',
        }}>
          Count: {count}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--padding-sm)', flexWrap: 'wrap' }}>
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
            loading={isLoading}
          >
            Async +1
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
            padding: 'var(--padding-sm)',
            backgroundColor: 'var(--surface-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--body-sm)',
            color: 'var(--text-muted)',
          }}>
            Simulating async operation... button is disabled during load
          </div>
        )}
      </div>
    );
  },
};
