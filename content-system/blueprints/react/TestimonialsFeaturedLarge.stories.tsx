import type { Meta, StoryObj } from '@storybook/react-vite';

import { TestimonialsFeaturedLarge } from './TestimonialsFeaturedLarge';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts, placeholderImage } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * Canonical fixture — one featured testimonial. The adapter reads
 * `items[0]` only: `title` is the attribution line, `description` the
 * quote. The heading renders visually-hidden as the region's label.
 */
const testimonialSection: BlueprintProps['section'] = {
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

const baseProps: BlueprintProps = {
  section: testimonialSection,
  clientFacts: baseClientFacts,
  theme: baseTheme,
};

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof TestimonialsFeaturedLarge> = {
  title: 'Blueprints/testimonials-featured-large',
  component: TestimonialsFeaturedLarge,
  tags: ['surface-web'],
  argTypes: {
    section: { control: false, description: 'Section content shape — sectionKey, heading, items, visualNotes. Set in code.' },
    clientFacts: { control: false, description: 'Site-wide client facts (brand, contact, services). Set in code.' },
    theme: { control: false, description: 'Theme + archetype config — mode, atmosphere, nav/footer archetype. Set in code.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Legacy adapter for the `testimonials_featured_large` blueprint key — maps `section.items[0]` onto the canonical `<Testimonial>` primitive inside the shared section shell. New consumers should compose `<Testimonial>` directly.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TestimonialsFeaturedLarge>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Single featured testimonial in the section shell.
 */
export const Default: Story = {
  args: baseProps,
};

/**
 * The featured item carries a `videoUrl` — a foreground, user-controlled player
 * (media axis, ADR-039 #2518) renders above the quote via `BlockMedia`. The
 * poster is a data-URI placeholder; the empty `videoUrl` rests on it (no
 * autoplay, no network) for a deterministic screenshot.
 *
 * @summary Featured testimonial with a video above the quote.
 */
export const WithVideo: Story = {
  args: {
    ...baseProps,
    section: {
      ...testimonialSection,
      sectionKey: 'testimonials-featured-video',
      items: [
        {
          ...testimonialSection.items[0],
          videoUrl: 'data:video/mp4,',
          videoPoster: placeholderImage(1280, 720, '#eaf1fb', '#1f3d70', 'Client video'),
        },
      ],
    },
  },
};
