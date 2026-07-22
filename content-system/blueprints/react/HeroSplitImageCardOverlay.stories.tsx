import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
import type { BlueprintProps } from '../astro/types';

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

const baseTheme: BlueprintProps['theme'] = {
  themeMode: 'light',
  atmosphere: 'none',
  navigationArchetype: 'utility-first',
  footerArchetype: 'four_col_directory',
};

const baseClientFacts: BlueprintProps['clientFacts'] = {
  brandName: 'Acme',
  tagline: null,
  valueProposition: null,
  services: [],
  phone: null,
  email: null,
  address: null,
  hours: [],
  heroImageUrl: null,
  logoUrl: null,
  logoVariants: {},
};

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
  title: 'Sections/Blueprints/hero_split_image_card_overlay',
  component: HeroSplitImageCardOverlay,
  tags: ['surface-web', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  decorators: [withAudienceCascade],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interior-page hero blueprint. 58/42 split: left column carries the page trail (breadcrumb, eyebrow, h1, optional body, single dark CTA) on a soft audience-tinted background; right column shows a white image card with optional price overlay. Drives `/services/{cat}/{slug}` style pages — the failure zone where agents previously improvised layouts because no canonical block covered the shape. Service-line tinting is a `data-service-line` cascade: BDS ships the pattern, consumer sites declare the per-audience color values. The Playground fixture mirrors `brikdesigns.com/service/layout-design`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroSplitImageCardOverlay>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Canonical interior service-page hero.
 */
export const Playground: Story = {
  args: baseProps,
};

/**
 * @summary Landscape photography variant — opt in via `imageRatio="landscape"`
 * when the priceCard image is a 4:3 photo rather than a 1:1 illustration.
 * The default is `square` because Brik's CMS service/plan illustrations are
 * uploaded at 1:1; this variant documents how callers with landscape source
 * assets opt out.
 */
export const LandscapePhotography: Story = {
  args: {
    ...baseProps,
    imageRatio: 'landscape',
    section: {
      ...interiorHeroSection,
      sectionKey: 'hero-img-card-landscape',
      priceCard: {
        ...interiorHeroSection.priceCard!,
        imageUrl: 'https://placehold.co/640x480/eaf1fb/1f3d70?text=Landscape+Photo',
      },
    },
  },
};

/**
 * @summary Service-tag opt-out — `showServiceTag={false}` suppresses the
 * eyebrow icon/ServiceTag slot while `serviceLine` still drives the
 * `data-service-line` color theming (note the tint is unchanged from Playground).
 * For support-plan heroes that want the service-line tint without a service-line
 * badge — brikdesigns.com #452.
 */
export const NoServiceTag: Story = {
  args: {
    ...baseProps,
    showServiceTag: false,
    section: {
      ...interiorHeroSection,
      sectionKey: 'hero-img-card-no-tag',
    },
  },
};

/**
 * @summary Decorative icon slot (#849) — pass `icon` (a rendered SVG/Image node)
 * to render a purely-decorative eyebrow with no `img`/`alt` semantics. The
 * blueprint wraps it in an `aria-hidden` span, so screen readers skip it. Takes
 * precedence over `iconUrl` and the `audience` ServiceTag; `iconUrl` still works
 * unchanged for callers that pass a URL.
 */
export const DecorativeIconSlot: Story = {
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
 * @summary Medium price-card CTA — opt in via `priceCard.cta.size="md"`.
 * The default is `sm` (see Playground); support-plan heroes that want a
 * weightier price-card action pass `md`. brikdesigns.com #453.
 */
export const PriceCardCtaMd: Story = {
  args: {
    ...baseProps,
    section: {
      ...interiorHeroSection,
      sectionKey: 'hero-img-card-cta-md',
      priceCard: {
        ...interiorHeroSection.priceCard!,
        cta: { ...interiorHeroSection.priceCard!.cta!, size: 'md' },
      },
    },
  },
};

/**
 * @summary Action CTA — pass `onPriceCtaClick` to intercept the price-card CTA
 * and run an in-page handler (e.g. open a modal) instead of navigating. The
 * `priceCard.cta.url` stays as the rendered `href`, so the link still works as
 * a no-JS / SEO fallback (progressive enhancement). Click the CTA and watch the
 * Actions panel: the handler fires and navigation is suppressed. Astro-rendered
 * blueprints never receive this prop and keep the plain anchor. (brik-bds#843)
 */
export const PriceCtaAsAction: Story = {
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
 * @summary Native action CTA (#941) — when `priceCard.cta` carries an
 * `onClick` (instead of a `url`), the blueprint renders a real `<button>`
 * with button semantics — no href, no anchor. This is the first-class way
 * to wire a CTA to client behavior (open a modal, etc.), distinct from the
 * `onPriceCtaClick` link-intercept above (#843), which keeps a URL fallback.
 * Use this when there is no meaningful no-JS destination.
 */
export const PriceCtaActionButton: Story = {
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
 * @summary Price-suppressed card (#500) — omit `priceCard.price`/`priceLabel`
 * to render the deliverable image + CTA with no price overlay text. The
 * blueprint guards both the label (`priceLabel && price`) and the value
 * (`price`), so a priceCard carrying only an image and a CTA renders an
 * image-and-action card — the shape for services with no fixed/published price.
 */
export const NoPrice: Story = {
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
