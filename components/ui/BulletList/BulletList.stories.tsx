import type { Meta, StoryObj } from '@storybook/react-vite';
import { BulletList } from './BulletList';
import { Field } from '../Field';

const meta: Meta<typeof BulletList> = {
  title: 'Blocks/bullet-list',
  component: BulletList,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
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

/* ─── 2. Markers (axis-only gallery) ─────────────────────────── */

/** @summary Marker styles side by side */
export const Markers: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        <BulletList
          marker="disc"
          items={['First disc item', 'Second disc item', 'Third disc item']}
        />
        <BulletList
          marker="decimal"
          items={['First numbered item', 'Second numbered item', 'Third numbered item']}
        />
        <BulletList
          marker="none"
          items={['No marker row one', 'No marker row two', 'No marker row three']}
        />
      </div>
    </Frame>
  ),
};

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
