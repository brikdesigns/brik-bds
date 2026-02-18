import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Card> = {
  title: 'Components/card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
      description: 'Card style variant',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding size',
    },
    interactive: {
      control: 'boolean',
      description: 'Whether card is interactive/clickable',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic card
export const Default: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a basic card with some description text.
        </CardDescription>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

// Outlined variant
export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'lg',
    children: (
      <>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>
          Card with a subtle border, good for content grouping.
        </CardDescription>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// Elevated variant
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    children: (
      <>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>
          Card with a shadow for visual prominence.
        </CardDescription>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// With footer and button
export const WithAction: Story = {
  args: {
    variant: 'outlined',
    padding: 'lg',
    children: (
      <>
        <CardTitle>Feature Card</CardTitle>
        <CardDescription>
          Cards can include buttons and other interactive elements.
        </CardDescription>
        <CardFooter>
          <Button variant="primary" size="sm">Learn More</Button>
        </CardFooter>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// Interactive card
export const Interactive: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    interactive: true,
    children: (
      <>
        <div style={{ alignSelf: 'flex-start' }}>
          <Badge>New</Badge>
        </div>
        <CardTitle>Clickable Card</CardTitle>
        <CardDescription>
          This entire card is clickable.
        </CardDescription>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// All variants
export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card variant="default" padding="md">
  <CardTitle>Default</CardTitle>
  <CardDescription>No border or shadow</CardDescription>
</Card>

<Card variant="outlined" padding="md">
  <CardTitle>Outlined</CardTitle>
  <CardDescription>With border</CardDescription>
</Card>

<Card variant="elevated" padding="md">
  <CardTitle>Elevated</CardTitle>
  <CardDescription>With shadow</CardDescription>
</Card>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Card variant="default" padding="md" style={{ width: '200px' }}>
        <CardTitle as="h4">Default</CardTitle>
        <CardDescription>No border or shadow</CardDescription>
      </Card>
      <Card variant="outlined" padding="md" style={{ width: '200px' }}>
        <CardTitle as="h4">Outlined</CardTitle>
        <CardDescription>With border</CardDescription>
      </Card>
      <Card variant="elevated" padding="md" style={{ width: '200px' }}>
        <CardTitle as="h4">Elevated</CardTitle>
        <CardDescription>With shadow</CardDescription>
      </Card>
    </div>
  ),
};

// Card grid
export const CardGrid: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Card variant="outlined" padding="lg">
  <Badge>Design</Badge>
  <CardTitle>Design</CardTitle>
  <CardDescription>Professional design services.</CardDescription>
  <CardFooter>
    <Button variant="outline" size="sm">Learn More</Button>
  </CardFooter>
</Card>

<Card variant="outlined" padding="lg">
  <Badge>Development</Badge>
  <CardTitle>Development</CardTitle>
  <CardDescription>Professional development services.</CardDescription>
  <CardFooter>
    <Button variant="outline" size="sm">Learn More</Button>
  </CardFooter>
</Card>`,
      },
    },
  },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      maxWidth: '800px',
    }}>
      {['Design', 'Development', 'Strategy'].map((title) => (
        <Card key={title} variant="outlined" padding="lg">
          <Badge>{title}</Badge>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Professional {title.toLowerCase()} services.
          </CardDescription>
          <CardFooter>
            <Button variant="outline" size="sm">Learn More</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  ),
};
