import type { Meta, StoryObj } from '@storybook/react-vite';

import { BlockReveal } from './BlockReveal';

const meta: Meta<typeof BlockReveal> = {
  title: 'Blueprints/block reveal',
  component: BlockReveal,
  tags: ['surface-web'],
  argTypes: {
    reveal: {
      control: 'inline-radio',
      options: ['none', 'fade', 'rise', 'stagger'],
      description: 'The motion axis (ADR-039) — which entrance the block reveals with.',
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The shared block-entrance primitive (ADR-039 §Decision 2, brik-bds#2494). Applies a `fade` / `rise` / `stagger` entrance selected by the `reveal` axis, via the shared `bds-fade-in` / `bds-slide-up` keyframes and `--stagger-*` delays. Reduced-motion-gated by construction (pure CSS). The Astro rail applies the same `bds-block-reveal--*` class directly (a modifier needs no wrapper). `fade` / `rise` settle to the same static end-state, so they are Controls here; `stagger` is a distinct shape (its direct children animate in turn).',
      },
    },
  },
  render: (args) => (
    <BlockReveal {...args}>
      <p style={{ margin: 0 }}>A revealed block</p>
    </BlockReveal>
  ),
};

export default meta;
type Story = StoryObj<typeof BlockReveal>;

/** @summary Reveal primitive — switch `reveal` via Controls */
export const Default: Story = {
  args: { reveal: 'fade' },
};

/**
 * `stagger` animates the element's DIRECT children in sequence via the
 * `--stagger-*` scale — for content stacks (hero copy) and item grids.
 *
 * @summary Stagger — direct children fade in sequentially
 */
export const Stagger: Story = {
  args: { reveal: 'stagger' },
  render: (args) => (
    <BlockReveal {...args} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: 12, border: '1px solid currentColor' }}>Item one</div>
      <div style={{ padding: 12, border: '1px solid currentColor' }}>Item two</div>
      <div style={{ padding: 12, border: '1px solid currentColor' }}>Item three</div>
    </BlockReveal>
  ),
};
