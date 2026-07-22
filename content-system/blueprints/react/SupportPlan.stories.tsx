import type { Meta, StoryObj } from '@storybook/react-vite';

import { Image } from '../../../components';
import { SupportPlan } from './SupportPlan';

const meta: Meta<typeof SupportPlan> = {
  title: 'Blueprints/support_plan',
  component: SupportPlan,
  tags: ['surface-web'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `bds-support-plan` section primitive (brik-bds#581). Section header (subtitle + title + lead) above a plan-callout card, with an optional `media` slot. The default shape is the simple single-column callout — eyebrow + heading + body + one CTA — which is the real consumer content shape (brik-bds#589); a decorative scene is optional composition via `media`. Plan card text uses `--text-primary` to clear AA on `--surface-secondary`; CTA uses `Button size="md"` to clear AA on the brand-poppy fill.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SupportPlan>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Default — simple single-column plan callout (no media).
 *
 * The real brikdesigns "Monthly Support CTA" content shape per
 * brik-bds#589: eyebrow + heading + body + plan card + one CTA, no
 * fabricated illustration. This is what the consumer actually renders.
 */
export const Playground: Story = {
  args: {
    sectionKey: 'support-plan-default',
    title: 'Monthly support services',
    subtitle: 'Ongoing partnership',
    description:
      'A short subheading that frames the support offering — what the visitor gets and why it matters to them.',
    planTitle: 'Monthly Support Plan',
    planDescription:
      'A two- or three-sentence description of the plan offering — what the cadence covers, what the deliverables look like, and what the visitor walks away with after signing up.',
    cta: { label: 'Learn more', url: '#' },
  },
};

/**
 * @summary With media — image beside the card.
 *
 * Distinct meaningful state from `Playground`: passing a `media` node
 * flips the layout from single-column to a two-column split. The `media`
 * slot accepts any node — here a square `<Image>`.
 */
export const WithMedia: Story = {
  args: {
    ...Playground.args,
    sectionKey: 'support-plan-with-media',
    media: (
      <Image
        src="https://placehold.co/480x480/eaf1fb/1f3d70?text=Media"
        alt="Support plan media"
        ratio="square"
      />
    ),
  },
};
