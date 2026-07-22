import type { Meta, StoryObj } from '@storybook/react-vite';

import { Features3ColBrandedDark } from './Features3ColBrandedDark';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts } from './_fixtures';

/* ─── Demo data-service-line cascade ────────────────────────────────────
 *
 * BDS ships the scope-binding pattern but not audience-specific values
 * — those live in each consumer's globals.css. Storybook needs the
 * binding present somewhere so cards visualize in distinct brand
 * colors. This `<style>` block is a representative example of what
 * a consumer site would declare for its audience verticals.
 *
 * Per the cascade rules (`docs/theming/client-themes`), we re-bind
 * `--background-brand-primary` and the related brand-* tokens inside
 * the `[data-service-line='X']` subtree. Components stay scope-blind.
 */
const serviceLineCascadeStyles = `
[data-service-line='brand'] {
  --background-brand-primary: var(--color-yellow-light);
  --text-brand-primary: var(--color-yellow-dark);
}
[data-service-line='marketing'] {
  --background-brand-primary: var(--color-green-light);
  --text-brand-primary: var(--color-green-dark);
}
[data-service-line='information'] {
  --background-brand-primary: var(--color-blue-light);
  --text-brand-primary: var(--color-blue-dark);
}
[data-service-line='product'] {
  --background-brand-primary: var(--color-purple-light);
  --text-brand-primary: var(--color-purple-dark);
}
[data-service-line='service'] {
  --background-brand-primary: var(--color-orange-light);
  --text-brand-primary: var(--color-orange-dark);
}
`;

/* ─── Fixtures ─────────────────────────────────────────────────── */

const darkTheme: BlueprintProps['theme'] = { ...baseTheme, themeMode: 'dark' };

/**
 * Three cards in audience-distinct brand colors — the canonical
 * fixture for the dark 3-column features blueprint. The shape (three
 * scope-bound cards on a dark section) is what the blueprint
 * documents; consumer sites supply their own card content.
 */
const featuresSection: BlueprintProps['section'] = {
  sectionKey: 'features-branded-dark-default',
  sectionType: 'features',
  heading: 'Featured capabilities',
  subheading: null,
  body: 'A short section subheading that frames the cards below — typically a cross-sell or capability roll-up.',
  cta: null,
  visualNotes: {
    blueprintKey: 'features_3col_branded_dark',
    moodKeywords: ['bold', 'modern'],
    layoutBlueprint: 'features_3col_branded_dark',
    imageOpportunity: 'illustration per card',
    animationSuggestion: null,
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

const baseProps: BlueprintProps = {
  section: featuresSection,
  clientFacts: baseClientFacts,
  theme: darkTheme,
};

/* ─── Decorator — injects the demo audience cascade ─────────────── */

const withAudienceCascade = (Story: () => JSX.Element) => (
  <>
    <style dangerouslySetInnerHTML={{ __html: serviceLineCascadeStyles }} />
    <Story />
  </>
);

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof Features3ColBrandedDark> = {
  title: 'Sections/Blueprints/features_3col_branded_dark',
  component: Features3ColBrandedDark,
  tags: ['surface-web', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  decorators: [withAudienceCascade],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dark section with a 3-column grid of brand-colored cards. Each card emits `data-service-line` to re-bind `--background-brand-primary` for that subtree per the BDS scope-binding pattern (`docs/theming/client-themes`). Stories include a representative cascade block showing how a consumer site would declare per-audience bindings. Card title uses bold weight + 18px, description 16px regular — the AA-clearing posture for white-on-saturated-brand backgrounds (BDS contrast burndown #40).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Features3ColBrandedDark>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Three cards — the canonical 3-column features fixture.
 */
export const Playground: Story = {
  args: baseProps,
};

/**
 * @summary Wrapped — four+ cards force the grid to a second row.
 *
 * Distinct meaningful state from `Playground` because the row-wrap
 * behavior at the desktop breakpoint is the layout property worth
 * verifying. Per-card content variants (missing image, audience
 * accent) are exercised by the leaf component stories, not duplicated
 * here.
 */
export const Wrapped: Story = {
  args: {
    ...baseProps,
    section: {
      ...featuresSection,
      sectionKey: 'features-branded-dark-wrapped',
      items: [
        ...featuresSection.items,
        {
          title: 'Capability four',
          description: 'A two-line card description that sets the type rhythm without competing with the title.',
          href: '#',
          serviceLine: 'information',
        },
      ],
    },
  },
};
