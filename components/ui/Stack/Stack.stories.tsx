import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Stack> = {
  title: 'Layouts/stack',
  component: Stack,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Vertical or horizontal flex container with consistent gap. The most-reached-for layout primitive — use it instead of writing `display: flex; flex-direction: ...; gap: ...;` in component CSS.',
      },
    },
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    gap: { control: 'select', options: ['none', 'tiny', 'xs', 'sm', 'md', 'lg', 'xl', 'huge'] },
    align: { control: 'select', options: [undefined, 'start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'select', options: [undefined, 'start', 'center', 'end', 'between', 'around', 'evenly'] },
    wrap: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

/* ─── Story-only helper ───────────────────────────────────────── */

const Box = ({ children, w }: { children?: React.ReactNode; w?: string }) => (
  <div
    style={{
      width: w ?? 'auto',
      padding: 'var(--bds-padding-md)',
      background: 'var(--bds-surface-secondary)',
      border: '1px dashed var(--bds-border-secondary)',
      borderRadius: 'var(--bds-border-radius-sm)',
      fontFamily: 'var(--bds-font-family-body)',
      fontSize: 'var(--bds-body-sm)',
      color: 'var(--bds-text-primary)',
    }}
  >
    {children}
  </div>
);

/* orientation / gap / align are Controls on Default — the side-by-side
   comparisons live in Stack.mdx as docs-local demos (#1489). SectionLabel
   was gallery-only scaffolding and moved there with them. */

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground — tweak props in the Controls panel */
export const Default: Story = {
  args: {
    orientation: 'vertical',
    gap: 'md',
    align: undefined,
    justify: undefined,
    wrap: false,
  },
  render: (args) => (
    <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   5. REAL-WORLD COMPOSITION
   ═══════════════════════════════════════════════════════════════ */

/** @summary Card body — vertical stack, sm gap (typical pattern) */
export const CardBody: Story = {
  render: () => (
    <Stack
      orientation="vertical"
      gap="sm"
      style={{
        maxWidth: 320,
        padding: 'var(--bds-padding-lg)',
        background: 'var(--bds-surface-primary)',
        border: '1px solid var(--bds-border-secondary)',
        borderRadius: 'var(--bds-border-radius-md)',
      }}
    >
      <h3 style={{ margin: 0, fontFamily: 'var(--bds-font-family-heading)', fontSize: 'var(--bds-heading-sm)' }}>
        Card title
      </h3>
      <p style={{ margin: 0, fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-secondary)' }}>
        Card description with a couple of sentences of supporting copy that demonstrates the typical Stack-with-md-gap rhythm.
      </p>
      <Stack orientation="horizontal" gap="xs" justify="end">
        <Box>Cancel</Box>
        <Box>Save</Box>
      </Stack>
    </Stack>
  ),
};
