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

/* ─── Story-only helpers ──────────────────────────────────────── */

const Box = ({ children, w }: { children?: React.ReactNode; w?: string }) => (
  <div
    style={{
      width: w ?? 'auto',
      padding: 'var(--padding-md)',
      background: 'var(--surface-secondary)',
      border: '1px dashed var(--border-secondary)',
      borderRadius: 'var(--border-radius-sm)',
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--body-sm)', // bds-lint-ignore
      color: 'var(--text-primary)',
      textAlign: 'center' as const,
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

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground — tweak props in the Controls panel */
export const Playground: Story = {
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
   2. DIRECTIONS
   ═══════════════════════════════════════════════════════════════ */

/** @summary Vertical (default) and horizontal direction */
export const Directions: Story = {
  render: () => (
    <Stack direction="vertical" gap="xl">
      <div>
        <SectionLabel>direction="vertical" (default)</SectionLabel>
        <Stack direction="vertical" gap="sm">
          <Box>Stacked top</Box>
          <Box>Stacked middle</Box>
          <Box>Stacked bottom</Box>
        </Stack>
      </div>
      <div>
        <SectionLabel>direction="horizontal"</SectionLabel>
        <Stack direction="horizontal" gap="sm">
          <Box>Left</Box>
          <Box>Center</Box>
          <Box>Right</Box>
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. GAP SCALE
   ═══════════════════════════════════════════════════════════════ */

/** @summary All gap tokens — `--gap-tiny` through `--gap-huge` */
export const GapScale: Story = {
  render: () => (
    <Stack direction="vertical" gap="lg">
      {(['tiny', 'xs', 'sm', 'md', 'lg', 'xl', 'huge'] as const).map((g) => (
        <div key={g}>
          <SectionLabel>gap=&quot;{g}&quot;</SectionLabel>
          <Stack direction="horizontal" gap={g}>
            <Box w="60px">A</Box>
            <Box w="60px">B</Box>
            <Box w="60px">C</Box>
          </Stack>
        </div>
      ))}
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. ALIGNMENT
   ═══════════════════════════════════════════════════════════════ */

/** @summary Cross-axis alignment options */
export const Alignment: Story = {
  render: () => (
    <Stack direction="vertical" gap="lg">
      {(['start', 'center', 'end', 'stretch'] as const).map((a) => (
        <div key={a}>
          <SectionLabel>align=&quot;{a}&quot; (horizontal stack)</SectionLabel>
          <div style={{ height: 80, background: 'var(--surface-secondary)', padding: 'var(--padding-xs)' }}>
            <Stack direction="horizontal" gap="sm" align={a} style={{ height: '100%' }}>
              <Box w="60px">A</Box>
              <Box w="60px">B</Box>
              <Box w="60px">C</Box>
            </Stack>
          </div>
        </div>
      ))}
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
