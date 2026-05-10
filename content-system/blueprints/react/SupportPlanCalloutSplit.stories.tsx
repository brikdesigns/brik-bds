import type { Meta, StoryObj } from '@storybook/react-vite';

import { SupportPlanCalloutSplit } from './SupportPlanCalloutSplit';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * "Monthly support services" fixture — the brikdesigns.com cross-sell
 * section that drives this blueprint. Persona-cluster illustration on
 * the left, plan callout card on the right.
 */
const supportSection: BlueprintProps['section'] = {
  sectionKey: 'support-plan-default',
  sectionType: 'cta',
  heading: 'Monthly support services',
  subheading: null,
  body: 'Keep momentum after launch — ongoing design partnership for the post-rollout work that compounds into growth.',
  cta: {
    label: 'Learn more',
    url: '/services/monthly-support',
  },
  illustration: {
    variant: 'persona-cluster',
    ratio: 'square',
    tiles: [
      {
        kind: 'avatar',
        src: 'https://placehold.co/240x240/eaf1fb/1f3d70?text=Sam',
        alt: 'Strategist Sam',
      },
      {
        kind: 'chat-bubble',
        content: 'How can I help today?',
        accent: 'brand-primary',
      },
      { kind: 'message', accent: 'positive' },
      {
        kind: 'photo',
        src: 'https://placehold.co/220x220/ffe1cc/663300?text=Olivia',
        alt: 'Operations Olivia',
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
      title: 'Brik Continuity Plan',
      description:
        'A predictable monthly cadence — strategic check-ins, design execution, and a single point of contact who already knows your business.',
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
  title: 'Theming/Blueprints/support_plan_callout_split',
  component: SupportPlanCalloutSplit,
  tags: ['surface-web', 'surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Section header + two-column split: persona-cluster illustration on the left, plan callout card on the right. Drives the brikdesigns.com `/services/{slug}` "Monthly support services" cross-sell. Uses the BDS `MarketingIllustration` primitive (PR #484) for the scene. Plan card text uses `--text-primary` to clear AA on `--surface-secondary`; CTA uses `LinkButton size="md"` to clear AA at the brand-poppy fill.',
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
 * stories or via the Theme Switcher addon.
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
