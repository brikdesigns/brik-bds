import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardSummary } from './CardSummary';

const meta: Meta<typeof CardSummary> = {
  title: 'Displays/Card/card-summary',
  component: CardSummary,
  parameters: { layout: 'centered' },
  argTypes: {
    type: { control: 'select', options: ['numeric', 'price'] },
    label: { control: 'text' },
    value: { control: 'text' },
  },
  decorators: [(Story) => <div style={{ width: 322 }}><Story /></div>],
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

/* ─── Playground ─────────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    label: 'Total',
    value: 0,
    type: 'numeric',
    textLink: { label: 'Text Link', href: '#' },
  },
};

/* ─── Variants ───────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Numeric with link</SectionLabel>
      <CardSummary label="Total" value={0} type="numeric" textLink={{ label: 'Text Link', href: '#' }} />

      <SectionLabel>Price with link</SectionLabel>
      <CardSummary label="Amount Due" value={0} type="price" textLink={{ label: 'Text Link', href: '#' }} />

      <SectionLabel>Numeric without link</SectionLabel>
      <CardSummary label="Total" value={0} type="numeric" />

      <SectionLabel>Price without link</SectionLabel>
      <CardSummary label="Amount Due" value={0} type="price" />

      <SectionLabel>Stacked (border removed between)</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <CardSummary label="Total" value={0} type="numeric" textLink={{ label: 'Text Link', href: '#' }} style={{ borderBottom: 'none' }} />
        <CardSummary label="Amount Due" value={0} type="price" textLink={{ label: 'Text Link', href: '#' }} />
      </div>
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

export const Patterns: Story = {
  decorators: [(Story) => <div style={{ width: 1000 }}><Story /></div>],
  render: () => (
    <Stack>
      <SectionLabel>Dashboard metrics grid</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-md)', width: '100%' }}>
        <CardSummary label="Orders" value={156} textLink={{ label: 'View', href: '#' }} />
        <CardSummary label="Revenue" value={24830} type="price" textLink={{ label: 'View', href: '#' }} />
        <CardSummary label="Customers" value={892} />
        <CardSummary label="Avg. Order" value={159.17} type="price" />
        <CardSummary label="Returns" value={3} textLink={{ label: 'Review', href: '#' }} />
        <CardSummary label="Refunds" value={478.5} type="price" textLink={{ label: 'Review', href: '#' }} />
      </div>
    </Stack>
  ),
};
