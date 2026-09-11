/**
 * Section fixtures for the pre-rendered Astro blueprint stories (ADR-039, #2339).
 *
 * Each fixture is the SAME section shape the React twin's story already uses, so
 * an Astro entry and its React entry differ only by rail. That is the whole point
 * of the coverage — "a reviewer comparing rails is comparing one rail against
 * nothing" (#2339). Divergence in the fixture would hide divergence in the rail.
 *
 * Consumed by `scripts/render-astro-blueprints.mjs` in Node, never by a story
 * directly — `astro/container` cannot run in the browser bundle.
 *
 * Keep this file fixture-only: no rendering, no framework imports.
 */
import type { BlueprintProps } from '../types';
import { placeholderImage } from '../../react/_fixtures';

type Section = BlueprintProps['section'];

const heroSplit: Section = {
  sectionKey: 'hero-split-default',
  sectionType: 'hero',
  heading: 'A clear, compelling headline goes here.',
  subheading: 'Acme',
  body: 'One or two sentences of supporting copy — long enough to set the rhythm of body type next to the headline without overwhelming it.',
  cta: { label: 'Learn more', url: '#' },
  visualNotes: {
    blueprintKey: 'hero_split',
    moodKeywords: ['professional', 'modern'],
    layoutBlueprint: 'hero_split',
    imageOpportunity: 'studio photography',
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const heroInteriorMinimal: Section = {
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

const heroWithPricingCard: Section = {
  sectionKey: 'hero-img-card-default',
  sectionType: 'hero',
  heading: 'Service detail headline.',
  subheading: 'CATEGORY',
  body: 'A short interior-hero paragraph describing what this page covers — typically two or three sentences of supporting context before the visitor reaches the deliverable cards or pricing.',
  cta: { label: 'View details', url: '#' },
  breadcrumb: [
    { label: 'All services', href: '#' },
    { label: 'Category', href: '#' },
    { label: 'Service detail' },
  ],
  serviceLine: 'information',
  priceCard: {
    imageUrl: placeholderImage(600, 600, '#eaf1fb', '#1f3d70', 'Deliverable'),
    imageAlt: '',
    priceLabel: 'Starting at',
    price: '$249',
    cta: { label: 'Get in touch', url: '#contact' },
  },
  visualNotes: {
    blueprintKey: 'hero_split_image_card_overlay',
    moodKeywords: ['approachable', 'modern'],
    layoutBlueprint: 'hero_split_image_card_overlay',
    imageOpportunity: 'service-deliverable photo',
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const ctaDefault: Section = {
  sectionKey: 'cta-dark-centered-default',
  sectionType: 'cta',
  heading: 'Ready to get started?',
  subheading: null,
  body: 'A closing prompt that earns the click — short, action-oriented, and specific to what the visitor gets after they tap the CTA.',
  cta: { label: 'Get in touch', url: '#contact' },
  visualNotes: {
    blueprintKey: 'cta_centered',
    moodKeywords: ['bold'],
    layoutBlueprint: 'cta_centered',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const ctaSplit: Section = {
  sectionKey: 'cta-split-contact-default',
  sectionType: 'cta',
  heading: 'Talk to a real person',
  subheading: null,
  body: 'Prefer to reach out directly? Call or email and someone on the team gets back to you the same day.',
  cta: { label: 'Start a project', url: '#start' },
  visualNotes: {
    blueprintKey: 'cta_split_contact',
    moodKeywords: ['approachable'],
    layoutBlueprint: 'cta_split_contact',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const cardGrid: Section = {
  sectionKey: 'services-grid-default',
  sectionType: 'services',
  heading: 'Featured services',
  subheading: 'Acme',
  body: 'A one-line section subheading that frames the service catalog below.',
  cta: null,
  visualNotes: {
    blueprintKey: 'card_grid',
    moodKeywords: ['approachable', 'modern'],
    layoutBlueprint: 'card_grid',
    imageOpportunity: 'illustration per card',
    animationSuggestion: null,
    illustrationOpportunity: 'scene per service',
  },
  items: [
    {
      title: 'Service one',
      description: 'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: placeholderImage(480, 320, '#eaf1fb', '#1f3d70', 'Service One'),
      category: 'information',
    },
    {
      title: 'Service two',
      description: 'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: placeholderImage(480, 320, '#eaf1fb', '#1f3d70', 'Service Two'),
      category: 'information',
      hasOptions: true,
    },
    {
      title: 'Service three',
      description: 'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: placeholderImage(480, 320, '#eaf1fb', '#1f3d70', 'Service Three'),
      category: 'information',
    },
  ],
};

const cardGridTwoColumnList: Section = {
  sectionKey: 'services-two-col-default',
  sectionType: 'services',
  heading: 'What we do',
  subheading: 'Services',
  body: 'A one-line section subheading that frames the service catalog below — short enough to scan, specific enough to set expectations.',
  cta: null,
  visualNotes: {
    blueprintKey: 'two_column_detail',
    moodKeywords: ['professional'],
    layoutBlueprint: 'two_column_detail',
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

const about: Section = {
  sectionKey: 'about-story-default',
  sectionType: 'content_block',
  heading: 'A story-led section that introduces the brand.',
  subheading: 'Who we are',
  body: 'A short paragraph of about-copy that sets context for the visitor — who you are, what you do, and the posture you bring to the work. Long enough to set the type rhythm but short enough that a visitor will actually read it.',
  cta: null,
  visualNotes: {
    blueprintKey: 'story_split',
    moodKeywords: ['warm', 'professional'],
    layoutBlueprint: 'story_split',
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

const features: Section = {
  sectionKey: 'features-branded-dark-default',
  sectionType: 'features',
  heading: 'Featured capabilities',
  subheading: null,
  body: 'A short section subheading that frames the cards below — typically a cross-sell or capability roll-up.',
  cta: null,
  visualNotes: {
    blueprintKey: 'feature_grid',
    moodKeywords: ['bold', 'modern'],
    layoutBlueprint: 'feature_grid',
    imageOpportunity: 'illustration per card',
    animationSuggestion: null,
    illustrationOpportunity: 'scene per card',
  },
  items: [
    {
      title: 'Capability one',
      description: 'A two-line card description that sets the type rhythm without competing with the title.',
      href: '#',
      serviceLine: 'brand',
    },
    {
      title: 'Capability two',
      description: 'A two-line card description that sets the type rhythm without competing with the title.',
      href: '#',
      serviceLine: 'marketing',
    },
    {
      title: 'Capability three',
      description: 'A two-line card description that sets the type rhythm without competing with the title.',
      href: '#',
      serviceLine: 'service',
    },
  ],
};

const calloutPanel: Section = {
  sectionKey: 'support-plan-default',
  sectionType: 'cta',
  heading: 'Monthly support services',
  subheading: null,
  body: 'A short subheading that frames the support offering — what the visitor gets and why it matters to them.',
  cta: { label: 'Learn more', url: '#' },
  visualNotes: {
    blueprintKey: 'callout_split',
    moodKeywords: ['approachable', 'warm'],
    layoutBlueprint: 'callout_split',
    imageOpportunity: 'persona avatars + photo tile',
    animationSuggestion: null,
    illustrationOpportunity: 'persona-cluster scene',
  },
  items: [
    {
      title: 'Monthly Support Plan',
      description:
        'A two- or three-sentence description of the plan offering — what the cadence covers, what the deliverables look like, and what the visitor walks away with after signing up.',
    },
  ],
};

const statsDarkBar: Section = {
  sectionKey: 'stats-bar-default',
  sectionType: 'stats',
  heading: 'By the numbers',
  subheading: null,
  body: null,
  cta: null,
  visualNotes: {
    blueprintKey: 'stats_bar',
    moodKeywords: ['bold', 'professional'],
    layoutBlueprint: 'stats_bar',
    imageOpportunity: null,
    animationSuggestion: 'count-up on scroll into view',
    illustrationOpportunity: null,
  },
  items: [
    { title: '12', description: 'Years in practice' },
    { title: '4,800+', description: 'Patients served' },
    { title: '98%', description: 'Would recommend' },
    { title: '24h', description: 'Average response time' },
  ],
};

const testimonialsFeaturedLarge: Section = {
  sectionKey: 'testimonials-featured-default',
  sectionType: 'testimonials',
  heading: 'What clients say',
  subheading: null,
  body: null,
  cta: null,
  visualNotes: {
    blueprintKey: 'testimonials_featured_large',
    moodKeywords: ['trustworthy', 'warm'],
    layoutBlueprint: 'testimonials_featured_large',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [
    {
      title: 'Sample Name · Role · Company',
      description:
        'A two- or three-sentence quote that says what changed for this client — the situation before, the work, and the outcome they can point at.',
    },
  ],
};

/** Keyed `Block` or `Block:layout` — the renderer resolves the layout axis first. */
const SECTIONS: Record<string, Section> = {
  'Hero:split': heroSplit,
  'Hero:interior-minimal': heroInteriorMinimal,
  'Hero:with-pricing-card': heroWithPricingCard,
  'Cta:default': ctaDefault,
  'Cta:split': ctaSplit,
  'CardGrid:card-grid': cardGrid,
  'CardGrid:two-column-list': cardGridTwoColumnList,
  About: about,
  Features: features,
  CalloutPanel: calloutPanel,
  StatsDarkBar: statsDarkBar,
  TestimonialsFeaturedLarge: testimonialsFeaturedLarge,
};

/** Resolves the fixture for a block, optionally narrowed to one layout. */
export function sectionFor(block: string, layout: string | null): Section {
  const key = layout ? `${block}:${layout}` : block;
  const section = SECTIONS[key];
  if (!section) throw new Error(`No section fixture for "${key}" — add one to sections.ts`);
  return section;
}
