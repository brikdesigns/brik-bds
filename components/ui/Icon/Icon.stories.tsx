import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { ThemeProvider } from '../../providers/ThemeProvider';
import phSubset from '../../icons.generated.json';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Icon> = {
  title: 'Foundation/Assets/icon',
  component: Icon,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Offline-first Iconify wrapper. Phosphor (`ph:*`) icons render from a',
          'subset bundled into the BDS package, so first paint never waits on — or',
          'silently fails against — the Iconify CDN (`api.iconify.design`).',
          '',
          '**Drop-in:** `import { Icon } from \'@brikdesigns/bds\'` replaces',
          '`import { Icon } from \'@iconify/react\'` with no API change.',
          '',
          '**Coverage:** the subset is generated from every `ph:*` icon used in',
          'shipped BDS source (`npm run gen:icons`, CI-gated). Icons outside it fall',
          'through to Iconify\'s default runtime fetch — register your own offline via',
          '`addBrikIcons(collection)` at app start.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    icon: { control: 'text' },
    width: { control: 'number' },
    weight: {
      control: 'select',
      options: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'],
      description: 'Phosphor stroke weight for `ph:*` icons. Default `bold`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

/** @summary Interactive playground — try any `ph:*` name */
export const Default: Story = {
  args: { icon: 'ph:rocket', width: 48 },
};

/**
 * The full set bundled for offline use — every icon here renders
 * with the network blocked.
 * @summary Bundled icon set, renders with network blocked
 */
export const BundledSet: Story = {
  render: () => {
    const names = Object.keys((phSubset as { icons: Record<string, unknown> }).icons).sort();
    return (
      <div style={{ maxWidth: 720 }}>
        <p style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', marginBottom: 'var(--gap-md)' }}>
          {names.length} Phosphor icons bundled offline (zero CDN requests)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 'var(--gap-md)' }}>
          {names.map((name) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-2xs)', textAlign: 'center' }}>
              {/* weight="regular" so each entry renders at its own bundled
                  weight — a `*-bold` name still reads bold, a plain name reads
                  regular — rather than the component's bold default rewriting
                  every plain name. */}
              <Icon icon={`ph:${name}`} width={28} weight="regular" />
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * A `ThemeProvider` (or one client theme) flips the default icon weight for
 * every descendant `<Icon>` via `defaultIconWeight` — no per-call-site change.
 * An explicit `weight` prop still wins. Weight rides React context, not a
 * `[data-mode-*]` token, because it selects a different SVG asset (ADR-036).
 * @summary Provider defaultIconWeight flips descendant icon weight
 */
export const WeightFromProvider: Story = {
  render: () => {
    const labelStyle = { minWidth: 260, fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)' } as const;
    const Row = ({ label, children }: { label: string; children: ReactNode }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
        <span style={labelStyle}>{label}</span>
        {children}
      </div>
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', maxWidth: 480 }}>
        {/* `ph:star` is bundled at bold/fill/regular, so all three render
            offline. Only star-fill is in the subset today — see the note. */}
        {/* No provider — the built-in default weight ('bold'). */}
        <Row label="no provider — bold default">
          <Icon icon="ph:star" width={40} />
        </Row>
        <ThemeProvider defaultIconWeight="fill" persist={false} applyToBody={false}>
          {/* Provider default flows to the nested Icon with no per-icon prop. */}
          <Row label="provider defaultIconWeight=fill">
            <Icon icon="ph:star" width={40} />
          </Row>
          {/* Explicit prop overrides the provider default per-icon. */}
          <Row label="…same provider, weight=&quot;regular&quot; prop wins">
            <Icon icon="ph:star" width={40} weight="regular" />
          </Row>
        </ThemeProvider>
        <p style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', margin: 0 }}>
          Note: the bundled offline subset carries fill variants only where BDS
          source uses them (today just <code>star-fill</code>). A consumer that
          sets <code>defaultIconWeight=&quot;fill&quot;</code> must bring the fill
          glyphs offline via <code>addBrikIcons()</code> or their own
          <code> gen:icons</code>, else those icons fall through to the Iconify CDN.
        </p>
      </div>
    );
  },
};
