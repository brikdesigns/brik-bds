import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardTitle, CardDescription, CardFooter } from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Card> = {
  title: 'Displays/Card/card',
  component: Card,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outlined', 'elevated'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

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
    variant: 'outlined',
    padding: 'md',
    children: (
      <>
        <CardTitle>Card title</CardTitle>
        <CardDescription>
          This is a basic card with some description text.
        </CardDescription>
        <CardFooter>
          <Button variant="primary" size="sm">Action</Button>
        </CardFooter>
      </>
    ),
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Variant: default / outlined / elevated</SectionLabel>
      <Row>
        {(['default', 'outlined', 'elevated'] as const).map((v) => (
          <Card key={v} variant={v} padding="md" style={{ width: 220 }}>
            <CardTitle as="h4">{v}</CardTitle>
            <CardDescription>Card variant preview</CardDescription>
          </Card>
        ))}
      </Row>

      <SectionLabel>Padding: none / sm / md / lg</SectionLabel>
      <Row>
        {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
          <Card key={p} variant="outlined" padding={p} style={{ width: 180 }}>
            <CardTitle as="h4">{p}</CardTitle>
          </Card>
        ))}
      </Row>

      <SectionLabel>Interactive</SectionLabel>
      <Row>
        <Card variant="outlined" padding="md" interactive style={{ width: 260 }}>
          <Badge>New</Badge>
          <CardTitle as="h4">Clickable card</CardTitle>
          <CardDescription>Hover to see cursor change</CardDescription>
        </Card>
      </Row>

      <SectionLabel>Link card</SectionLabel>
      <Row>
        <Card variant="outlined" padding="md" href="#" style={{ width: 260 }}>
          <CardTitle as="h4">Link card</CardTitle>
          <CardDescription>Renders as an anchor element</CardDescription>
        </Card>
      </Row>
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Service cards grid</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-lg)', maxWidth: 800 }}>
        {['Design', 'Development', 'Strategy'].map((title) => (
          <Card key={title} variant="outlined" padding="lg">
            <Badge>{title}</Badge>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Professional {title.toLowerCase()} services.</CardDescription>
            <CardFooter>
              <Button variant="outline" size="sm">Learn more</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <SectionLabel>Feature card with action</SectionLabel>
      <Card variant="elevated" padding="lg" style={{ maxWidth: 360 }}>
        <CardTitle>Premium plan</CardTitle>
        <CardDescription>
          Everything in the free plan, plus advanced analytics and priority support.
        </CardDescription>
        <CardFooter>
          <Button variant="primary" size="sm">Upgrade</Button>
        </CardFooter>
      </Card>
    </Stack>
  ),
};
