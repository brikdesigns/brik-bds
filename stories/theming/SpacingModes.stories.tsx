import type { Meta, StoryObj } from '@storybook/react-vite';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Theming/Modes/Spacing',
  tags: ['surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Spacing density mode — modulates `--padding-*` and `--gap-*` tokens via the `data-mode-spacing="compact|comfortable|spacious"` attribute on `:root` (or any subtree). One of the wired non-color mode collections per BDS issue #340. Default mode requires no attribute.',
      },
    },
  },
  argTypes: {
    mode: {
      control: { type: 'inline-radio' },
      options: ['default', 'compact', 'comfortable', 'spacious'],
    },
  },
  args: { mode: 'default' },
};

export default meta;

interface Args { mode: 'default' | 'compact' | 'comfortable' | 'spacious' }
type Story = StoryObj<Args>;

/* ─── Helpers ─────────────────────────────────────────────────── */

const ALL_PADDING = ['tiny', 'xs', 'sm', 'md', 'lg', 'xl', 'huge'] as const;
const ALL_GAP = ['tiny', 'xs', 'sm', 'md', 'lg', 'xl', 'huge'] as const;

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: 'var(--surface-primary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--padding-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-md)',
    }}
  >
    {children}
  </div>
);

const TokenRow = ({ token, value }: { token: string; value: string }) => (
  <div
    style={{
      display: 'flex',
      gap: 'var(--gap-sm)',
      alignItems: 'center',
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--body-sm)', // bds-lint-ignore
    }}
  >
    <code style={{ minWidth: 140, color: 'var(--text-secondary)' }}>{token}</code>
    <div
      style={{
        background: 'var(--surface-brand-primary)',
        height: 12,
        width: value,
        borderRadius: 2,
      }}
      aria-hidden
    />
    <span style={{ color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

/* ─── Live spec table — shows resolved values for the active mode ─── */

const SpecTable = () => {
  // Read computed values from a probe element so the table reflects the
  // active mode without us hardcoding the per-mode lookup table.
  const rows = [...ALL_PADDING.map((s) => ({ kind: 'padding', size: s, token: `--padding-${s}` })),
                ...ALL_GAP.map((s) => ({ kind: 'gap', size: s, token: `--gap-${s}` }))];

  return (
    <Card>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-sm)' }}>
        Resolved values in this mode
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-lg)' }}>
        <div>
          <h4 style={{ margin: '0 0 var(--gap-xs)', fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            padding
          </h4>
          {rows.filter((r) => r.kind === 'padding').map((r) => (
            <TokenRow
              key={r.token}
              token={r.token}
              value={`var(${r.token})`}
            />
          ))}
        </div>
        <div>
          <h4 style={{ margin: '0 0 var(--gap-xs)', fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            gap
          </h4>
          {rows.filter((r) => r.kind === 'gap').map((r) => (
            <TokenRow
              key={r.token}
              token={r.token}
              value={`var(${r.token})`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

const SampleCard = () => (
  <div
    style={{
      background: 'var(--surface-primary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--padding-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-sm)',
      maxWidth: 320,
    }}
  >
    <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-sm)' }}>
      Card title
    </h3>
    <p style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
      A typical card body — title, description, action — using `padding-lg` outer and `gap-sm` between rows. Density modes change padding and gap simultaneously.
    </p>
    <div style={{ display: 'flex', gap: 'var(--gap-xs)', justifyContent: 'flex-end' }}>
      <span style={{ padding: 'var(--padding-xs) var(--padding-sm)', border: '1px solid var(--border-primary)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--label-sm)' }}>Cancel</span>
      <span style={{ padding: 'var(--padding-xs) var(--padding-sm)', background: 'var(--background-brand-primary)', color: 'var(--text-on-color-dark)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--label-sm)' }}>Save</span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PLAYGROUND — toggle mode in Controls
   ═══════════════════════════════════════════════════════════════ */

/** @summary Toggle the spacing mode and watch padding/gap recompute live */
export const Playground: Story = {
  render: ({ mode }) => (
    <div
      data-mode-spacing={mode === 'default' ? undefined : mode}
      style={{
        padding: 'var(--padding-xl)',
        background: 'var(--surface-secondary)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-lg)',
      }}
    >
      <div>
        <code
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          {mode === 'default' ? '<div>' : `<div data-mode-spacing="${mode}">`}
        </code>
      </div>
      <SampleCard />
      <SpecTable />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   SIDE-BY-SIDE — all modes at once for comparison
   ═══════════════════════════════════════════════════════════════ */

/** @summary All four modes side-by-side — same Card, different density */
export const Comparison: Story = {
  render: () => (
    <div
      style={{
        padding: 'var(--padding-lg)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--gap-md)',
        background: 'var(--surface-secondary)',
      }}
    >
      {(['default', 'compact', 'comfortable', 'spacious'] as const).map((mode) => (
        <div
          key={mode}
          data-mode-spacing={mode === 'default' ? undefined : mode}
          style={{
            padding: 'var(--padding-md)',
            background: 'var(--surface-primary)',
            border: '1px dashed var(--border-secondary)',
            borderRadius: 'var(--border-radius-sm)',
          }}
        >
          <code
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-xs)',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: 'var(--gap-sm)',
            }}
          >
            data-mode-spacing=&quot;{mode}&quot;
          </code>
          <SampleCard />
        </div>
      ))}
    </div>
  ),
};
