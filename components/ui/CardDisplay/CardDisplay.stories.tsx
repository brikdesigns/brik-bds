import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardDisplay } from './CardDisplay';
import { Badge } from '../Badge';
import { Button } from '../Button';

const meta: Meta<typeof CardDisplay> = {
  title: 'Components/card-display',
  component: CardDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    imageSrc: { control: 'text' },
    imageAlt: { control: 'text' },
    href: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CardDisplay>;

const sampleImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop';

export const Default: Story = {
  args: {
    imageSrc: sampleImage,
    imageAlt: 'Modern office space',
    badge: <Badge size="sm">Featured</Badge>,
    title: 'Modern workspace design',
    description: 'Create productive environments that inspire creativity and collaboration.',
    action: <Button variant="primary" size="sm">View details</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '340px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithoutImage: Story = {
  args: {
    badge: <Badge status="positive" size="sm">New</Badge>,
    title: 'Getting started guide',
    description: 'Learn the basics of setting up your first project with our step-by-step guide.',
    action: <Button variant="outline" size="sm">Read more</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '340px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Minimal: Story = {
  args: {
    title: 'Simple card',
    description: 'A card with just a title and description, no extras.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '340px' }}>
        <Story />
      </div>
    ),
  ],
};

export const AsLink: Story = {
  args: {
    imageSrc: sampleImage,
    imageAlt: 'Office building',
    title: 'Clickable card',
    description: 'This entire card is a link. Hover to see the pointer cursor.',
    href: '#',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '340px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Grid: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
  <CardDisplay
    imageSrc="..."
    badge={<Badge size="sm">Design</Badge>}
    title="Brand identity"
    description="Build a cohesive visual identity."
    action={<Button variant="primary" size="sm">View details</Button>}
  />
  {/* ... more cards */}
</div>`,
      },
    },
  },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--padding-lg)',
      maxWidth: '960px',
    }}>
      {['Brand identity', 'Web development', 'Content strategy'].map((title) => (
        <CardDisplay
          key={title}
          imageSrc={sampleImage}
          imageAlt={title}
          badge={<Badge size="sm">Service</Badge>}
          title={title}
          description="Professional services tailored to your needs."
          action={<Button variant="primary" size="sm">View details</Button>}
        />
      ))}
    </div>
  ),
};
