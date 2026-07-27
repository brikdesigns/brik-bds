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
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
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
      padding: 'var(--padding-md)',
      background: 'var(--surface-secondary)',
      border: '1px dashed var(--border-secondary)',
      borderRadius: 'var(--border-radius-sm)',
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--body-sm)',
      color: 'var(--text-primary)',
    }}
  >
    {children}
  </div>
);

/* direction / gap / align are Controls on Default — the side-by-side
   comparisons live in Stack.mdx as docs-local demos (#1489). SectionLabel
   was gallery-only scaffolding and moved there with them. */

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground — tweak props in the Controls panel */
export const Default: Story = {
  args: {
    direction: 'vertical',
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
      direction="vertical"
      gap="sm"
      style={{
        maxWidth: 320,
        padding: 'var(--padding-lg)',
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-md)',
      }}
    >
      <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-sm)' }}>
        Card title
      </h3>
      <p style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
        Card description with a couple of sentences of supporting copy that demonstrates the typical Stack-with-md-gap rhythm.
      </p>
      <Stack direction="horizontal" gap="xs" justify="end">
        <Box>Cancel</Box>
        <Box>Save</Box>
      </Stack>
    </Stack>
  ),
};
