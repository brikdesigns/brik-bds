import { useEffect, useRef, useState } from 'react';
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

/* ─── Service-surface AAA contrast matrix (brik-bds#838) ──────────────
 *
 * Proves the locked #836 pairing: the mode-INVARIANT pale `-light` surface
 * tone (= each hue's `-lightest` step) + the mode-invariant `-on-light`
 * (= `-darkest`) text clears AAA (≥7:1) for same-hue body text on all five
 * service lines. Both tokens are defined only in `:root` (NOT in the
 * `:root[data-theme="dark"]` override block), so they resolve identically in
 * light AND dark themes — toggle the theme toolbar (brik ↔ brik-dark) and the
 * measured ratios below do not move. The ratio badge is computed live from the
 * rendered colors via getComputedStyle, so it regresses loudly if a primitive
 * shifts. Verified values: marketing 8.31 · brand 8.40 · information 9.29 ·
 * product 11.43 · back-office 12.52 (:1). */

/* Full canonical token names are spelled out per hue (not interpolated) so
 * the static canonical-check / #839 lint gate can verify each name. */
const SERVICE_HUES = [
  { key: 'marketing', label: 'Marketing', surface: 'var(--surface-service-marketing-light)', text: 'var(--text-service-marketing-on-light)' },
  { key: 'brand', label: 'Brand', surface: 'var(--surface-service-brand-light)', text: 'var(--text-service-brand-on-light)' },
  { key: 'information', label: 'Information', surface: 'var(--surface-service-information-light)', text: 'var(--text-service-information-on-light)' },
  { key: 'product', label: 'Product', surface: 'var(--surface-service-product-light)', text: 'var(--text-service-product-on-light)' },
  { key: 'back-office', label: 'Back office', surface: 'var(--surface-service-back-office-light)', text: 'var(--text-service-back-office-on-light)' },
] as const;

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/\(([^)]+)\)/);
  if (!match) return [0, 0, 0];
  const parts = match[1].split(',').map((v) => parseFloat(v));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(parseRgb(fg));
  const l2 = relativeLuminance(parseRgb(bg));
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function ServiceSurfaceSwatch({ label, surface, text }: { label: string; surface: string; text: string }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!surfaceRef.current || !textRef.current) return;
    const bg = getComputedStyle(surfaceRef.current).backgroundColor;
    const fg = getComputedStyle(textRef.current).color;
    setRatio(contrastRatio(fg, bg));
  });

  const level = ratio == null ? '' : ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL';
  const badgeText = ratio == null ? '…' : `${level} · ${ratio.toFixed(2)}:1`;

  return (
    <div
      ref={surfaceRef}
      style={{
        background: surface,
        color: text,
        padding: 'var(--padding-lg)',
        borderRadius: 'var(--border-radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--gap-md)' }}>
        <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-md)', fontWeight: 'var(--font-weight-bold)' }}>
          {badgeText}
        </span>
      </div>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-md)' }}>
        Same-hue heading on the pale service surface
      </h3>
      <p ref={textRef} style={{ margin: 0, fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', maxWidth: '55ch' }}>
        Body copy in the service hue&rsquo;s <code>-darkest</code> step sits on the same hue&rsquo;s
        <code> -lightest</code> surface. This pairing is mode-invariant, so the contrast ratio shown
        above is identical whether the page is in the light or dark theme.
      </p>
    </div>
  );
}

/**
 * @summary AAA contrast proof for the five service-line pale surfaces.
 * Each panel renders same-hue body text on the canonical pale pairing and
 * reports a live-computed WCAG ratio. Toggle the theme toolbar to confirm the
 * ratios hold in dark mode (the tokens are mode-invariant by design).
 */
export const ServiceSurfaceContrastAAA: StoryObj = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Verifies brik-bds#838: same-hue body text on each of the five service `-lightest` surfaces clears WCAG AAA (≥7:1) in both themes. Ratios are computed live from the rendered colors, so a primitive regression turns a badge red.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-md)', maxWidth: '720px' }}>
      {SERVICE_HUES.map((hue) => (
        <ServiceSurfaceSwatch key={hue.key} label={hue.label} surface={hue.surface} text={hue.text} />
      ))}
    </div>
  ),
};
