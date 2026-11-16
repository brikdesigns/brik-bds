import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Hero.css';
import split from './__generated__/Hero--split.html?raw';
import interiorMinimal from './__generated__/Hero--interior-minimal.html?raw';
import withPricingCard from './__generated__/Hero--with-pricing-card.html?raw';
import centered from './__generated__/Hero--centered.html?raw';
import statement from './__generated__/Hero--statement.html?raw';
import statementDecoration from './__generated__/Hero--statement-decoration.html?raw';
import splitMediaStart from './__generated__/Hero--split-media-start.html?raw';
import splitVertical from './__generated__/Hero--split-vertical.html?raw';

/**
 * `Hero.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/hero`.
 *
 * Render-mode by necessity (ADR-010 Q4): the subject is server-rendered markup,
 * which no arg can express. Section content is fixed to the React twin's fixture
 * so the two entries differ only by rail.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-hero',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Split — the default hero layout, content beside photography. */
export const Default: Story = { render: () => <AstroFrame html={split} /> };

/** @summary Interior-minimal — headline + lead only, for interior pages. */
export const InteriorMinimal: Story = { render: () => <AstroFrame html={interiorMinimal} /> };

/** @summary With-pricing-card — service hero with a price overlay. */
export const WithPricingCard: Story = { render: () => <AstroFrame html={withPricingCard} /> };

/** @summary Centered — single centred column, no media. */
export const Centered: Story = { render: () => <AstroFrame html={centered} /> };

/** @summary Split, media-start — media column first */
export const SplitMediaStart: Story = { render: () => <AstroFrame html={splitMediaStart} /> };

/** @summary Split, vertical — content over 16-9 media */
export const SplitVertical: Story = { render: () => <AstroFrame html={splitVertical} /> };

/** @summary Statement — short headline + one CTA, no decoration */
export const Statement: Story = { render: () => <AstroFrame html={statement} /> };

/** @summary Statement, light — with right-hand decoration */
export const StatementLight: Story = {
  globals: { themeNumber: 'brik', atmosphere: 'none' },
  render: () => <AstroFrame html={statementDecoration} />,
};

/**
 * The dark surface is the theme mode (`brik-dark`), not a class on the block:
 * `Hero.astro` pins no surface, so background, headline, eyebrow and CTA all
 * resolve from the section's own tokens, with the `cinematic-dramatic`
 * atmosphere layered on top.
 *
 * @summary Statement, dark — same markup, dark theme + atmosphere
 */
export const StatementDark: Story = {
  globals: { themeNumber: 'brik-dark', atmosphere: 'cinematic-dramatic' },
  render: () => <AstroFrame html={statementDecoration} />,
};
