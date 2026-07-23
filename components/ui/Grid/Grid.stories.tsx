import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from './Grid';

const meta: Meta<typeof Grid> = {
  title: 'Layouts/grid',
  component: Grid,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Responsive CSS grid for card and tile layouts. Default `auto-fit` with 240px minimum reflows automatically as the viewport narrows. Use a fixed `columns={N}` for designs that demand a specific count.',
      },
    },
  },
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6, 'auto-fit', 'auto-fill'],
      description: 'Fixed column count or auto-sizing strategy. Default `auto-fit`. Fixed counts collapse responsively on narrow viewports.',
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Spacing between cells — maps to BDS `--gap-*` tokens. Default `lg`.',
    },
    minColumnWidth: {
      control: 'text',
      description: 'Minimum column width when `columns` is `auto-fit` / `auto-fill` (any CSS length). Default `240px`.',
    },
    as: { control: false, description: 'HTML element to render as. Default `div`.' },
    children: { control: false, description: 'Slotted child content — the grid cells.' },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--padding-lg)',
      background: 'var(--surface-secondary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: 'var(--border-radius-md)',
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--body-sm)', // bds-lint-ignore
      color: 'var(--text-primary)',
      textAlign: 'center' as const,
      minHeight: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-xs)', // bds-lint-ignore
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      color: 'var(--text-muted)',
      marginBottom: 'var(--gap-sm)',
    }}
  >
    {children}
  </div>
);

/** @summary Canonical grid — columns / gap via Controls */
export const Default: Story = {
  args: { columns: 'auto-fit', minColumnWidth: '240px', gap: 'lg' },
  render: (args) => (
    <Grid {...args}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Tile key={i}>Item {i}</Tile>
      ))}
    </Grid>
  ),
};

/** @summary Column counts 1 through 6 side-by-side */
export const ColumnCounts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      {([1, 2, 3, 4, 5, 6] as const).map((cols) => (
        <div key={cols}>
          <SectionLabel>columns={cols}</SectionLabel>
          <Grid columns={cols} gap="md">
            {Array.from({ length: cols }, (_, i) => (
              <Tile key={i}>{i + 1}</Tile>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
};
