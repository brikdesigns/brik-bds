import type { Meta, StoryObj } from '@storybook/react-vite';

import { CtaDarkCentered } from './CtaDarkCentered';
import type { BlueprintProps } from '../astro/types';

const baseTheme: BlueprintProps['theme'] = {
  themeMode: 'dark',
  atmosphere: 'none',
  navigationArchetype: 'utility-first',
  footerArchetype: 'four_col_directory',
};

const baseClientFacts: BlueprintProps['clientFacts'] = {
  brandName: 'Acme',
  tagline: null,
  valueProposition: null,
  services: [],
  phone: null,
  email: null,
  address: null,
  hours: [],
  heroImageUrl: null,
  logoUrl: null,
  logoVariants: {},
};

const section: BlueprintProps['section'] = {
  sectionKey: 'cta-dark-centered-default',
  sectionType: 'cta',
  heading: 'Ready to get started?',
  subheading: null,
  body: 'A closing prompt that earns the click — short, action-oriented, and specific to what the visitor gets after they tap the CTA.',
  cta: { label: 'Get in touch', url: '#contact' },
  visualNotes: {
    blueprintKey: 'cta_dark_centered',
    moodKeywords: ['bold'],
    layoutBlueprint: 'cta_dark_centered',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const meta: Meta<typeof CtaDarkCentered> = {
  title: 'Blueprints/cta_dark_centered',
  component: CtaDarkCentered,
  tags: ['surface-web', 'surface-shared'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof CtaDarkCentered>;

/** @summary Default — heading + body + primary CTA on dark surface. */
export const Default: Story = {
  args: { section, clientFacts: baseClientFacts, theme: baseTheme },
};

/** @summary Heading + CTA only — no supporting body. */
export const NoBody: Story = {
  args: {
    section: { ...section, sectionKey: 'cta-dark-centered-no-body', body: null },
    clientFacts: baseClientFacts,
    theme: baseTheme,
  },
};

/**
 * @summary Action CTA (#941) — an `onClick` CTA (no `url`) renders a
 * `<button>` instead of an `<a>`, so the blueprint can trigger in-page
 * behavior (open a modal, fire analytics). Inspect the rendered element:
 * it is a real button with button semantics, not a link.
 */
export const ActionCta: Story = {
  args: {
    section: {
      ...section,
      sectionKey: 'cta-dark-centered-action',
      cta: { label: 'Open contact form', onClick: () => {} },
    },
    clientFacts: baseClientFacts,
    theme: baseTheme,
  },
};
