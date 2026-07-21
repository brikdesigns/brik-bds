import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/spinner',
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

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: { size: 'sm' },
};

/* ─── Sizes (axis-only gallery) ───────────────────────────────── */

/** @summary Both sizes side by side */
export const Sizes: Story = {
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
