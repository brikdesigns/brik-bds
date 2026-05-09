import type { Meta, StoryObj } from '@storybook/react-vite';

import { HeroSplit6040 } from './HeroSplit6040';
import type { BlueprintProps } from '../astro/types';

const baseTheme: BlueprintProps['theme'] = {
  themeMode: 'light',
  atmosphere: 'none',
  navigationArchetype: 'utility-first',
  footerArchetype: 'four_col_directory',
};

const facts = (heroImageUrl: string | null): BlueprintProps['clientFacts'] => ({
  brandName: 'Brik Designs',
  tagline: null,
  valueProposition: null,
  services: [],
  phone: null,
  email: null,
  address: null,
  hours: [],
  heroImageUrl,
  logoUrl: null,
  logoVariants: {},
});

const section: BlueprintProps['section'] = {
  sectionKey: 'hero-split-default',
  sectionType: 'hero',
  heading: 'Strategic design that compounds.',
  subheading: 'Brik Designs',
  body: 'Brand systems, marketing, information design, and back-office tooling — under one roof.',
  cta: { label: 'See our work', url: '/work' },
  visualNotes: {
    blueprintKey: 'hero_split_60_40',
    moodKeywords: ['professional', 'modern'],
    layoutBlueprint: 'hero_split_60_40',
    imageOpportunity: 'studio photography',
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const meta: Meta<typeof HeroSplit6040> = {
  title: 'Theming/Blueprints/hero_split_60_40',
  component: HeroSplit6040,
  tags: ['surface-web', 'surface-shared'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HeroSplit6040>;

/** @summary Default — full hero with content + photo. */
export const Default: Story = {
  args: {
    section,
    clientFacts: facts('https://placehold.co/960x1200/eaf1fb/1f3d70?text=Hero'),
    theme: baseTheme,
  },
};

/** @summary Missing image — shows the data-content-needed stub for CI grep. */
export const MissingHeroImage: Story = {
  args: {
    section,
    clientFacts: facts(null),
    theme: baseTheme,
  },
};
