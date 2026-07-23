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
  sectionKey: 'services-two-col-default',
  sectionType: 'services',
  heading: 'What we do',
  subheading: 'Services',
  body: 'A one-line section subheading that frames the service catalog below — short enough to scan, specific enough to set expectations.',
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
    { title: 'Service one', description: 'A one-line description of the first service offering.' },
    { title: 'Service two', description: 'A one-line description of the second service offering.' },
    { title: 'Service three', description: 'A one-line description of the third service offering.' },
    { title: 'Service four', description: 'A one-line description of the fourth service offering.' },
    { title: 'Service five', description: 'A one-line description of the fifth service offering.' },
    { title: 'Service six', description: 'A one-line description of the sixth service offering.' },
  ],
};

const meta: Meta<typeof ServicesDetailTwoColumn> = {
  title: 'Blueprints/services_detail_two_column',
  component: ServicesDetailTwoColumn,
  tags: ['surface-web', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  argTypes: {
    section: { control: false, description: 'Section content shape — sectionKey, heading, subheading, body, cta, items, visualNotes. Set in code.' },
    clientFacts: { control: false, description: 'Site-wide client facts (brand, contact, services). Set in code.' },
    theme: { control: false, description: 'Theme + archetype config — mode, atmosphere, nav/footer archetype. Set in code.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ServicesDetailTwoColumn>;

/** @summary Six services in a 2-column grid. */
export const Default: Story = {
  args: { section, clientFacts: baseClientFacts, theme: baseTheme },
};

// Item count is a content variation through `section.items` (Q2) — not a
// separate story. Default carries the canonical six-service shape.
