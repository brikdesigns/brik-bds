import type { Meta, StoryObj } from '@storybook/react-vite';

import { Image } from '../../../components';
import { CalloutPanel } from './CalloutPanel';
import type { BlueprintProps } from '../astro/types';
import { baseClientFacts, baseTheme, placeholderImage } from './_fixtures';

const meta: Meta<typeof CalloutPanel> = {
  title: 'Blueprints/callout_panel',
  component: CalloutPanel,
  tags: ['surface-web'],
  argTypes: {
    sectionKey: { control: 'text', description: 'Unique section key — drives element ids.' },
    subtitle: { control: 'text', description: 'Eyebrow above the title.' },
    title: { control: 'text', description: 'Section heading.' },
    description: { control: 'text', description: 'Section subheading copy.' },
    panelTitle: { control: 'text', description: 'Plan callout card title.' },
    panelDescription: { control: 'text', description: 'Plan callout card body.' },
    cta: { control: false, description: 'Plan CTA `{ label, url }`.' },
    media: { control: false, description: 'Optional media node — flips the callout to a two-column split.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `bds-callout-panel` section primitive (brik-bds#581). Section header (subtitle + title + lead) above a plan-callout card, with an optional `media` slot. The default shape is the simple single-column callout — eyebrow + heading + body + one CTA — which is the real consumer content shape (brik-bds#589); a decorative scene is optional composition via `media`. Plan card text uses `--bds-text-primary` to clear AA on `--bds-surface-secondary`; CTA uses `Button size="md"` to clear AA on the brand-poppy fill.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalloutPanel>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * The real brikdesigns "Monthly Support CTA" content shape per
 * brik-bds#589: eyebrow + heading + body + plan card + one CTA, no
 * fabricated illustration. This is what the consumer actually renders.
 *
 * @summary Simple single-column plan callout (no media)
 */
export const Default: Story = {
  args: {
    sectionKey: 'support-plan-default',
    title: 'Monthly support services',
    subtitle: 'Ongoing partnership',
    description:
      'A short subheading that frames the support offering — what the visitor gets and why it matters to them.',
    panelTitle: 'Monthly Support Plan',
    panelDescription:
      'A two- or three-sentence description of the plan offering — what the cadence covers, what the deliverables look like, and what the visitor walks away with after signing up.',
    cta: { label: 'Learn more', url: '#' },
  },
};

/**
 * Distinct meaningful state from `Default`: passing a `media` node
 * flips the layout from single-column to a two-column split. The `media`
 * slot accepts any node — here a square `<Image>`.
 *
 * @summary With media — image beside the card
 */
export const WithMedia: Story = {
  args: {
    ...Default.args,
    sectionKey: 'support-plan-with-media',
    media: (
      <Image
        src={placeholderImage(480, 480, '#eaf1fb', '#1f3d70', 'Media')}
        alt="Support plan media"
        ratio="square"
      />
    ),
  },
};

/* ─── Dispatched (section-driven) ──────────────────────────────────
 *
 * The same block, driven by a `BlueprintSection` — the first item becomes the
 * plan callout. What `BlueprintDispatcher` renders for the `callout_split` key
 * (#2352).
 */

const supportSection: BlueprintProps['section'] = {
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

/** @summary Dispatched callout — header + plan card from section */
export const Dispatched: Story = {
  args: {
    section: supportSection,
    clientFacts: baseClientFacts,
    theme: baseTheme,
  },
};
