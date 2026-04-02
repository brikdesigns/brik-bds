import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { CardFeature } from './CardFeature';
import { TextLink } from '../TextLink';

const meta: Meta<typeof CardFeature> = {
  title: 'Displays/Card/card-feature',
  component: CardFeature,
  parameters: { layout: 'centered' },
  argTypes: {
    align: { control: 'select', options: ['left', 'center'] },
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
    icon: <Icon icon="ph:rocket" />,
    title: 'Fast Performance',
    description: 'Lightning-fast load times with optimized delivery across all devices.',
    align: 'left',
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Left aligned (default)</SectionLabel>
      <Row>
        <div style={{ width: 320 }}>
          <CardFeature
            icon={<Icon icon="ph:rocket" />}
            title="Fast Performance"
            description="Lightning-fast load times with optimized delivery."
          />
        </div>
      </Row>

      <SectionLabel>Center aligned</SectionLabel>
      <Row>
        <div style={{ width: 320 }}>
          <CardFeature
            icon={<Icon icon="ph:palette" />}
            title="Beautiful Design"
            description="Thoughtfully crafted interfaces that delight users."
            align="center"
          />
        </div>
      </Row>

      <SectionLabel>With action link</SectionLabel>
      <Row>
        <div style={{ width: 320 }}>
          <CardFeature
            icon={<Icon icon="ph:shield-check" />}
            title="Enterprise Security"
            description="Bank-grade encryption and compliance built in."
            action={<TextLink href="#">Learn more</TextLink>}
          />
        </div>
      </Row>

      <SectionLabel>No icon</SectionLabel>
      <Row>
        <div style={{ width: 320 }}>
          <CardFeature
            title="Simple Feature"
            description="Sometimes you just need a title and description."
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
      <SectionLabel>Feature grid</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap-lg)', maxWidth: 700 }}>
        <CardFeature
          icon={<Icon icon="ph:rocket" />}
          title="Fast Performance"
          description="Lightning-fast load times with optimized delivery."
        />
        <CardFeature
          icon={<Icon icon="ph:palette" />}
          title="Beautiful Design"
          description="Thoughtfully crafted interfaces that delight users."
        />
        <CardFeature
          icon={<Icon icon="ph:shield-check" />}
          title="Enterprise Security"
          description="Bank-grade encryption and compliance built in."
        />
        <CardFeature
          icon={<Icon icon="ph:gear-six" />}
          title="Easy Integration"
          description="Connect with your existing tools in minutes."
        />
      </div>
    </Stack>
  ),
};
