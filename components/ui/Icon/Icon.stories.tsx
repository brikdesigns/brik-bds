import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
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
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

/** @summary Interactive playground — try any `ph:*` name */
export const Playground: Story = {
  args: { icon: 'ph:rocket', width: 48 },
};

/** @summary The full set bundled for offline use — every icon here renders with the network blocked */
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
              <Icon icon={`ph:${name}`} width={28} />
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
