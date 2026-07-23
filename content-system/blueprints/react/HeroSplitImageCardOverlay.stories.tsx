import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Demo data-service-line cascade ────────────────────────────────────
 *
 * BDS ships the scope-binding pattern; consumer sites declare the
 * audience-specific values. This <style> block mirrors what
 * brikdesigns.com declares for its five service-line audiences so
 * the canonical "Information" hero renders against the same blue
 * tint as the live site.
 */
const serviceLineCascadeStyles = `
[data-service-line='brand'] {
  --page-brand-primary: var(--color-yellow-light);
  --text-brand-primary: var(--color-yellow-dark);
}
[data-service-line='marketing'] {
  --page-brand-primary: var(--color-green-light);
  --text-brand-primary: var(--color-green-dark);
}
[data-service-line='information'] {
  --page-brand-primary: var(--color-blue-light);
  --text-brand-primary: var(--color-blue-dark);
}
[data-service-line='product'] {
  --page-brand-primary: var(--color-purple-light);
  --text-brand-primary: var(--color-purple-dark);
}
[data-service-line='service'] {
  --page-brand-primary: var(--color-orange-light);
  --text-brand-primary: var(--color-orange-dark);
}
`;

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * Canonical interior-hero fixture — service-detail page shape with
 * breadcrumb trail, audience-tinted background, and a price-overlay
 * card on the right. The shape (not the content) is what the blueprint
 * documents; consumer sites supply their own copy.
 */
