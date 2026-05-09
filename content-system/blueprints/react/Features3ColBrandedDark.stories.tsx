import type { Meta, StoryObj } from '@storybook/react-vite';

import { Features3ColBrandedDark } from './Features3ColBrandedDark';
import type { BlueprintProps } from '../astro/types';

/* ─── Demo data-audience cascade ────────────────────────────────────
 *
 * BDS ships the scope-binding pattern but not audience-specific values
 * — those live in each consumer's globals.css. Storybook needs the
 * binding present somewhere so cards visualize in the right brand
 * colors. This `<style>` block mirrors what brikdesigns.com would
 * declare for its five service-line audiences.
 *
 * Per the cascade rules (`docs/theming/client-themes`), we re-bind
 * `--background-brand-primary` and the related brand-* tokens inside
 * the `[data-audience='X']` subtree. Components stay scope-blind.
 */
const audienceCascadeStyles = `
[data-audience='brand'] {
  --background-brand-primary: var(--theme-yellow-yellow-light);
  --brand-primary: var(--theme-yellow-yellow-light);
  --text-brand-primary: var(--theme-yellow-yellow-dark);
}
[data-audience='marketing'] {
  --background-brand-primary: var(--theme-green-green-light);
  --brand-primary: var(--theme-green-green-light);
  --text-brand-primary: var(--theme-green-green-dark);
}
[data-audience='information'] {
  --background-brand-primary: var(--theme-blue-blue-light);
  --brand-primary: var(--theme-blue-blue-light);
  --text-brand-primary: var(--theme-blue-blue-dark);
}
[data-audience='product'] {
  --background-brand-primary: var(--theme-purple-purple-light);
  --brand-primary: var(--theme-purple-purple-light);
  --text-brand-primary: var(--theme-purple-purple-dark);
}
[data-audience='service'] {
  --background-brand-primary: var(--theme-orange-orange-light);
  --brand-primary: var(--theme-orange-orange-light);
  --text-brand-primary: var(--theme-orange-orange-dark);
}
`;

/* ─── Fixtures ─────────────────────────────────────────────────── */

const baseTheme: BlueprintProps['theme'] = {
  themeMode: 'dark',
  atmosphere: 'none',
  navigationArchetype: 'utility-first',
  footerArchetype: 'four_col_directory',
};

const baseClientFacts: BlueprintProps['clientFacts'] = {
  brandName: 'Brik Designs',
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
 * "Other Service Lines" fixture — the brikdesigns.com cross-sell
 * module shown at the bottom of each /services/{slug} page. Three
 * cards in service-line-distinct brand colors.
 */
const otherServiceLinesSection: BlueprintProps['section'] = {
  sectionKey: 'features-branded-dark-default',
  sectionType: 'features',
  heading: 'Other Service Lines',
  subheading: null,
  body: 'A complete operating system for visual communication — explore the parts you haven’t yet.',
  cta: null,
  visualNotes: {
    blueprintKey: 'features_3col_branded_dark',
    moodKeywords: ['bold', 'modern'],
    layoutBlueprint: 'features_3col_branded_dark',
    imageOpportunity: '3D illustration per service line',
    animationSuggestion: null,
    illustrationOpportunity: 'service-line scene per card',
  },
  items: [
    {
      title: 'Brand',
      description: 'Logo, identity, and brand systems that scale.',
      href: '/services/brand',
      audience: 'brand',
    },
    {
      title: 'Marketing',
      description: 'Web, email, and social design tied to growth metrics.',
      href: '/services/marketing',
      audience: 'marketing',
    },
    {
      title: 'Back Office',
      description: 'Operations design — SOPs, automation, internal tooling.',
      href: '/services/back-office',
      audience: 'service',
    },
  ],
};

const baseProps: BlueprintProps = {
  section: otherServiceLinesSection,
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

const meta: Meta<typeof Features3ColBrandedDark> = {
  title: 'Blueprints/features_3col_branded_dark',
  component: Features3ColBrandedDark,
  tags: ['surface-web', 'surface-shared'],
  decorators: [withAudienceCascade],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dark section with a 3-column grid of brand-colored cards. Each card emits `data-audience` to re-bind `--background-brand-primary` for that subtree per the BDS scope-binding pattern (`docs/theming/client-themes`). Stories include a demo cascade block that mirrors the brikdesigns.com five service-line bindings; consumer sites must declare an equivalent block. Card title uses bold weight + 18px, description 16px regular — the AA-clearing posture for white-on-saturated-brand backgrounds (BDS contrast burndown #40).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Features3ColBrandedDark>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Three cards — brand / marketing / back-office. The brikdesigns "Other Service Lines" fixture.
 */
export const Default: Story = {
  args: baseProps,
};

/**
 * @summary Two cards — narrow grid, centers on desktop.
 */
export const TwoCards: Story = {
  args: {
    ...baseProps,
    section: {
      ...otherServiceLinesSection,
      sectionKey: 'features-branded-dark-2-cards',
      items: otherServiceLinesSection.items.slice(0, 2),
    },
  },
};

/**
 * @summary Four cards — wraps to a second row at the desktop breakpoint.
 */
export const FourCards: Story = {
  args: {
    ...baseProps,
    section: {
      ...otherServiceLinesSection,
      sectionKey: 'features-branded-dark-4-cards',
      items: [
        ...otherServiceLinesSection.items,
        {
          title: 'Information',
          description: 'Make complex information scannable and on-brand.',
          href: '/services/information',
          audience: 'information',
        },
      ],
    },
  },
};

/**
 * @summary No images — falls back to oversized ServiceTag icon per card.
 */
export const NoImages: Story = {
  args: {
    ...baseProps,
    section: {
      ...otherServiceLinesSection,
      sectionKey: 'features-branded-dark-no-images',
      items: otherServiceLinesSection.items.map((item) => ({
        ...item,
        imageUrl: undefined,
      })),
    },
  },
};

/**
 * @summary Atmosphere overlay — `editorial-luxury` — verifies the dark surface stays compatible.
 */
export const AtmosphereEditorialLuxury: Story = {
  args: {
    ...baseProps,
    theme: { ...baseTheme, atmosphere: 'editorial-luxury' },
  },
};
