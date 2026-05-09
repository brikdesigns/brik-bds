import type { Meta, StoryObj } from '@storybook/react-vite';

import { ServicesDetailTwoColumn } from './ServicesDetailTwoColumn';
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
  sectionKey: 'services-two-col-default',
  sectionType: 'services',
  heading: 'What we do',
  subheading: 'Services',
  body: 'A complete operating system for visual communication — from brand to operations.',
  cta: null,
  visualNotes: {
    blueprintKey: 'services_detail_two_column',
    moodKeywords: ['professional'],
    layoutBlueprint: 'services_detail_two_column',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [
    { title: 'Brand', description: 'Identity systems that scale.' },
    { title: 'Marketing', description: 'Web, email, and social that ties to growth.' },
    { title: 'Information Design', description: 'Make complex data scannable and on-brand.' },
    { title: 'Product', description: 'Interface design for the apps your business runs on.' },
    { title: 'Back Office', description: 'Operations design — SOPs, automation, internal tools.' },
    { title: 'Continuity Plans', description: 'Predictable monthly partnership for ongoing work.' },
  ],
};

const meta: Meta<typeof ServicesDetailTwoColumn> = {
  title: 'Blueprints/services_detail_two_column',
  component: ServicesDetailTwoColumn,
  tags: ['surface-web', 'surface-shared'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ServicesDetailTwoColumn>;

/** @summary Six services in a 2-column grid. */
export const Default: Story = {
  args: { section, clientFacts: baseClientFacts, theme: baseTheme },
};

/** @summary Three services — minimum useful row count. */
export const ThreeItems: Story = {
  args: {
    section: {
      ...section,
      sectionKey: 'services-two-col-3-items',
      items: section.items.slice(0, 3),
    },
    clientFacts: baseClientFacts,
    theme: baseTheme,
  },
};
