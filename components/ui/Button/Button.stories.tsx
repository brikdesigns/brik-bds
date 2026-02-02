import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Button

A themed button component using CSS variables for seamless BDS theme integration.

## Variants
- **primary** - Solid brand background with inverse text
- **outline** - Transparent with brand border and brand text
- **secondary** - Muted background with primary text
- **ghost** - Transparent with no border

## Sizes
- **sm** - Small, compact buttons
- **md** - Default size
- **lg** - Large, prominent buttons

## Theme Integration
Buttons automatically adapt to the current theme via CSS variables.
Use the toolbar above to switch themes.
        `,
      },
    },
  },
  tags: ['autodocs'],
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
