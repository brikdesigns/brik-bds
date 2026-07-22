import type { Meta, StoryObj } from '@storybook/react-vite';

import { About } from './About';

const meta: Meta<typeof About> = {
  title: 'Sections/Blueprints/about',
  component: About,
  tags: ['surface-web'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `bds-about` narrative section primitive (brik-bds#1198) — the last Phase D family consolidation, retiring `bp-about-story-split`. A single-member family, so there is no layout modifier: the block is the narrative section. An optional `testimonial` renders as a composed `<CardTestimonial>` aside (the ADR-008 pull-quote primitive) and flips the layout to two columns via `:has()`; without one it is a single narrative column.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof About>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Playground — narrative column + pull-quote callout aside.
 *
 * The full about section: eyebrow + heading + narrative alongside a
 * `CardTestimonial` pull-quote. Replaces the legacy `about_story_split`.
 */
export const Playground: Story = {
  args: {
    sectionKey: 'about-story',
    subtitle: 'Who we are',
    title: 'A story-led section that introduces the brand.',
    body: 'A short paragraph of about-copy that sets context for the visitor — who you are, what you do, and the posture you bring to the work. Long enough to set the type rhythm but short enough that a visitor will actually read it.',
    testimonial: {
      quote:
        'A short pull-quote that reinforces the section narrative — typically two sentences attributed to a leader or customer.',
      author: 'Sample Quote',
      authorRole: 'Role, Company',
    },
  },
};

/**
 * @summary Narrative only — no pull-quote callout.
 *
 * Distinct meaningful state: with no `testimonial`, the `:has()` rule stays
 * inactive and the section renders as a single narrative column.
 */
export const NarrativeOnly: Story = {
  args: {
    sectionKey: 'about-story-narrative-only',
    subtitle: 'Who we are',
    title: 'A story-led section that introduces the brand.',
    body: 'A short paragraph of about-copy that sets context for the visitor — who you are, what you do, and the posture you bring to the work.',
  },
};
