import type { Meta, StoryObj } from '@storybook/react-vite';

import { Services3ColCardGrid } from './Services3ColCardGrid';
import type { BlueprintProps } from '../astro/types';

/* ─── Fixtures ─────────────────────────────────────────────────── */

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

/**
 * "Information Design Services" fixture — six service cards modeled
 * on the brikdesigns.com /services/information page that drives this
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
  title: 'Blueprints/services_3col_card_grid',
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
 */
export const Default: Story = {
  args: baseProps,
};

/**
 * @summary No images — falls back to oversized ServiceTag icon per card.
 *
 * Illustration assets are optional. When the CMS hasn't supplied an
 * image, the blueprint shows the ServiceTag icon (sized up) inside
 * the 3:2 frame so the grid keeps consistent rhythm.
 */
export const NoImages: Story = {
  args: {
    ...baseProps,
    section: {
      ...informationServicesSection,
      sectionKey: 'services-grid-no-images',
      items: informationServicesSection.items.map((item) => ({
        ...item,
        imageUrl: undefined,
      })),
    },
  },
};

/**
 * @summary One card flagged with `hasOptions` — "Has Options" badge anchors top-right.
 */
export const HasOptions: Story = {
  args: {
    ...baseProps,
    section: {
      ...informationServicesSection,
      sectionKey: 'services-grid-has-options',
      items: informationServicesSection.items.slice(0, 3).map((item, idx) => ({
        ...item,
        hasOptions: idx === 1,
      })),
    },
  },
};

/**
 * @summary Mixed service categories — verifies the per-category accent color axis.
 *
 * The brikdesigns.com /services/ index page mixes all five categories
 * (brand, marketing, information, product, service). The card body's
 * ServiceTag adapts its accent color via the BDS `category` prop.
 */
export const MixedCategories: Story = {
  args: {
    ...baseProps,
    section: {
      ...informationServicesSection,
      sectionKey: 'services-grid-mixed',
      heading: 'All Services',
      subheading: 'Brik Designs',
      body: 'A category-spanning view — each card carries its service-line accent.',
      items: [
        {
          title: 'Brand Identity Bundle',
          description: 'Logo, type, color, and applications in one pass.',
          href: '/services/brand/brand-identity-bundle',
          imageUrl: 'https://placehold.co/480x320/fff4cc/5b4500?text=Brand',
          category: 'brand',
          hasOptions: true,
        },
        {
          title: 'Web Design & Development',
          description: 'Custom sites, content, and CMS — built for growth and easy edits.',
          href: '/services/marketing/web-design-development',
          imageUrl: 'https://placehold.co/480x320/d6f1da/1f5b2e?text=Marketing',
          category: 'marketing',
        },
        {
          title: 'Information Design',
          description: 'Make complex information scannable and on-brand.',
          href: '/services/information/information-design',
          imageUrl: 'https://placehold.co/480x320/d6e4f5/1f3d70?text=Information',
          category: 'information',
        },
      ],
    },
  },
};

/**
 * @summary Atmosphere overlay — `clean-bright`. Verifies blueprint surface tokens stay theme-layer.
 *
 * Renders the same default fixture but with `theme.atmosphere =
 * 'clean-bright'`. Use the Theme Switcher addon to swap atmospheres
 * — the blueprint must NOT redefine `--surface-*` / `--text-*` /
 * `--border-*` tokens; those stay theme-layer and atmosphere CSS
 * already overrides them.
 */
export const AtmosphereCleanBright: Story = {
  args: {
    ...baseProps,
    theme: { ...baseTheme, atmosphere: 'clean-bright' },
  },
};
