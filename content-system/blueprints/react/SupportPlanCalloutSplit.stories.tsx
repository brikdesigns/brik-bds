import type { Meta, StoryObj } from '@storybook/react-vite';

import { SupportPlanCalloutSplit } from './SupportPlanCalloutSplit';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * Canonical fixture — persona-cluster illustration on the left, plan
 * callout card on the right. The shape (split with named illustration
 * variant + callout) is what the blueprint documents; consumer sites
 * supply their own service offering and persona content.
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
  illustration: {
    variant: 'persona-cluster',
    ratio: 'square',
    tiles: [
      {
        kind: 'avatar',
        src: 'https://placehold.co/240x240/eaf1fb/1f3d70?text=Persona+A',
        alt: 'Persona A',
      },
      {
        kind: 'chat-bubble',
        content: 'How can I help today?',
        accent: 'brand-primary',
      },
      { kind: 'message', accent: 'positive' },
      {
        kind: 'photo',
        src: 'https://placehold.co/220x220/ffe1cc/663300?text=Persona+B',
        alt: 'Persona B',
      },
      {
        kind: 'chat-bubble',
        content: 'We need an email campaign',
        accent: 'neutral',
      },
    ],
  },
  visualNotes: {
    blueprintKey: 'support_plan_callout_split',
    moodKeywords: ['approachable', 'warm'],
    layoutBlueprint: 'support_plan_callout_split',
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

const meta: Meta<typeof SupportPlanCalloutSplit> = {
  title: 'Sections/Blueprints/support_plan_callout_split',
  component: SupportPlanCalloutSplit,
  tags: ['surface-web', 'surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Section header + two-column split: persona-cluster illustration on the left, plan callout card on the right. Uses the BDS `MarketingIllustration` primitive (PR #484) for the scene. Plan card text uses `--text-primary` to clear AA on `--surface-secondary`; CTA uses `LinkButton size="md"` to clear AA at the brand-poppy fill.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SupportPlanCalloutSplit>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Default split — persona-cluster scene + plan card.
 */
export const Playground: Story = {
  args: baseProps,
};

/**
 * @summary No illustration — plan card centers full-width.
 *
 * Distinct meaningful state from `Playground`: the layout collapses
 * from two-column split to a single centered card. Worth a separate
 * story because the visual rhythm changes substantially. The
 * "no header" / atmosphere variants are not separate stories —
 * they're trivial prop differences exercised at the leaf-component
 * stories or via the Theme Switcher toolbar.
 */
export const NoIllustration: Story = {
  args: {
    ...baseProps,
    section: {
      ...supportSection,
      sectionKey: 'support-plan-no-illustration',
      illustration: undefined,
    },
  },
};
