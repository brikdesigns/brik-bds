import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Hero } from './Hero';
import type { BlueprintProps } from '../astro/types';
import { baseClientFacts, baseTheme, placeholderImage } from './_fixtures';

const meta: Meta<typeof Hero> = {
  title: 'Blueprints/hero',
  component: Hero,
  tags: ['surface-web'],
  argTypes: {
    sectionKey: { control: 'text', description: 'Unique section key — drives element ids.' },
    layout: { control: 'inline-radio', options: ['split', 'interior-minimal', 'with-pricing-card', 'centered'], description: 'Structural layout modifier per ADR-008 §3.' },
    align: { control: 'inline-radio', options: ['left', 'center'], description: 'Content-column placement (structure axis, ADR-039). `left` default; `center` emits `bds-hero--align-center`.' },
    subtitle: { control: 'text', description: 'Eyebrow above the h1.' },
    title: { control: 'text', description: 'Page h1 — Hero blueprints own the page heading. Accepts a node, so inline emphasis (`<em>`) can sit inside it.' },
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
      src={placeholderImage(960, 1200, '#eaf1fb', '#1f3d70', 'Hero')}
      alt=""
      width={960}
      height={1200}
    />
  </div>
);

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * `layout="split"` renders the two-column grid with a composed `media` node.
 * Replaces the legacy `hero_split`.
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
  // Toolbar > Atmosphere paints per-section effects only on
  // `section[data-ambient]`; story-level so Hero's default is unchanged (#529).
  render: (args) => <Hero {...args} data-ambient="top-right" />,
};

/**
 * Distinct meaningful state: `layout="interior-minimal"` drops the media
 * column and constrains the measure for interior pages. Replaces the legacy
 * `hero_interior_minimal`.
 *
 * @summary Interior-minimal — narrow column, no media
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
 * Distinct meaningful state: `align="center"` centres the content stack
 * (structure axis, ADR-039). The default `left` is the flush-start hero.
 *
 * @summary Align-center — centred content column
 */
export const AlignCenter: Story = {
  args: {
    ...Default.args,
    sectionKey: 'hero-align-center',
    align: 'center',
  },
};

/**
 * `layout="centered"`: a single centred column with no media, its measure capped
 * by `--bds-content-width-md`. The h1 takes the standard ramp until a consumer
 * sets `--bds-hero-title-font-family` / `-font-size` — shown here with the display
 * pair, which is how a centred display hero is expressed without a selector override.
 *
 * @summary Centered — one centred column, display title via hooks
 */
