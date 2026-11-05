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
  title: 'A clear, compelling headline goes here.',
  subtitle: 'Acme',
  body: 'One or two sentences of supporting copy — long enough to set the rhythm of body type next to the headline without overwhelming it.',
  cta: { label: 'Learn more', url: '#' },
  visualNotes: {
    blueprintKey: 'hero_split',
    moodKeywords: ['professional', 'modern'],
    layoutBlueprint: 'hero_split',
    imageOpportunity: 'studio photography',
    illustrationOpportunity: null,
  },
  items: [],
};

const heroInteriorMinimal: Section = {
  sectionKey: 'hero-interior-default',
  sectionType: 'hero',
  title: 'Interior page headline.',
  subtitle: 'Section',
  body: 'A short interior-page lead — one sentence of supporting copy that frames the page topic without competing with the headline.',
  cta: null,
  visualNotes: {
    blueprintKey: 'hero_interior_minimal',
    moodKeywords: ['professional'],
    layoutBlueprint: 'hero_interior_minimal',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [],
};

// `centered` has no dispatcher key (the dispatcher maps a key to one layout, and
// none maps to this one). The fixture borrows `hero_interior_minimal` only to
// satisfy the renderer's known-key assertion; the generated `Hero--centered`
// markup is rendered with an explicit `layout="centered"`, not via the key.
const heroCentered: Section = {
  ...heroInteriorMinimal,
  sectionKey: 'hero-centered-default',
  title: 'A centred headline.',
  subtitle: 'Section',
  body: 'A short centred lead — one sentence that frames the page without competing with the headline.',
  cta: { label: 'Learn more', url: '#' },
};

const heroWithPricingCard: Section = {
  sectionKey: 'hero-img-card-default',
  sectionType: 'hero',
  title: 'Service detail headline.',
  subtitle: 'CATEGORY',
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
    illustrationOpportunity: null,
  },
  items: [],
};

