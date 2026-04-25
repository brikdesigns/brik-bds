import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Indicator/spinner',
  component: Spinner,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

/* ─── Layout helpers ─────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </span>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', alignItems: 'center' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-huge)', alignItems: 'center' }}>
    {children}
  </div>
);

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: { size: 'sm' },
};

/* ─── Variants ───────────────────────────────────────────────── */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      <SectionLabel>Sizes</SectionLabel>
      <Row>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-md)' }}>
          <Spinner size="sm" />
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-secondary)' }}>Small (16px)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-md)' }}>
          <Spinner size="lg" />
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-secondary)' }}>Large (48px)</span>
        </div>
      </Row>
    </Stack>
  ),
};

/* ─── Patterns ───────────────────────────────────────────────── */

/** @summary Common usage patterns */
export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <SectionLabel>Loading button</SectionLabel>
      <button
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--gap-md)', padding: 'var(--padding-sm) var(--padding-lg)', backgroundColor: 'var(--background-brand-primary)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--border-radius-md)', fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-md)', cursor: 'wait' }}
        disabled
      >
        <Spinner size="sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
        Loading...
      </button>

      <SectionLabel>Centered in container</SectionLabel>
      <div style={{ width: '400px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-secondary)', borderRadius: 'var(--border-radius-md)' }}>
        <Spinner size="lg" />
      </div>

      <SectionLabel>With loading text</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-lg)' }}>
        <Spinner size="lg" />
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-secondary)', margin: 0 }}>Loading your content...</p>
      </div>
    </Stack>
  ),
};
