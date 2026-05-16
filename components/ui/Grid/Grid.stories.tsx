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
    columns: { control: 'select', options: [1, 2, 3, 4, 5, 6, 'auto-fit', 'auto-fill'] },
    gap: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    minColumnWidth: { control: 'text' },
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

/** @summary Interactive playground */
export const Playground: Story = {
  args: { columns: 'auto-fit', minColumnWidth: '240px', gap: 'lg' },
  render: (args) => (
    <Grid {...args}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Tile key={i}>Item {i}</Tile>
      ))}
    </Grid>
  ),
};

/** @summary Fixed 3-column — most common Brik card grid */
export const ThreeColumn: Story = {
  render: () => (
    <Grid columns={3} gap="lg">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Tile key={i}>Card {i}</Tile>
      ))}
    </Grid>
  ),
};

/** @summary Auto-fit — items reflow to fill available width */
export const AutoFit: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      <div>
        <SectionLabel>auto-fit, minColumnWidth=240px (default) — narrow it to see reflow</SectionLabel>
        <Grid columns="auto-fit" minColumnWidth="240px" gap="lg">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Tile key={i}>Item {i}</Tile>
          ))}
        </Grid>
      </div>
      <div>
        <SectionLabel>auto-fit, minColumnWidth=180px — denser pack</SectionLabel>
        <Grid columns="auto-fit" minColumnWidth="180px" gap="md">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Tile key={i}>Item {i}</Tile>
          ))}
        </Grid>
      </div>
    </div>
  ),
};

/** @summary Column counts 1 through 6 */
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

/** @summary Responsive collapse — fixed columns adapt to narrow viewports */
export const ResponsiveCollapse: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Fixed column counts collapse to 2-col below 992px and 1-col below 640px automatically. Resize the preview to see it.',
      },
    },
  },
  render: () => (
    <Grid columns={4} gap="md">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Tile key={i}>Item {i}</Tile>
      ))}
    </Grid>
  ),
};
