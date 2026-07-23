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
  title: 'Blueprints/hero_interior_minimal',
  component: HeroInteriorMinimal,
  tags: ['surface-web', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  argTypes: {
    section: { control: false, description: 'Section content shape — sectionKey, heading, subheading, body, cta, items, visualNotes. Set in code.' },
    clientFacts: { control: false, description: 'Site-wide client facts (brand, contact, services). Set in code.' },
    theme: { control: false, description: 'Theme + archetype config — mode, atmosphere, nav/footer archetype. Set in code.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HeroInteriorMinimal>;

/** @summary Default — eyebrow + h1 + lead, no CTA. */
export const Default: Story = {
  args: { section: interiorSection, clientFacts: baseClientFacts, theme: baseTheme },
};

// `cta` presence and eyebrow/lead omission are content variations expressed
// through `section` (Q2) — not separate stories. Default carries the canonical
// interior-hero shape.
