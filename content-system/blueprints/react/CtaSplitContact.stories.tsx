import type { Meta, StoryObj } from '@storybook/react-vite';

import { CtaSplitContact } from './CtaSplitContact';
import type { BlueprintProps } from '../astro/types';

const baseTheme: BlueprintProps['theme'] = {
  themeMode: 'light',
  atmosphere: 'none',
  navigationArchetype: 'utility-first',
  footerArchetype: 'four_col_directory',
};

const baseClientFacts: BlueprintProps['clientFacts'] = {
  brandName: 'Acme',
  tagline: null,
  valueProposition: null,
  services: [],
  phone: '(555) 123-4567',
  email: 'hello@acme.test',
  address: null,
  hours: [],
  heroImageUrl: null,
  logoUrl: null,
  logoVariants: {},
};

const section: BlueprintProps['section'] = {
  sectionKey: 'cta-split-contact-default',
  sectionType: 'cta',
  heading: 'Talk to a real person',
  subheading: null,
  body: 'Prefer to reach out directly? Call or email and someone on the team gets back to you the same day.',
  cta: { label: 'Start a project', url: '#start' },
  visualNotes: {
    blueprintKey: 'cta_split_contact',
    moodKeywords: ['approachable'],
    layoutBlueprint: 'cta_split_contact',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
  items: [],
};

const meta: Meta<typeof CtaSplitContact> = {
  title: 'Blueprints/cta_split_contact',
  component: CtaSplitContact,
  tags: ['surface-web', '!manifest'], // deprecated adapter — hide from MCP discovery (#1308)
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Phase D adapter (brik-bds#582) — the React twin the Astro-only `cta_split_contact` blueprint previously lacked. Maps `section.*` + `clientFacts.{phone,email}` onto `<Cta layout="split">`, building the contact-method aside.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CtaSplitContact>;

/** @summary Default — message left, phone + email contact methods right. */
export const Playground: Story = {
  args: { section, clientFacts: baseClientFacts, theme: baseTheme },
};

/**
 * @summary Missing fact — emits a `data-content-needed` stub.
 *
 * When a required contact fact is null at runtime, the method renders a
 * `data-content-needed` stub in place of the link (CI grep on `dist/`
 * blocks publish on the stub), matching the Astro twin.
 */
export const MissingPhone: Story = {
  args: {
    section: { ...section, sectionKey: 'cta-split-contact-missing-phone' },
    clientFacts: { ...baseClientFacts, phone: null },
    theme: baseTheme,
  },
};
