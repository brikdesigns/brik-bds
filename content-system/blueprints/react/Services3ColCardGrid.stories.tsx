import type { Meta, StoryObj } from '@storybook/react-vite';

import { Services3ColCardGrid } from './Services3ColCardGrid';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/**
 * Six service cards — the canonical fixture for the 3-column grid
 * blueprint. The shape (six cards, optional category accent, optional
 * "has options" pill) is what the blueprint documents; consumer sites
 * supply their own service catalog.
 */
const servicesGridSection: BlueprintProps['section'] = {
  sectionKey: 'services-grid-default',
  sectionType: 'services',
  heading: 'Featured services',
  subheading: 'Acme',
  body: 'A one-line section subheading that frames the service catalog below.',
  cta: null,
  visualNotes: {
    blueprintKey: 'services_3col_card_grid',
    moodKeywords: ['approachable', 'modern'],
    layoutBlueprint: 'services_3col_card_grid',
    imageOpportunity: 'illustration per card',
    animationSuggestion: null,
    illustrationOpportunity: 'scene per service',
  },
  items: [
    {
      title: 'Service one',
      description:
        'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+One',
      category: 'information',
    },
    {
      title: 'Service two',
      description:
        'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+Two',
      category: 'information',
      hasOptions: true,
    },
    {
      title: 'Service three',
      description:
        'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+Three',
      category: 'information',
    },
    {
      title: 'Service four',
      description:
        'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+Four',
      category: 'information',
    },
    {
      title: 'Service five',
      description:
        'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+Five',
      category: 'information',
      hasOptions: true,
    },
    {
      title: 'Service six',
      description:
        'A two-line card description that sets the type rhythm without trying to tell the whole story.',
      href: '#',
      imageUrl: 'https://placehold.co/480x320/eaf1fb/1f3d70?text=Service+Six',
      category: 'information',
    },
  ],
};

const baseProps: BlueprintProps = {
  section: servicesGridSection,
  clientFacts: baseClientFacts,
  theme: baseTheme,
};

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof Services3ColCardGrid> = {
  title: 'Blueprints/services_3col_card_grid',
  component: Services3ColCardGrid,
  tags: ['surface-web', 'surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Three-column service card grid blueprint. Each card composes BDS primitives — Card frame, Frame for the 3:2 image, ServiceTag for the category badge, LinkButton for the "Learn more" CTA, and Badge for the optional "Has Options" pill. Description copy uses `--text-primary` to clear AA contrast at 14–16px (BDS contrast burndown #40).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Services3ColCardGrid>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Six service cards — the canonical fixture.
 *
 * Single Playground story per ADR-006: shape-only blueprint stories
 * carry one canonical state, not a fan-out of content variations.
 * Per-card affordances (`hasOptions`, missing `imageUrl`, accent
 * `category`) are exercised by the leaf component stories
 * (`Card.stories.tsx`, `ServiceTag.stories.tsx`, `Frame.stories.tsx`).
 * Theme (light/dark/client-sim) is switched via the Theme Switcher
 * toolbar; atmosphere variants are not encoded as separate stories.
 */
export const Playground: Story = {
  args: baseProps,
};
