import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../../components/ui/Button';
import { HeroMediaCardPrice } from './HeroMediaCardPrice';

const meta: Meta<typeof HeroMediaCardPrice> = {
  title: 'Blueprints/hero media card price',
  component: HeroMediaCardPrice,
  tags: ['surface-web'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    children: { control: false, description: 'A caller-composed `<Button>` CTA or other trailing content.' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The hero media-card price block (`.bds-hero__price` / `__price-label` / `__price-value`), class-identical to the `@deprecated` `HeroSplitImageCardOverlay` adapter\'s inline markup (brik-bds#2284). Presentational only — renders no `<button>`/`<a>` itself; a caller composes its own CTA as `children`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroMediaCardPrice>;

/** @summary Label + value, no CTA */
export const Default: Story = {
  args: {
    label: 'Starting at',
    value: '$99/mo',
  },
};

/**
 * The CTA is the caller's own `<Button>`, composed as `children` — the
 * component itself renders no interactive element.
 *
 * @summary With a caller-composed CTA button
 */
export const WithCallerComposedCta: Story = {
  render: () => (
    <HeroMediaCardPrice label="Starting at" value="$99/mo">
      <Button href="#start" variant="primary" size="sm">
        Get started
      </Button>
    </HeroMediaCardPrice>
  ),
};

/**
 * Value only — the label is suppressed unless both label and value are set,
 * matching the legacy adapter's original condition.
 *
 * @summary Value only, no label
 */
export const ValueOnly: Story = {
  args: {
    value: '$99/mo',
  },
};
