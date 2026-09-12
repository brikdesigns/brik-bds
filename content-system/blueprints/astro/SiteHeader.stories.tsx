import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/SiteHeader.css';
import editorialTransparent from './__generated__/SiteHeader--editorial-transparent.html?raw';
import utilityFirst from './__generated__/SiteHeader--utility-first.html?raw';
import serviceCentric from './__generated__/SiteHeader--service-centric.html?raw';
import portfolioMinimal from './__generated__/SiteHeader--portfolio-minimal.html?raw';
import calmFlat from './__generated__/SiteHeader--calm-flat.html?raw';

/**
 * The real `<SiteHeader>` on the canonical Astro rail (ADR-037), one story per
 * `NAV_ARCHETYPE_VALUES` entry, pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Retires the `NavigationIASpec` mock
 * (#2431): the surface now shows the component that ships, so which archetypes
 * render distinctly (#2373) is verifiable rather than approximated.
 *
 * Mechanism is ADR-039 — Astro output pre-rendered to static HTML in a React
 * story shell — the same path #2339 chose for the eight blocks; the shell
 * component reuses it rather than re-mocking. The client scroll + drawer runtime
 * is not present here: each story is the header's top/rest state, which no arg
 * can express (render-mode by necessity, ADR-010 Q4).
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Foundation/Navigation Archetypes',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Overlays the hero; transparent → frosted on scroll. */
export const EditorialTransparent: Story = { render: () => <AstroFrame html={editorialTransparent} /> };

/** @summary Task surface; always-solid, mega-menu, never hides. */
export const UtilityFirst: Story = { render: () => <AstroFrame html={utilityFirst} /> };

/** @summary Mega-menu is the product; solid bar + featured card. */
export const ServiceCentric: Story = { render: () => <AstroFrame html={serviceCentric} /> };

/** @summary Text-only, no dropdowns, reveal-on-scroll. */
export const PortfolioMinimal: Story = { render: () => <AstroFrame html={portfolioMinimal} /> };

/** @summary Low-stimulation; muted, always solid, single CTA. */
export const CalmFlat: Story = { render: () => <AstroFrame html={calmFlat} /> };
