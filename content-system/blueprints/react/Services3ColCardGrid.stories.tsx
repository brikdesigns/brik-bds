import type { Meta, StoryObj } from '@storybook/react-vite';

import { Services3ColCardGrid } from './Services3ColCardGrid';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * "Information Design Services" fixture — six service cards modeled
 * on the brikdesigns.com `/services/information` page that drives this
 * blueprint. Image URLs are placeholder; the production CMS supplies
 * Webflow-hosted illustrations.
 */
const informationServicesSection: BlueprintProps['section'] = {
  sectionKey: 'services-grid-default',
  sectionType: 'services',
  heading: 'Information Design Services',
  subheading: 'Brik Designs',
  body: 'Make complex information scannable, memorable, and beautifully on-brand.',
  cta: null,
  visualNotes: {
    blueprintKey: 'services_3col_card_grid',
    moodKeywords: ['approachable', 'modern'],
    layoutBlueprint: 'services_3col_card_grid',
    imageOpportunity: 'service-line illustration per card',
    animationSuggestion: null,
    illustrationOpportunity: '3D persona scene per service',
  },
  items: [
    {
      title: 'Information Design',
      description:
        'Turn dense data and dense reports into a clean visual story your audience will actually read.',
      href: '/services/information/information-design',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Information+Design',
      category: 'information',
    },
    {
      title: 'Infographics',
      description:
        'One-screen explanations of how something works — for proposals, decks, and on-page content.',
      href: '/services/information/infographics',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Infographics',
      category: 'information',
      hasOptions: true,
    },
    {
      title: 'Patient Experience Mapping',
      description:
        'Visualize the patient journey end-to-end so every touchpoint can be improved with intent.',
      href: '/services/information/patient-experience-mapping',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Patient+Journey',
      category: 'information',
    },
    {
      title: 'Customer Journey Mapping',
      description:
        'A diagram of how customers find, evaluate, and stay with you — sized for a stakeholder readout.',
      href: '/services/information/customer-journey-mapping',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Customer+Journey',
      category: 'information',
    },
    {
      title: 'Process Documentation',
      description:
        'A repeatable visual SOP — the operations equivalent of a brand book — so handoffs survive growth.',
      href: '/services/information/process-documentation',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Process+Docs',
      category: 'information',
      hasOptions: true,
    },
    {
      title: 'Wayfinding & Signage',
      description:
        'On-brand signage systems that get patients, customers, and staff to the right place every time.',
      href: '/services/information/wayfinding',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Wayfinding',
      category: 'information',
    },
  ],
};

const baseProps: BlueprintProps = {
  section: informationServicesSection,
  clientFacts: baseClientFacts,
  theme: baseTheme,
};

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof Services3ColCardGrid> = {
  title: 'Theming/Blueprints/services_3col_card_grid',
  component: Services3ColCardGrid,
  tags: ['surface-web', 'surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Three-column service card grid blueprint. Drives the brikdesigns.com `/services/{slug}` index pages. Each card composes BDS primitives — Card frame, Frame for the 3:2 image, ServiceTag for the category badge, LinkButton for the "Learn more" CTA, and Badge for the optional "Has Options" pill. Description copy uses `--text-primary` to clear AA contrast at 14–16px (BDS contrast burndown #40).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Services3ColCardGrid>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Six "Information Design" service cards — the canonical fixture.
 *
 * Single Playground story per ADR-006: shape-only blueprint stories
 * carry one canonical state, not a fan-out of content variations.
 * Per-card affordances (`hasOptions`, missing `imageUrl`, accent
 * `category`) are exercised by the leaf component stories
 * (`Card.stories.tsx`, `ServiceTag.stories.tsx`, `Frame.stories.tsx`).
 * Atmosphere variants are switched via the Theme Switcher addon —
 * not encoded as separate stories.
 */
export const Playground: Story = {
  args: baseProps,
};
