import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../../../components';
import { Button } from '../../../components/ui/Button';
import { HeroMediaCard } from './HeroMediaCard';
import { HeroMediaCardImage } from './HeroMediaCardImage';
import { HeroMediaCardPrice } from './HeroMediaCardPrice';
import { placeholderImage } from './_fixtures';

const meta: Meta<typeof HeroMediaCard> = {
  title: 'Blueprints/hero media card',
  component: HeroMediaCard,
  tags: ['surface-web'],
  argTypes: {
    as: { control: false, description: 'Root element. Default `"aside"`.' },
    missing: {
      control: 'object',
      description: 'When set, renders the `data-content-needed` fallback stub instead of `children`.',
    },
    ratio: { control: false, description: 'Aspect ratio for the `missing` fallback `Frame` only.' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The `.bds-hero__media-card` presentational root (brik-bds#2284), extracted from the `@deprecated` `HeroSplitImageCardOverlay` adapter. Renders no interactivity and no `<Button>` of its own — compose `<HeroMediaCardImage>` + `<HeroMediaCardPrice>` as `children`, or set `missing` for the `data-content-needed` fallback stub.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroMediaCard>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * The populated shape: an image plus a price block with a caller-composed
 * `<Button>` CTA — the same content the `@deprecated` adapter renders, now
 * assembled from the three exported parts.
 *
 * @summary Populated card — image + price + caller-composed CTA
 */
export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <HeroMediaCard>
        <HeroMediaCardImage
          src={placeholderImage(320, 320, '#eaf1fb', '#1f3d70', 'Hero')}
          alt=""
          ratio="square"
        />
        <HeroMediaCardPrice label="Starting at" value="$99/mo">
          <Button href="#start" variant="primary" size="sm">
            Get started
          </Button>
        </HeroMediaCardPrice>
      </HeroMediaCard>
    </div>
  ),
};

/**
 * `missing` renders the same `data-content-needed` fallback stub the
 * adapter renders when no price card is supplied — CI grep on `dist/`
 * blocks publish on this stub.
 *
 * @summary Missing fallback stub — `data-content-needed`
 */
export const Missing: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <HeroMediaCard ratio="square" missing={{ label: 'Hero image card missing for this page.' }} />
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — non-visual wiring assertions
   ═══════════════════════════════════════════════════════════════ */

/**
 * `HeroMediaCard` owns no interactivity, so a consumer wanting the whole
 * card as a single tap target wraps it in `<Card href>` instead of nesting
 * a second interactive control inside the card. This asserts exactly one
 * interactive descendant (the outer `<Card href>` anchor) renders — no
 * nested `<button>`/`<a>` from `HeroMediaCard` itself.
 *
 * @summary Inside `<Card href>`: no nested interactive control
 */
export const InteractionTestComposedInCard: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <div style={{ width: 320 }}>
      <Card href="#pricing-detail" data-testid="outer-card">
        <HeroMediaCard as="div">
          <HeroMediaCardImage
            src={placeholderImage(320, 320, '#eaf1fb', '#1f3d70', 'Hero')}
            alt=""
            ratio="square"
          />
          <HeroMediaCardPrice label="Starting at" value="$99/mo" />
        </HeroMediaCard>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outerCard = canvas.getByTestId('outer-card');
    await expect(outerCard.tagName).toBe('A');
    // Exactly one interactive descendant — the outer <Card href> anchor.
    // HeroMediaCard/-Image/-Price render no nested <button>/<a>.
    const interactive = canvasElement.querySelectorAll('a, button');
    await expect(interactive.length).toBe(1);
    await expect(interactive[0]).toBe(outerCard);
  },
};
