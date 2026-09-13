import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatsDarkBar } from './StatsDarkBar';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * Canonical fixture — four proof points. `item.title` is the number,
 * `item.description` the caption underneath; the heading renders
 * visually-hidden so the region has an accessible name.
 */
const statsSection: BlueprintProps['section'] = {
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
    illustrationOpportunity: null,
  },
  items: [
    { title: '12', description: 'Years in practice' },
    { title: '4,800+', description: 'Patients served' },
    { title: '98%', description: 'Would recommend' },
    { title: '24h', description: 'Average response time' },
  ],
};

/** The same stats with `contentMotion: count-up` — each number counts up into
 *  view via the shared `BlockContentMotion` dispatcher (#2529). At rest it is
 *  the same final numbers; the sweep is a client-only enhancement. */
const countUpSection: BlueprintProps['section'] = {
  ...statsSection,
  sectionKey: 'stats-bar-count-up',
  contentMotion: 'count-up',
};

const propsFor = (section: BlueprintProps['section']): BlueprintProps => ({
  section,
  clientFacts: baseClientFacts,
  theme: baseTheme,
});

const baseProps = propsFor(statsSection);

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof StatsDarkBar> = {
  title: 'Blueprints/stats-dark-bar',
  component: StatsDarkBar,
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
          'Renderer for the `stats_bar` blueprint key — a horizontal row of proof-point stats on an inverse surface, deliberately dark so the bar reads as a weighty proof moment against the surrounding page. Semantic `ul`/`li`; the numbers are content, not decoration. The first block to adopt the content-motion axis `count-up` (ADR-039 §Decision 2): `contentMotion: count-up` counts each number into view via the `CountUp` primitive, reduced-motion-gated by construction.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsDarkBar>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Proof-point stat row on an inverse surface.
 */
export const Default: Story = {
  args: baseProps,
};

/**
 * @summary Count-up — each stat counts up into view.
 */
export const CountUp: Story = {
  args: propsFor(countUpSection),
};