const interiorHeroSection: BlueprintProps['section'] = {
  sectionKey: 'hero-img-card-default',
  sectionType: 'hero',
  heading: 'Service detail headline.',
  subheading: 'CATEGORY',
  body: 'A short interior-hero paragraph describing what this page covers — typically two or three sentences of supporting context before the visitor reaches the deliverable cards or pricing.',
  cta: { label: 'View details', url: '#' },
  breadcrumb: [
    { label: 'All services', href: '#' },
    { label: 'Category', href: '#' },
    { label: 'Service detail' },
  ],
  serviceLine: 'information',
  priceCard: {
    imageUrl: 'https://placehold.co/600x600/eaf1fb/1f3d70?text=Deliverable',
    imageAlt: '',
    priceLabel: 'Starting at',
    price: '$249',
    cta: { label: 'Get in touch', url: '#contact' },
  },
  visualNotes: {
    blueprintKey: 'hero_split_image_card_overlay',
    moodKeywords: ['approachable', 'modern'],
    layoutBlueprint: 'hero_split_image_card_overlay',
    imageOpportunity: 'service-deliverable photo',
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const baseProps: BlueprintProps = {
  section: interiorHeroSection,
  clientFacts: baseClientFacts,
  theme: baseTheme,
};

/* ─── Decorator — injects the demo audience cascade ─────────────── */

const withAudienceCascade = (Story: () => JSX.Element) => (
  <>
    <style dangerouslySetInnerHTML={{ __html: serviceLineCascadeStyles }} />
    <Story />
  </>
);

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof HeroSplitImageCardOverlay> = {
  title: 'Blueprints/hero_split_image_card_overlay',
  component: HeroSplitImageCardOverlay,
  tags: ['surface-web', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  decorators: [withAudienceCascade],
  argTypes: {
    section: { control: false, description: 'Section content shape — sectionKey, heading, subheading, body, cta, breadcrumb, priceCard, serviceLine. Set in code.' },
    clientFacts: { control: false, description: 'Site-wide client facts (brand, contact, services). Set in code.' },
    theme: { control: false, description: 'Theme + archetype config — mode, atmosphere, nav/footer archetype. Set in code.' },
    imageRatio: { control: 'inline-radio', options: ['square', 'landscape'], description: 'Price-card image aspect. Default `square` (1:1 CMS illustrations); `landscape` for 4:3 photos.' },
    showServiceTag: { control: 'boolean', description: 'Show the eyebrow ServiceTag slot. `false` keeps the `serviceLine` tint without the badge.' },
    icon: { control: false, description: 'Decorative eyebrow node (aria-hidden). Takes precedence over the ServiceTag.' },
    onPriceCtaClick: { control: false, description: 'Intercept the price-card CTA to run an in-page handler; the `url` stays as the no-JS/SEO href.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interior-page hero blueprint. 58/42 split: left column carries the page trail (breadcrumb, eyebrow, h1, optional body, single dark CTA) on a soft audience-tinted background; right column shows a white image card with optional price overlay. Drives `/services/{cat}/{slug}` style pages — the failure zone where agents previously improvised layouts because no canonical block covered the shape. Service-line tinting is a `data-service-line` cascade: BDS ships the pattern, consumer sites declare the per-audience color values. The Default fixture mirrors `brikdesigns.com/service/layout-design`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroSplitImageCardOverlay>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * The canonical interior service-page hero. `imageRatio`, `showServiceTag`,
 * `icon`/`iconUrl`, and `onPriceCtaClick` are Controls/argTypes on this story.
 *
 * @summary Canonical interior service-page hero
 */
export const Default: Story = {
  args: baseProps,
};

/* ─── Interaction tests — play-only, hidden from MCP discovery (Q5) ─── */

/**
 * Pass `icon` (a rendered SVG/Image node) to render a purely-decorative
 * eyebrow with no `img`/`alt` semantics — the blueprint wraps it in an
 * `aria-hidden` span. Takes precedence over `iconUrl` and the ServiceTag.
 *
 * @summary Decorative icon slot is aria-hidden
 */
export const InteractionTestDecorativeIconSlot: Story = {
  tags: ['!manifest'],
  args: {
    ...baseProps,
    icon: (
      <svg viewBox="0 0 40 40" role="presentation">
        <circle cx="20" cy="20" r="18" fill="currentColor" />
      </svg>
    ),
    section: {
      ...interiorHeroSection,
      sectionKey: 'hero-img-card-icon-slot',
    },
  },
  play: async ({ canvasElement }) => {
    // The decorative slot renders and is hidden from the a11y tree...
    const slot = canvasElement.querySelector('.bds-hero__icon-slot');
    await expect(slot).not.toBeNull();
    await expect(slot).toHaveAttribute('aria-hidden', 'true');
    // ...and the legacy raw-<img> eyebrow path is not used.
    await expect(
      canvasElement.querySelector('img.bds-hero__icon'),
    ).toBeNull();
  },
};

/**
 * Pass `onPriceCtaClick` to intercept the price-card CTA and run an in-page
 * handler instead of navigating. The `priceCard.cta.url` stays as the rendered
 * `href` (no-JS / SEO fallback). Astro-rendered blueprints never receive this
 * prop and keep the plain anchor. (brik-bds#843)
 *
 * @summary Price-CTA link intercept fires the handler
 */
export const InteractionTestPriceCtaAsAction: Story = {
  tags: ['!manifest'],
  args: {
    ...baseProps,
    onPriceCtaClick: fn(),
    section: {
      ...interiorHeroSection,
      sectionKey: 'hero-img-card-cta-action',
      priceCard: {
        ...interiorHeroSection.priceCard!,
        cta: { label: 'Get started', url: '/get-started' },
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cta = canvas.getByRole('link', { name: 'Get started' });
    await expect(cta).toBeVisible();
    // `url` is preserved as the rendered href — the no-JS / SEO fallback.
    await expect(cta).toHaveAttribute('href', '/get-started');
    // Clicking hands off to the consumer handler and suppresses navigation
    // (preventDefault): the spy fires once and the CTA stays mounted.
    await userEvent.click(cta);
    await expect(args.onPriceCtaClick).toHaveBeenCalledTimes(1);
    await expect(cta).toBeInTheDocument();
  },
};

/**
 * When `priceCard.cta` carries an `onClick` (instead of a `url`), the blueprint
 * renders a real `<button>` with button semantics — no href, no anchor. The
 * first-class way to wire a CTA to client behavior, distinct from the
 * `onPriceCtaClick` link-intercept above (#843). (#941)
 *
 * @summary onClick price-CTA renders a button
 */
export const InteractionTestPriceCtaActionButton: Story = {
  tags: ['!manifest'],
  args: {
    ...baseProps,
    section: {
      ...interiorHeroSection,
      sectionKey: 'hero-img-card-cta-action-button',
      priceCard: {
        ...interiorHeroSection.priceCard!,
        cta: { label: 'Open the form', onClick: fn() },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // An action CTA is a <button>, not a <link> — verify the semantics.
    const cta = canvas.getByRole('button', { name: 'Open the form' });
    await expect(cta).toBeVisible();
    await expect(canvas.queryByRole('link', { name: 'Open the form' })).toBeNull();
    // Clicking fires the config's own handler.
    await userEvent.click(cta);
  },
};

/**
 * Omit `priceCard.price`/`priceLabel` to render the deliverable image + CTA
 * with no price overlay text. The blueprint guards both the label
 * (`priceLabel && price`) and the value (`price`) — the shape for services
 * with no fixed/published price. (#500)
 *
 * @summary Price-suppressed card renders image + CTA
 */
export const InteractionTestNoPrice: Story = {
  tags: ['!manifest'],
  args: {
    ...baseProps,
    section: {
      ...interiorHeroSection,
      sectionKey: 'hero-img-card-no-price',
      priceCard: {
        imageUrl: 'https://placehold.co/600x600/eaf1fb/1f3d70?text=Deliverable',
        imageAlt: '',
        cta: { label: 'Request a quote', url: '#contact' },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Price text is suppressed — neither the label nor the value renders...
    await expect(canvasElement.querySelector('.bds-hero__price-label')).toBeNull();
    await expect(canvasElement.querySelector('.bds-hero__price-value')).toBeNull();
    // ...while the image card and its CTA still render.
    await expect(canvas.getByRole('link', { name: 'Request a quote' })).toBeVisible();
  },
};
