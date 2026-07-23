import type { Meta, StoryObj } from '@storybook/react-vite';

import { Hero } from './Hero';

const meta: Meta<typeof Hero> = {
  title: 'Blueprints/hero',
  component: Hero,
  tags: ['surface-web'],
  argTypes: {
    sectionKey: { control: 'text', description: 'Unique section key — drives element ids.' },
    layout: { control: 'inline-radio', options: ['split', 'interior-minimal', 'with-pricing-card'], description: 'Structural layout modifier per ADR-008 §3.' },
    subtitle: { control: 'text', description: 'Eyebrow above the h1.' },
    title: { control: 'text', description: 'Page h1 — Hero blueprints own the page heading.' },
    lead: { control: 'text', description: 'Supporting lead paragraph.' },
    cta: { control: false, description: 'Primary action `{ label, url }`.' },
    media: { control: false, description: 'Composed media column node for `layout="split"`.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `bds-hero` page-hero section primitive (brik-bds#583). One block, a shared content column (breadcrumb → eyebrow → h1 → lead → CTA), and structural-modifier layouts per ADR-008 §3: `bds-hero--interior-minimal` (content only), `bds-hero--split` (content + a composed `media` column), and `bds-hero--with-pricing-card` (interior split with a breadcrumb trail + an `aside` image/price card, brik-bds#1165). Replaces the per-blueprint `bp-hero-*` classes. Hero blueprints own the page `h1`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

const demoImage = (
  <div className="bds-hero__media">
    <img
      className="bds-hero__image"
      src="https://placehold.co/960x1200/eaf1fb/1f3d70?text=Hero"
      alt=""
      width={960}
      height={1200}
    />
  </div>
);

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * `layout="split"` renders the two-column grid with a composed `media` node.
 * Replaces the legacy `hero_split_60_40`.
 *
 * @summary Split — content + media column (60/40 flagship)
 */
export const Default: Story = {
  args: {
    sectionKey: 'hero-split',
    layout: 'split',
    subtitle: 'Marketing design',
    title: 'Websites that turn visitors into customers',
    lead: 'A short lead that frames the offering and earns the scroll — one or two sentences, benefit-forward.',
    cta: { label: 'Start a project', url: '#start' },
    media: demoImage,
  },
};

/**
 * @summary Interior-minimal — single narrow content column, no media.
 *
 * Distinct meaningful state: `layout="interior-minimal"` drops the media
 * column and constrains the measure for interior pages. Replaces the legacy
 * `hero_interior_minimal`.
 */
export const InteriorMinimal: Story = {
  args: {
    sectionKey: 'hero-interior',
    layout: 'interior-minimal',
    subtitle: 'Services',
    title: 'Web design & development',
    lead: 'An interior-page hero: eyebrow, headline, and an optional lead — no image, tighter measure.',
    cta: { label: 'See our work', url: '#work' },
  },
};

/**
 * When a client has no hero image the adapter passes a stub node as `media`
 * instead of an `<img>`; CI grep on `data-content-needed` blocks publish.
 *
 * @summary Split layout with the data-content-needed stub
 */
export const MissingImage: Story = {
  args: {
    ...Default.args,
    sectionKey: 'hero-split-missing',
    media: (
      <div className="bds-hero__missing" data-content-needed="hero_image_url" role="presentation">
        <p className="bds-hero__missing-label">Hero image missing for this client.</p>
      </div>
    ),
  },
};
