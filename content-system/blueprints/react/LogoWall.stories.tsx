import type { Meta, StoryObj } from '@storybook/react-vite';

import { LogoWall } from './LogoWall';
import type { BlueprintProps } from '../astro/types';
import { baseTheme, baseClientFacts, placeholderImage } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

/** Five placeholder logos — `item.imageUrl` is the asset, `item.title` the brand
 *  name (the alt fallback). A real consumer supplies pre-monochromed SVG/PNG. */
const logoItems = [
  'Northwind',
  'Acme Co.',
  'Globex',
  'Initech',
  'Umbra',
].map((name) => ({
  title: name,
  description: '',
  imageUrl: placeholderImage(160, 48, '#eef2f7', '#33415a', name),
  imageAlt: name,
}));

const staticSection: BlueprintProps['section'] = {
  sectionKey: 'logo-wall-static',
  sectionType: 'content_block',
  heading: 'Trusted by teams everywhere',
  subheading: null,
  body: null,
  cta: null,
  contentMotion: 'none',
  visualNotes: {
    blueprintKey: 'logo_wall',
    moodKeywords: ['trustworthy', 'professional'],
    layoutBlueprint: 'logo_wall',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: logoItems,
};

const marqueeSection: BlueprintProps['section'] = {
  ...staticSection,
  sectionKey: 'logo-wall-marquee',
  contentMotion: 'marquee',
};

const propsFor = (section: BlueprintProps['section']): BlueprintProps => ({
  section,
  clientFacts: baseClientFacts,
  theme: baseTheme,
});

/* ─── Meta ─────────────────────────────────────────────────────── */

const meta: Meta<typeof LogoWall> = {
  title: 'Blueprints/logo-wall',
  component: LogoWall,
  tags: ['surface-web'],
  argTypes: {
    section: { control: false, description: 'Section content shape — sectionKey, heading, items (logos), contentMotion, visualNotes. Set in code.' },
    clientFacts: { control: false, description: 'Site-wide client facts. Set in code.' },
    theme: { control: false, description: 'Theme + archetype config. Set in code.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Renderer for the `logo_wall` blueprint key — a logo / partner / trust strip. The first block to adopt the content-motion axis (ADR-039 §Decision 2): its strip renders static (`contentMotion: none`) or scrolled through the `Marquee` primitive (`contentMotion: marquee`), reduced-motion-gated by construction.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogoWall>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Static logo row — `contentMotion: none`.
 */
export const Default: Story = {
  args: propsFor(staticSection),
};

/**
 * @summary Marquee — logos scroll via the `Marquee` primitive.
 */
export const Marquee: Story = {
  args: propsFor(marqueeSection),
};
