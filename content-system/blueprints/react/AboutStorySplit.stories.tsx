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

const section: BlueprintProps['section'] = {
  sectionKey: 'about-story-default',
  sectionType: 'content_block',
  heading: 'A story-led section that introduces the brand.',
  subheading: 'Who we are',
  body: 'A short paragraph of about-copy that sets context for the visitor — who you are, what you do, and the posture you bring to the work. Long enough to set the type rhythm but short enough that a visitor will actually read it.',
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
      title: 'Sample Quote, Role',
      description:
        'A short pull-quote that reinforces the section narrative — typically two sentences attributed to a leader or customer.',
    },
  ],
};

const meta: Meta<typeof AboutStorySplit> = {
  title: 'Blueprints/about_story_split',
  component: AboutStorySplit,
  tags: ['surface-web', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  argTypes: {
    section: { control: false, description: 'Section content shape — sectionKey, heading, subheading, body, cta, items, visualNotes. Set in code.' },
    clientFacts: { control: false, description: 'Site-wide client facts (brand, contact, services). Set in code.' },
    theme: { control: false, description: 'Theme + archetype config — mode, atmosphere, nav/footer archetype. Set in code.' },
  },
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