export const Centered: Story = {
  args: {
    ...Default.args,
    sectionKey: 'hero-centered',
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          ['--bds-hero-title-font-family' as string]: 'var(--bds-font-family-display)',
          ['--bds-hero-title-font-size' as string]: 'var(--bds-display-lg)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/**
 * `title` is a `ReactNode`: inline emphasis sits inside the one `h1`, and the
 * `<em>` inherits the heading's family, size and colour — it only adds italics.
 *
 * @summary Title with inline emphasis
 */
export const TitleWithEmphasis: Story = {
  args: {
    ...Default.args,
    sectionKey: 'hero-title-emphasis',
    title: (
      <>
        Care that feels <em>personal</em>
      </>
    ),
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
      <div className="bds-blueprint-section__missing bds-hero__missing" data-content-needed="hero_image_url" role="presentation">
        <p className="bds-blueprint-section__missing-label">Hero image missing for this client.</p>
      </div>
    ),
  },
};

/* ─── Dispatched (section-driven) ──────────────────────────────────
 *
 * The same block, driven by a `BlueprintSection` instead of composed props —
 * what `BlueprintDispatcher` renders for the `hero_split` /
 * `hero_interior_minimal` keys (#2352). The `layout` + `blueprintKey` args are
 * the ones the dispatcher registry passes.
 */

const splitSection: BlueprintProps['section'] = {
  sectionKey: 'hero-split-default',
  sectionType: 'hero',
  title: 'A clear, compelling headline goes here.',
  subtitle: 'Acme',
  body: 'One or two sentences of supporting copy — long enough to set the rhythm of body type next to the headline without overwhelming it.',
  cta: { label: 'Learn more', url: '#' },
  visualNotes: {
    blueprintKey: 'hero_split',
    moodKeywords: ['professional', 'modern'],
    layoutBlueprint: 'hero_split',
    imageOpportunity: 'studio photography',
    illustrationOpportunity: null,
  },
  items: [],
};

const interiorSection: BlueprintProps['section'] = {
  sectionKey: 'hero-interior-default',
  sectionType: 'hero',
  title: 'Interior page headline.',
  subtitle: 'Section',
  body: 'A short interior-page lead — one sentence of supporting copy that frames the page topic without competing with the headline.',
  cta: null,
  visualNotes: {
    blueprintKey: 'hero_interior_minimal',
    moodKeywords: ['professional'],
    layoutBlueprint: 'hero_interior_minimal',
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  items: [],
};

/**
 * `section` + `clientFacts.heroImageUrl` → the split layout, with the 4:5 image
 * built by the block (the `hero_split` key).
 *
 * @summary Dispatched split — section data + hero image
 */
export const DispatchedSplit: Story = {
  args: {
    section: splitSection,
    clientFacts: { ...baseClientFacts, heroImageUrl: placeholderImage(960, 1200, '#eaf1fb', '#1f3d70', 'Hero') },
    theme: baseTheme,
    layout: 'split',
    blueprintKey: 'hero_split',
  },
};

/** @summary Dispatched split, no hero image — content-needed stub */
export const DispatchedSplitMissingImage: Story = {
  args: {
    section: splitSection,
    clientFacts: baseClientFacts,
    theme: baseTheme,
    layout: 'split',
    blueprintKey: 'hero_split',
  },
};

/** @summary Dispatched interior-minimal — eyebrow + h1 + lead, no CTA */
export const DispatchedInteriorMinimal: Story = {
  args: {
    section: interiorSection,
    clientFacts: baseClientFacts,
    theme: baseTheme,
    layout: 'interior-minimal',
    blueprintKey: 'hero_interior_minimal',
  },
};

/* ─── Breadcrumb slot rhythm (#2288) ──────────────────────────────────────── */

const crumbs = [{ label: 'Services', href: '/services' }, { label: 'Brand' }];

/** Resolved px of a length token, read off a probe so the assertion tracks the token. */
const resolveToken = (host: HTMLElement, token: string): number => {
  const probe = host.ownerDocument.createElement('div');
  probe.style.height = `var(${token})`;
  host.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
};

/**
 * The breadcrumb→title step is carried by the `.bds-hero__breadcrumb` element's
 * own `margin-bottom`, so a consumer reset on that class reaches it. A
 * `display: contents` wrapper moved the margin onto a child the reset could not
 * reach: a consumer zeroing `.bds-hero__breadcrumb` (brikdesigns) got +6px.
 *
 * @summary Breadcrumb margin is overridable at the class
 */
export const InteractionTestBreadcrumbMarginOverride: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    sectionKey: 'hero-breadcrumb-override',
    layout: 'interior-minimal',
    title: 'Brand',
    breadcrumb: <Breadcrumb items={crumbs} />,
  },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector<HTMLElement>('.bds-hero__breadcrumb')!;
    const nav = wrapper.querySelector<HTMLElement>('.bds-breadcrumb')!;
    const title = canvasElement.querySelector<HTMLElement>('.bds-hero__title')!;
    const gapSm = resolveToken(canvasElement, '--bds-gap-sm');
    const step = () => title.getBoundingClientRect().top - nav.getBoundingClientRect().bottom;

    // Default rhythm: one --bds-gap-sm step, on the element that carries the class.
    await expect(getComputedStyle(wrapper).display).not.toBe('contents');
    await expect(getComputedStyle(wrapper).marginBottom).toBe(`${gapSm}px`);
    await expect(Math.abs(step() - gapSm)).toBeLessThan(0.5);

    // The consumer reset: the class's own margin is zeroed, and the step goes with it.
    const reset = canvasElement.ownerDocument.createElement('style');
    reset.textContent = '.bds-hero__breadcrumb { margin-bottom: 0; }';
    canvasElement.ownerDocument.head.appendChild(reset);
    try {
      await expect(Math.abs(step())).toBeLessThan(0.5);
    } finally {
      reset.remove();
    }
  },
};

/**
 * An inline-level breadcrumb root (the old inline-flex switcher) sits in the
 * slot without a line-box strut: the wrapper is exactly as tall as the child
 * (a block wrapper added +4px at 390px, #2284).
 *
 * @summary Inline-level breadcrumb adds no strut
 */
export const InteractionTestBreadcrumbNoStrut: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    sectionKey: 'hero-breadcrumb-strut',
    layout: 'interior-minimal',
    title: 'Brand',
    breadcrumb: <span data-testid="inline-crumb" style={{ display: 'inline-flex' }}>Services / Brand</span>,
  },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector<HTMLElement>('.bds-hero__breadcrumb')!;
    const crumb = canvasElement.querySelector<HTMLElement>('[data-testid="inline-crumb"]')!;
    await expect(
      Math.abs(wrapper.getBoundingClientRect().height - crumb.getBoundingClientRect().height),
    ).toBeLessThan(0.5);
  },
};
