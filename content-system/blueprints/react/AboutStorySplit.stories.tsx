import type { Meta, StoryObj } from '@storybook/react-vite';

import { AboutStorySplit } from './AboutStorySplit';
import type { BlueprintProps } from '../astro/types';

const baseTheme: BlueprintProps['theme'] = {
  themeMode: 'light',
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

const section: BlueprintProps['section'] = {
  sectionKey: 'about-story-default',
  sectionType: 'content_block',
  heading: 'A studio that compounds your design budget.',
  subheading: 'Who we are',
  body: 'Brik Designs is a Tennessee studio that pairs strategic thinking with execution speed. Our retainer clients see compounding returns because every quarter builds on the last — brand, marketing, and operations design treated as one system, not three vendors.',
  cta: null,
  visualNotes: {
    blueprintKey: 'about_story_split',
    moodKeywords: ['warm', 'professional'],
    layoutBlueprint: 'about_story_split',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [
    {
      title: 'Aaron Stanerson, Founder',
      description:
        'Brik isn’t a design vendor — it’s a long-term partner that lives inside the metrics it’s trying to move.',
    },
  ],
};

const meta: Meta<typeof AboutStorySplit> = {
  title: 'Theming/Blueprints/about_story_split',
  component: AboutStorySplit,
  tags: ['surface-web', 'surface-shared'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AboutStorySplit>;

/** @summary Narrative + pull-quote callout. */
export const Default: Story = {
  args: { section, clientFacts: baseClientFacts, theme: baseTheme },
};

/** @summary Narrative only — no pull-quote callout. */
export const NarrativeOnly: Story = {
  args: {
    section: {
      ...section,
      sectionKey: 'about-story-narrative-only',
      items: [],
    },
    clientFacts: baseClientFacts,
    theme: baseTheme,
  },
};
