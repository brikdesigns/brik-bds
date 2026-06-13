import type { Meta, StoryObj } from '@storybook/react-vite';

import { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
import type { BlueprintProps } from '../astro/types';

/* ─── Demo data-audience cascade ────────────────────────────────────
 *
 * BDS ships the scope-binding pattern; consumer sites declare the
 * audience-specific values. This <style> block mirrors what
 * brikdesigns.com declares for its five service-line audiences so
 * the canonical "Information" hero renders against the same blue
 * tint as the live site.
 */
const audienceCascadeStyles = `
[data-audience='brand'] {
  --page-brand-primary: var(--theme-yellow-yellow-light);
  --text-brand-primary: var(--theme-yellow-yellow-dark);
}
[data-audience='marketing'] {
  --page-brand-primary: var(--theme-green-green-light);
  --text-brand-primary: var(--theme-green-green-dark);
}
[data-audience='information'] {
  --page-brand-primary: var(--color-blue-light);
  --text-brand-primary: var(--color-blue-dark);
}
[data-audience='product'] {
  --page-brand-primary: var(--theme-purple-purple-light);
  --text-brand-primary: var(--theme-purple-purple-dark);
}
[data-audience='service'] {
  --page-brand-primary: var(--theme-orange-orange-light);
  --text-brand-primary: var(--theme-orange-orange-dark);
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
  audience: 'information',
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
    <style dangerouslySetInnerHTML={{ __html: audienceCascadeStyles }} />
    <Story />
  </>
);

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof HeroSplitImageCardOverlay> = {
  title: 'Sections/Blueprints/hero_split_image_card_overlay',
  component: HeroSplitImageCardOverlay,
  tags: ['surface-web', 'surface-shared'],
  decorators: [withAudienceCascade],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interior-page hero blueprint. 58/42 split: left column carries the page trail (breadcrumb, eyebrow, h1, optional body, single dark CTA) on a soft audience-tinted background; right column shows a white image card with optional price overlay. Drives `/services/{cat}/{slug}` style pages — the failure zone where agents previously improvised layouts because no canonical block covered the shape. Audience tinting is a `data-audience` cascade: BDS ships the pattern, consumer sites declare the per-audience color values. The Playground fixture mirrors `brikdesigns.com/service/layout-design`.',
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
 * eyebrow icon/ServiceTag slot while `audience` still drives the
 * `data-audience` color theming (note the tint is unchanged from Playground).
 * For support-plan heroes that want the audience tint without a service-line
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
