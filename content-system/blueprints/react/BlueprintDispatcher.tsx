/**
 * BlueprintDispatcher (React) — reads `section.visualNotes.blueprintKey`
 * for each section in the array and renders the corresponding React
 * component. Unknown keys render `<BlueprintFallback>`.
 *
 * This is the React twin of `../astro/BlueprintDispatcher.astro`. The
 * Astro dispatcher is the canonical entry-point for Astro consumers
 * (`@brikdesigns/bds/blueprints-astro`). This React dispatcher is the
 * entry-point for Next.js / React consumers — primarily
 * brikdesigns.com. The two share `BlueprintProps`, `BlueprintSection`,
 * `ClientFacts`, and `ResolvedTheme` from `../astro/types` (types are
 * framework-agnostic; the file lives in `astro/` for historical
 * reasons since Astro shipped first).
 *
 * The registry is a table of `{component, props}` entries — the same shape and
 * the same key → (block, layout) mapping as `BlueprintDispatcher.astro` (#2352,
 * ADR-037 §2, canon `blueprints/two-rails-one-canonical`). The component gets
 * the full `BlueprintProps` plus the key's own `layout` / `blueprintKey`:
 *
 *   hero_split                    → Hero            layout="split"
 *   hero_split_image_card_overlay → HeroSplitImageCardOverlay (kept adapter —
 *                                   builds the breadcrumb / pricing-card aside)
 *   hero_interior_minimal         → Hero            layout="interior-minimal"
 *   two_column_detail             → CardGrid        layout="two-column-list"
 *   card_grid                     → CardGrid        layout="card-grid"
 *   callout_split                 → CalloutPanel
 *   feature_grid                  → Features
 *   story_split                   → Narrative
 *   stats_bar                     → StatsBar
 *   testimonials_featured_large   → TestimonialsFeaturedLarge
 *   cta_split_contact             → Cta             layout="split"
 *   cta_centered                  → Cta             layout="default"
 *   logo_wall                     → LogoWall
 *
 * `blueprintKey` goes to the blocks that render a per-key `data-blueprint-key`
 * marker (Hero, Cta, Narrative, Features). CardGrid and CalloutPanel emit their own
 * block-level marker (`card_grid` / `callout_split`), so `two_column_detail`
 * renders `data-blueprint-key="card_grid"` — as on the Astro rail.
 *
 * Adding a new blueprint = one registry entry here + (if it is a new block) one
 * barrel export in `./index.ts`. Keep the React registry in lockstep with the
 * Astro registry — both must list the same keys.
 *
 * ## Contract
 *
 *   Props:
 *     - sections      — ordered array of BlueprintSection
 *     - clientFacts   — passed through to every blueprint
 *     - theme         — passed through to every blueprint
 *
 *   Behavior:
 *     - section.visualNotes.blueprintKey ∈ BLUEPRINT_REGISTRY →
 *         renders the matching block with full BlueprintProps plus the
 *         key's own `layout` / `blueprintKey` props
 *     - section.visualNotes.blueprintKey ∉ BLUEPRINT_REGISTRY →
 *         renders BlueprintFallback (which emits a
 *         data-blueprint-unknown-key attribute for CI grep)
 *     - section.visualNotes is null → falls back
 */
import { Fragment, type ComponentType, type ReactElement } from 'react';

import type {
  BlueprintProps,
  BlueprintSection,
  ClientFacts,
  KnownBlueprintKey,
  ResolvedTheme,
} from '../astro/types';

import { Narrative } from './Narrative';
import { CalloutPanel } from './CalloutPanel';
import { CardGrid } from './CardGrid';
import { Cta } from './Cta';
import { Features } from './Features';
import { Hero } from './Hero';
import { HeroSplitImageCardOverlay } from './HeroSplitImageCardOverlay';
import { StatsBar } from './StatsBar';
import { TestimonialsFeaturedLarge } from './TestimonialsFeaturedLarge';
import { LogoWall } from './LogoWall';
import { BlueprintFallback } from './BlueprintFallback';

// The registry. Key order doesn't matter; lookup is by key. `entry(block, props)`
// pairs a block with the per-key extras (`layout`, and `blueprintKey` for the
// blocks that render the marker) and is type-checked per entry, so a layout a
// block does not support is a compile error, not a silent miss. At render time
// the block receives the full `BlueprintProps` plus those extras, like Astro.
type Registered = (blueprint: BlueprintProps) => ReactElement;
const entry =
  <const P extends object>(Block: ComponentType<BlueprintProps & P>, props: P): Registered =>
  (blueprint) => <Block {...blueprint} {...props} />;

const BLUEPRINT_REGISTRY: Partial<Record<KnownBlueprintKey, Registered>> = {
  hero_split: entry(Hero, { layout: 'split', blueprintKey: 'hero_split' }),
  hero_split_image_card_overlay: entry(HeroSplitImageCardOverlay, {}),
  hero_interior_minimal: entry(Hero, {
    layout: 'interior-minimal',
    blueprintKey: 'hero_interior_minimal',
  }),
  two_column_detail: entry(CardGrid, { layout: 'two-column-list' }),
  card_grid: entry(CardGrid, { layout: 'card-grid' }),
  callout_split: entry(CalloutPanel, {}),
  feature_grid: entry(Features, { blueprintKey: 'feature_grid' }),
  story_split: entry(Narrative, { blueprintKey: 'story_split' }),
  stats_bar: entry(StatsBar, {}),
  testimonials_featured_large: entry(TestimonialsFeaturedLarge, {}),
  cta_split_contact: entry(Cta, { layout: 'split', blueprintKey: 'cta_split_contact' }),
  cta_centered: entry(Cta, { layout: 'default', blueprintKey: 'cta_centered' }),
  logo_wall: entry(LogoWall, {}),
};

interface Props {
  sections: readonly BlueprintSection[];
  clientFacts: ClientFacts;
  theme: ResolvedTheme;
}

/**
 * BlueprintDispatcher — single React entry-point for rendering a
 * page body composed of BlueprintSection[].
 *
 * @example
 * ```tsx
 * <BlueprintDispatcher
 *   sections={page.sections}
 *   clientFacts={facts}
 *   theme={theme}
 * />
 * ```
 */
export function BlueprintDispatcher({ sections, clientFacts, theme }: Props) {
  return (
    <>
      {sections.map((section) => {
        const key = section.visualNotes?.blueprintKey;
        const render = key ? BLUEPRINT_REGISTRY[key] : undefined;
        const blueprint = { section, clientFacts, theme };
        return (
          <Fragment key={section.sectionKey}>
            {render ? render(blueprint) : <BlueprintFallback {...blueprint} />}
          </Fragment>
        );
      })}
    </>
  );
}

export default BlueprintDispatcher;
