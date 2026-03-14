import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardDisplay } from './CardDisplay';
import { Badge } from '../Badge';
import { Button } from '../Button';

const meta: Meta<typeof CardDisplay> = {
  title: 'Displays/Card/card-display',
  component: CardDisplay,
  parameters: { layout: 'centered' },
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

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: '100%' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    imageSrc: sampleImage,
    imageAlt: 'Modern office space',
    badge: <Badge size="sm">Featured</Badge>,
    title: 'Modern workspace design',
    description: 'Create productive environments that inspire creativity and collaboration.',
    action: <Button variant="primary" size="sm">View details</Button>,
  },
  decorators: [(Story) => <div style={{ width: 340 }}><Story /></div>],
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Full card (image + badge + action)</SectionLabel>
      <Row>
        <div style={{ width: 340 }}>
          <CardDisplay
            imageSrc={sampleImage}
            imageAlt="Modern office"
            badge={<Badge size="sm">Featured</Badge>}
            title="Modern workspace design"
            description="Create productive environments that inspire creativity."
            action={<Button variant="primary" size="sm">View details</Button>}
          />
        </div>
      </Row>

      <SectionLabel>Without image</SectionLabel>
      <Row>
        <div style={{ width: 340 }}>
          <CardDisplay
            badge={<Badge status="positive" size="sm">New</Badge>}
            title="Getting started guide"
            description="Learn the basics of setting up your first project."
            action={<Button variant="outline" size="sm">Read more</Button>}
          />
        </div>
      </Row>

      <SectionLabel>Minimal (title + description only)</SectionLabel>
      <Row>
        <div style={{ width: 340 }}>
          <CardDisplay title="Simple card" description="A card with just a title and description." />
        </div>
      </Row>

      <SectionLabel>As link</SectionLabel>
      <Row>
        <div style={{ width: 340 }}>
          <CardDisplay
            imageSrc={sampleImage}
            imageAlt="Office building"
            title="Clickable card"
            description="This entire card is a link. Hover to see the cursor."
            href="#"
          />
        </div>
      </Row>
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Service cards grid</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-lg)', maxWidth: 960 }}>
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
    </Stack>
  ),
};
