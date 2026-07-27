import type { Meta, StoryObj } from '@storybook/react-vite';
import { BulletList } from './BulletList';
import { Field } from '../Field';

const meta: Meta<typeof BulletList> = {
  title: 'Blocks/bullet-list',
  component: BulletList,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    items: {
      control: false,
      description: 'Array of list items. Each item becomes one `<li>`.',
    },
    marker: { control: 'select', options: ['disc', 'decimal', 'none'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
  },
};

export default meta;
type Story = StoryObj<typeof BulletList>;

const Frame = ({ width = '360px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/* ─── 1. Default ──────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    items: [
      'No price-first positioning',
      'No corporate-clinic language',
      'Avoid dental-industry jargon',
    ],
    marker: 'disc',
    density: 'comfortable',
  },
  render: (args) => (
    <Frame>
      <BulletList {...args} />
    </Frame>
  ),
};

/* `marker` is a Control on Default — the marker comparison lives in
   BulletList.mdx as a docs-local demo (#1489). */

/* ─── 3. Inside a Field ──────────────────────────────────────── */

/** @summary BulletList nested inside a Field value */
export const InsideField: Story = {
  render: () => (
    <Frame>
      <Field label="Anti-messages">
        <BulletList
          items={[
            'No price-first positioning',
            'No corporate-clinic language',
            'Avoid dental-industry jargon',
          ]}
        />
      </Field>
    </Frame>
  ),
};
