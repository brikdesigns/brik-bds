import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalloutSplit } from './CalloutSplit';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * Canonical fixture — section header + plan callout card. Consumer sites
 * supply their own service offering and CTA content; the adapter maps the
 * section data onto `<CalloutPanel>`.
 */
const supportSection: BlueprintProps['section'] = {
  sectionKey: 'support-plan-default',
  sectionType: 'cta',
  heading: 'Monthly support services',
  subheading: null,
  body: 'A short subheading that frames the support offering — what the visitor gets and why it matters to them.',
  cta: {
    label: 'Learn more',
    url: '#',
  },
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

const baseProps: BlueprintProps = {
  section: supportSection,
  clientFacts: baseClientFacts,
  theme: baseTheme,
};

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof CalloutSplit> = {
  title: 'Blueprints/callout-split',
  component: CalloutSplit,
  tags: ['surface-web'],
  argTypes: {
    section: { control: false, description: 'Section content shape — sectionKey, heading, subheading, body, cta, items, visualNotes. Set in code.' },
    clientFacts: { control: false, description: 'Site-wide client facts (brand, contact, services). Set in code.' },
    theme: { control: false, description: 'Theme + archetype config — mode, atmosphere, nav/footer archetype. Set in code.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Legacy adapter for the `callout_split` blueprint key — maps `section.*` onto the canonical `<CalloutPanel>` primitive. Section header above a plan callout card. Plan card text uses `--text-primary` to clear AA on `--surface-secondary`; CTA uses `Button size="md"` to clear AA at the brand-poppy fill.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalloutSplit>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Section header + plan callout card.
 */
export const Default: Story = {
  args: baseProps,
};
