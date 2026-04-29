import type { Meta, StoryObj } from '@storybook/react-vite';
import { BulletList } from './BulletList';
import { Field } from '../Field';

/**
 * BulletList — semantic list with controlled marker and density. Renders as
 * `<ul>` (disc/none) or `<ol>` (decimal). Use inside a `Field` label for
 * structured content like proof-points or anti-messages.
 * @summary Marker-aware semantic list with density variants
 */
const meta: Meta<typeof BulletList> = {
  title: 'Components/List/bullet-list',
  component: BulletList,
  parameters: { layout: 'padded' },
  argTypes: {
    marker: { control: 'select', options: ['disc', 'decimal', 'none'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BulletList>;

/** Args-driven sandbox. Use Controls to flip marker and density.
 *  @summary Live playground with all controls */
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
};

/* ─── Marker axis ────────────────────────────────────────────── */

/** Disc bullets — default unordered list marker.
 *  @summary Disc-marked bullet list */
export const Disc: Story = {
  args: {
    marker: 'disc',
    items: ['First disc item', 'Second disc item', 'Third disc item'],
  },
};

/** Decimal numbering — ordered list (`<ol>`). Use when sequence matters.
 *  @summary Numbered ordered list */
export const Decimal: Story = {
  args: {
    marker: 'decimal',
    items: ['First numbered item', 'Second numbered item', 'Third numbered item'],
  },
};

/** No marker — plain list rows. Use when the surrounding container provides structure.
 *  @summary Marker-free list */
export const NoMarker: Story = {
  args: {
    marker: 'none',
    items: ['No marker row one', 'No marker row two', 'No marker row three'],
  },
};

/* ─── Density axis ───────────────────────────────────────────── */

/** Compact density — tighter line-height for dense surfaces.
 *  @summary Compact density */
export const Compact: Story = {
  args: {
    density: 'compact',
    items: ['Compact row A', 'Compact row B', 'Compact row C', 'Compact row D'],
  },
};

/** Comfortable density — default breathing room.
 *  @summary Comfortable density */
export const Comfortable: Story = {
  args: {
    density: 'comfortable',
    items: ['Comfortable row A', 'Comfortable row B', 'Comfortable row C', 'Comfortable row D'],
  },
};

/* ─── Composition ────────────────────────────────────────────── */

/** Inside a Field — the canonical use for structured content blocks
 *  (anti-messages, proof points, approved CTAs). Render uses children
 *  composition so the Field wraps the list.
 *  @summary BulletList wrapped in a Field label */
export const InsideField: Story = {
  render: () => (
    <Field label="Anti-messages">
      <BulletList
        items={[
          'No price-first positioning',
          'No corporate-clinic language',
          'Avoid dental-industry jargon',
        ]}
      />
    </Field>
  ),
};
