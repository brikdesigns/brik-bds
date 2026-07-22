import type { Meta, StoryObj } from '@storybook/react-vite';

import { HeroInteriorMinimal } from './HeroInteriorMinimal';
import type { BlueprintProps } from '../astro/types';

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

const interiorSection: BlueprintProps['section'] = {
  sectionKey: 'hero-interior-default',
  sectionType: 'hero',
  heading: 'Interior page headline.',
  subheading: 'Section',
  body: 'A short interior-page lead — one sentence of supporting copy that frames the page topic without competing with the headline.',
  cta: null,
  visualNotes: {
    blueprintKey: 'hero_interior_minimal',
    moodKeywords: ['professional'],
    layoutBlueprint: 'hero_interior_minimal',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const meta: Meta<typeof HeroInteriorMinimal> = {
  title: 'Sections/Blueprints/hero_interior_minimal',
  component: HeroInteriorMinimal,
  tags: ['surface-web', 'surface-shared', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HeroInteriorMinimal>;

/** @summary Default — eyebrow + h1 + lead, no CTA. */
export const Default: Story = {
  args: { section: interiorSection, clientFacts: baseClientFacts, theme: baseTheme },
};

/** @summary With CTA — interior page with a primary action. */
export const WithCta: Story = {
  args: {
    section: {
      ...interiorSection,
      sectionKey: 'hero-interior-with-cta',
      cta: { label: 'See examples', url: '#' },
    },
    clientFacts: baseClientFacts,
    theme: baseTheme,
  },
};

/** @summary Headline-only — no eyebrow, no lead, no CTA. */
export const HeadlineOnly: Story = {
  args: {
    section: {
      ...interiorSection,
      sectionKey: 'hero-interior-headline-only',
      subheading: null,
      body: null,
    },
    clientFacts: baseClientFacts,
    theme: baseTheme,
  },
};
