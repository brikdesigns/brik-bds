import type { Meta, StoryObj } from '@storybook/react-vite';
import { BulletList } from './BulletList';
import { Field } from '../Field';

const meta: Meta<typeof BulletList> = {
  title: 'Displays/Sheet/bullet-list',
  component: BulletList,
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

/* ─── 1. Playground ──────────────────────────────────────────── */

export const Playground: Story = {
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

/* ─── 2. Markers ─────────────────────────────────────────────── */

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

/* ─── 3. Density ─────────────────────────────────────────────── */

export const Density: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        <BulletList
          density="compact"
          items={['Compact row A', 'Compact row B', 'Compact row C', 'Compact row D']}
        />
        <BulletList
          density="comfortable"
          items={['Comfortable row A', 'Comfortable row B', 'Comfortable row C', 'Comfortable row D']}
        />
      </div>
    </Frame>
  ),
};

/* ─── 4. Inside a Field ──────────────────────────────────────── */

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

/* ─── 5. Patterns ────────────────────────────────────────────── */

export const Patterns: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        <Field label="Approved CTAs">
          <BulletList
            items={['Book a consult', 'See the experience', 'Meet the doctors']}
          />
        </Field>

        <Field label="Proof points">
          <BulletList
            marker="decimal"
            items={[
              'Over 20 years combined clinical experience',
              '96% patient retention year-over-year',
              'Dual-doctor practice with seamless handoffs',
            ]}
          />
        </Field>
      </div>
    </Frame>
  ),
};