const ctaDefault: Section = {
  sectionKey: 'cta-dark-centered-default',
  sectionType: 'cta',
  title: 'Ready to get started?',
  subtitle: null,
  body: 'A closing prompt that earns the click — short, action-oriented, and specific to what the visitor gets after they tap the CTA.',
  cta: { label: 'Get in touch', url: '#contact' },
  visualNotes: {
    blueprintKey: 'cta_centered',
    moodKeywords: ['bold'],
    layoutBlueprint: 'cta_centered',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const ctaSplit: Section = {
  sectionKey: 'cta-split-contact-default',
  sectionType: 'cta',
  title: 'Talk to a real person',
  subtitle: null,
  body: 'Prefer to reach out directly? Call or email and someone on the team gets back to you the same day.',
  cta: { label: 'Start a project', url: '#start' },
  visualNotes: {
    blueprintKey: 'cta_split_contact',
    moodKeywords: ['approachable'],
    layoutBlueprint: 'cta_split_contact',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const cardGrid: Section = {
  sectionKey: 'services-grid-default',
  sectionType: 'services',
  title: 'Featured services',
  subtitle: 'Acme',
  body: 'A one-line section subheading that frames the service catalog below.',
  cta: null,
  visualNotes: {
    blueprintKey: 'card_grid',
    moodKeywords: ['approachable', 'modern'],
    layoutBlueprint: 'card_grid',
    imageOpportunity: 'illustration per card',
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
  title: 'What we do',
  subtitle: 'Services',
  body: 'A one-line section subheading that frames the service catalog below — short enough to scan, specific enough to set expectations.',
  cta: null,
  visualNotes: {
    blueprintKey: 'two_column_detail',
    moodKeywords: ['professional'],
    layoutBlueprint: 'two_column_detail',
    imageOpportunity: null,
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

const narrative: Section = {
  sectionKey: 'about-story-default',
  sectionType: 'content_block',
  title: 'A story-led section that introduces the brand.',
  subtitle: 'Who we are',
  body: 'A short paragraph of about-copy that sets context for the visitor — who you are, what you do, and the posture you bring to the work. Long enough to set the type rhythm but short enough that a visitor will actually read it.',
  cta: null,
  visualNotes: {
    blueprintKey: 'story_split',
    moodKeywords: ['warm', 'professional'],
    layoutBlueprint: 'story_split',
    imageOpportunity: null,
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
  title: 'Featured capabilities',
  subtitle: null,
  body: 'A short section subheading that frames the cards below — typically a cross-sell or capability roll-up.',
  cta: null,
  visualNotes: {
    blueprintKey: 'feature_grid',
    moodKeywords: ['bold', 'modern'],
    layoutBlueprint: 'feature_grid',
    imageOpportunity: 'illustration per card',
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
  title: 'Monthly support services',
  subtitle: null,
  body: 'A short subheading that frames the support offering — what the visitor gets and why it matters to them.',
  cta: { label: 'Learn more', url: '#' },
  visualNotes: {
    blueprintKey: 'callout_split',
    moodKeywords: ['approachable', 'warm'],
    layoutBlueprint: 'callout_split',
    imageOpportunity: 'persona avatars + photo tile',
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

const statsBar: Section = {
  sectionKey: 'stats-bar-default',
  sectionType: 'stats',
  title: 'By the numbers',
  subtitle: null,
  body: null,
  cta: null,
  visualNotes: {
    blueprintKey: 'stats_bar',
    moodKeywords: ['bold', 'professional'],
    layoutBlueprint: 'stats_bar',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [
    { title: '12', description: 'Years in practice' },
    { title: '4,800+', description: 'Patients served' },
    { title: '98%', description: 'Would recommend' },
    { title: '24h', description: 'Average response time' },
  ],
};

// The count-up treatment of the stat bar — the content-motion axis value this
// block adopts (ADR-039 §Decision 2, #2529). Identical content to the static
// fixture; only `contentMotion` differs, so the rail renders each number through
// `_CountUp`. The generated story shows the static final numbers (the count is a
// client-only enhancement, so the pre-rendered HTML rests on the final value).
const statsBarCountUp: Section = {
  ...statsBar,
  sectionKey: 'stats-bar-count-up',
  contentMotion: 'count-up',
};

const testimonialsFeaturedLarge: Section = {
  sectionKey: 'testimonials-featured-default',
  sectionType: 'testimonials',
  title: 'What clients say',
  subtitle: null,
  body: null,
  cta: null,
  visualNotes: {
    blueprintKey: 'testimonials_featured_large',
    moodKeywords: ['trustworthy', 'warm'],
    layoutBlueprint: 'testimonials_featured_large',
    imageOpportunity: null,
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

// The video treatment of the featured testimonial — the media axis value this
// block adopts (ADR-039 §Media axis, #2518). Same quote content as the default
// fixture; `items[0].videoUrl` adds a foreground `media="video"` player above
// the quote through the shared `<Media>` primitive. The poster is a data-URI
// placeholder so the pre-rendered story rests on a deterministic still (no
// autoplay, no network). The `layout` token the renderer threads through is
// ignored by `TestimonialsFeaturedLarge.astro` — the video comes from the
// fixture, mirroring the LogoWall/StatsBar content-axis precedent below.
const testimonialsFeaturedLargeVideo: Section = {
  ...testimonialsFeaturedLarge,
  sectionKey: 'testimonials-featured-video',
  items: [
    {
      ...testimonialsFeaturedLarge.items[0],
      // Empty data URI: the element rests on its poster with no network fetch,
      // so the pre-rendered screenshot is deterministic offline and in CI.
      videoUrl: 'data:video/mp4,',
      videoPoster: placeholderImage(1280, 720, '#eaf1fb', '#1f3d70', 'Client video'),
    },
  ],
};

// LogoWall carries no layout axis — its variant axis is the content-motion axis
// (ADR-039 §Decision 2, #2529). The two fixtures differ only by `contentMotion`,
// so the Astro rail renders both the static strip and the marquee treatment; the
// `layout` token the renderer threads through is ignored by `LogoWall.astro`.
const logoItems = ['Northwind', 'Acme Co.', 'Globex', 'Initech', 'Umbra'].map((name) => ({
  title: name,
  description: '',
  imageUrl: placeholderImage(160, 48, '#eef2f7', '#33415a', name),
  imageAlt: name,
}));

const logoWallStatic: Section = {
  sectionKey: 'logo-wall-static',
  sectionType: 'content_block',
  title: 'Trusted by teams everywhere',
  subtitle: null,
  body: null,
  cta: null,
  contentMotion: 'none',
  visualNotes: {
    blueprintKey: 'logo_wall',
    moodKeywords: ['trustworthy', 'professional'],
    layoutBlueprint: 'logo_wall',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: logoItems,
};

const logoWallMarquee: Section = {
  ...logoWallStatic,
  sectionKey: 'logo-wall-marquee',
  contentMotion: 'marquee',
};


// ── CollectionIndex / CollectionEntry / FaqAccordion (brik-bds#872) ─────────
// Astro-only blocks (`rails: ["astro"]`), so these fixtures have no React twin.

const collectionIndex: Section = {
  sectionKey: 'collection-index-default',
  sectionType: 'content_block',
  title: 'Latest from the journal',
  subtitle: 'Resources',
  body: 'Practical notes on running a growing business, written by the team.',
  cta: null,
  visualNotes: {
    blueprintKey: 'collection_index',
    moodKeywords: ['professional', 'modern'],
    layoutBlueprint: 'collection_index',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [
    {
      title: 'How we plan a quarter',
      description: 'A walk through the three questions we answer before any work is scheduled.',
      href: '/journal/plan-a-quarter',
      imageUrl: placeholderImage(640, 427, '#eaf1fb', '#1f3d70', 'Plan'),
      imageAlt: 'A planning board with sticky notes',
      category: 'information',
    },
    {
      title: 'What a good brief contains',
      description: 'The short list of facts that make the first draft land closer to the mark.',
      href: '/journal/good-brief',
      imageUrl: placeholderImage(640, 427, '#eef2f7', '#33415a', 'Brief'),
      imageAlt: '',
      category: 'marketing',
    },
    {
      title: 'Notes from a site migration',
      description: 'What moved, what broke, and what we would do differently next time.',
      href: '/journal/site-migration',
    },
  ],
};

const collectionEntry: Section = {
  sectionKey: 'collection-entry-default',
  sectionType: 'content_block',
  title: 'How we plan a quarter',
  subtitle: 'Journal',
  body: [
    'Every quarter starts with the same short conversation. We keep it short on purpose, because a long planning meeting usually means the plan is not clear yet.',
    '## The three questions',
    'We answer these in order and do not move on until each has one clear answer.',
    [
      '- What has to be true by the end of the quarter?',
      '- What is the smallest piece of work that gets us there?',
      '- Who owns it, and what do they need from the rest of us?',
    ].join('\n'),
    '## What we leave out',
    'Anything that cannot be tied to the first question waits for next quarter.',
    '### Why that is hard',
    'Good ideas arrive all the time. Saying "not yet" is a skill the whole team has to practise.',
  ].join('\n\n'),
  cta: null,
  visualNotes: {
    blueprintKey: 'collection_entry',
    moodKeywords: ['professional', 'trustworthy'],
    layoutBlueprint: 'collection_entry',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const faqAccordion: Section = {
  sectionKey: 'faq-accordion-default',
  sectionType: 'faq',
  title: 'Frequently asked questions',
  subtitle: 'FAQ',
  body: 'Short answers to the questions we hear most. Ask us if yours is not here.',
  cta: null,
  visualNotes: {
    blueprintKey: 'faq_accordion_grouped',
    moodKeywords: ['professional', 'minimal'],
    layoutBlueprint: 'faq_accordion_grouped',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [
    { title: 'How long does a project take?', description: 'Most projects take six to eight weeks from kickoff to launch.', group: 'Getting started' },
    { title: 'What do you need from us?', description: 'A short brief, your brand assets, and one person who can approve work.', group: 'Getting started' },
    { title: 'How do you price your work?', description: 'A fixed fee per phase, agreed before the phase begins.', group: 'Pricing' },
    { title: 'Can I change the scope?', description: 'Yes. Changes are priced and agreed in writing before they start.', group: 'Pricing' },
    { title: 'Do you offer support after launch?', description: 'Every project includes thirty days of support, with ongoing plans after that.', group: 'Support' },
  ],
};

/** Keyed `Block` or `Block:layout` — the renderer resolves the layout axis first. */
const SECTIONS: Record<string, Section> = {
  'Hero:split': heroSplit,
  'Hero:interior-minimal': heroInteriorMinimal,
  'Hero:with-pricing-card': heroWithPricingCard,
  'Hero:centered': heroCentered,
  'Cta:default': ctaDefault,
  'Cta:split': ctaSplit,
  'CardGrid:card-grid': cardGrid,
  'CardGrid:two-column-list': cardGridTwoColumnList,
  Narrative: narrative,
  Features: features,
  CalloutPanel: calloutPanel,
  StatsBar: statsBar,
  'StatsBar:count-up': statsBarCountUp,
  TestimonialsFeaturedLarge: testimonialsFeaturedLarge,
  'TestimonialsFeaturedLarge:video': testimonialsFeaturedLargeVideo,
  'LogoWall:static': logoWallStatic,
  'LogoWall:marquee': logoWallMarquee,
  CollectionIndex: collectionIndex,
  CollectionEntry: collectionEntry,
  FaqAccordion: faqAccordion,
};

/** Resolves the fixture for a block, optionally narrowed to one layout. */
export function sectionFor(block: string, layout: string | null): Section {
  const key = layout ? `${block}:${layout}` : block;
  const section = SECTIONS[key];
  if (!section) throw new Error(`No section fixture for "${key}" — add one to sections.ts`);
  return section;
}
