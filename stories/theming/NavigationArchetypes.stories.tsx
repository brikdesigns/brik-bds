import type { Meta, StoryObj } from '@storybook/react-vite';
import type { NavigationIA } from '../../content-system/schema';
import type { NavArchetype } from '../../content-system/vocabularies/nav-archetype';
import { dental } from '../../content-system/industries/dental';
import { realEstateRvMhc } from '../../content-system/industries/real-estate-rv-mhc';
import { NavigationIASpec } from '../foundation/_components/NavigationIASpec';

// Canonical example IA per archetype. Where an industry pack already
// exemplifies the archetype we reuse the pack's data (guaranteed to stay
// in sync). For archetypes without a pack yet — service-centric,
// portfolio-minimal, calm-flat — we author a representative stub here so
// the whole vocabulary is visually browseable. When a pack for those
// verticals lands, swap the stub for a real `pack.navigationIA` reference.

const serviceCentricStub: NavigationIA = {
  archetype: 'service-centric',
  primaryLinkCount: 5,
  primaryLinks: [
    { label: 'Practice Areas', href: '/practice-areas' },
    { label: 'Attorneys', href: '/attorneys' },
    { label: 'Results', href: '/results' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  servicesMegaMenu: {
    triggerLabel: 'Practice Areas',
    columns: 2,
    categories: [
      {
        heading: 'Civil Litigation',
        items: [
          { label: 'Personal injury', href: '/practice-areas/personal-injury', note: 'Auto, slip-and-fall, med-mal' },
          { label: 'Product liability', href: '/practice-areas/product-liability' },
          { label: 'Employment disputes', href: '/practice-areas/employment' },
        ],
      },
      {
        heading: 'Corporate',
        items: [
          { label: 'M&A', href: '/practice-areas/mergers-acquisitions' },
          { label: 'Contract drafting', href: '/practice-areas/contracts' },
          { label: 'IP strategy', href: '/practice-areas/intellectual-property' },
        ],
      },
    ],
    featured: {
      eyebrow: 'Featured attorney',
      heading: 'Speak with a senior partner',
      body: 'Complex matters are matched to a senior partner on first contact — no handoffs.',
      ctaLabel: 'Schedule consult',
      ctaHref: '/contact',
    },
  },
  utility: {
    showPhone: true,
    primaryCTA: { label: 'Consult', href: '/contact', variant: 'solid' },
  },
  scrollBehavior: 'sticky-solid',
  mobileDrawer: 'fullscreen-overlay',
};

const portfolioMinimalStub: NavigationIA = {
  archetype: 'portfolio-minimal',
  primaryLinkCount: 3,
  primaryLinks: [
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  utility: {
    showPhone: false,
    primaryCTA: { label: 'Inquire', href: '/contact', variant: 'ghost' },
  },
  scrollBehavior: 'reveal-on-scroll',
  mobileDrawer: 'fullscreen-overlay',
};

const calmFlatStub: NavigationIA = {
  archetype: 'calm-flat',
  primaryLinkCount: 4,
  primaryLinks: [
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/contact' },
  ],
  utility: {
    showPhone: false,
    primaryCTA: { label: 'Book Session', href: '/book', variant: 'solid' },
  },
  scrollBehavior: 'sticky-solid',
  mobileDrawer: 'fullscreen-overlay',
};

// IndustryPack.navigationIA is optional in the schema, but the two packs we
// reuse below have it defined. Non-null assertions are safe here because a
// missing navigationIA on those packs would be caught by the pack test suite.
const archetypeExamples: Record<NavArchetype, { industryLabel: string; ia: NavigationIA }> = {
  'editorial-transparent': { industryLabel: 'Dental', ia: dental.navigationIA! },
  'utility-first': { industryLabel: 'Real Estate (RV/MHC)', ia: realEstateRvMhc.navigationIA! },
  'service-centric': { industryLabel: 'Legal (example)', ia: serviceCentricStub },
  'portfolio-minimal': { industryLabel: 'Creative (example)', ia: portfolioMinimalStub },
  'calm-flat': { industryLabel: 'Wellness (example)', ia: calmFlatStub },
};

interface ArchetypeStoryArgs {
  archetype: NavArchetype;
}

function ArchetypeStoryRender({ archetype }: ArchetypeStoryArgs) {
  const example = archetypeExamples[archetype];
  return (
    <div style={{ padding: 'var(--padding-lg)' }}>
      <NavigationIASpec industry={example.industryLabel} ia={example.ia} />
    </div>
  );
}

const meta: Meta<ArchetypeStoryArgs> = {
  title: 'Theming/Navigation Archetypes',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Per-archetype preview stories. The preview inherits BDS tokens from the active ' +
          'Storybook theme (switch via the paintbrush toolbar) so typography, border radius, ' +
          'and surface neutrals react to theme changes. Client Sim is especially useful for ' +
          'catching font-family token misuse before a client theme does.',
      },
    },
  },
  render: (args) => <ArchetypeStoryRender archetype={args.archetype} />,
};

export default meta;
type Story = StoryObj<ArchetypeStoryArgs>;

export const EditorialTransparent: Story = {
  args: { archetype: 'editorial-transparent' },
};

export const UtilityFirst: Story = {
  args: { archetype: 'utility-first' },
};

export const ServiceCentric: Story = {
  args: { archetype: 'service-centric' },
};

export const PortfolioMinimal: Story = {
  args: { archetype: 'portfolio-minimal' },
};

export const CalmFlat: Story = {
  args: { archetype: 'calm-flat' },
};
