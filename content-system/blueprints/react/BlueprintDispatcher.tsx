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
 * Adding a new blueprint = one import + one registry entry here +
 * one barrel export in `./index.ts`. Keep the React registry in
 * lockstep with the Astro registry — both must list the same keys.
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
 *         renders the matching component with full BlueprintProps
 *     - section.visualNotes.blueprintKey ∉ BLUEPRINT_REGISTRY →
 *         renders BlueprintFallback (which emits a
 *         data-blueprint-unknown-key attribute for CI grep)
 *     - section.visualNotes is null → falls back
 *
 * ## v0.1 React registry (1 blueprint)
 *
 * The React renderer surface starts with `services_3col_card_grid`,
 * the blueprint that drives brikdesigns.com service-line index pages.
 * Subsequent React renderers (HeroSplit6040, HeroInteriorMinimal,
 * etc. — Workstream A in the gap audit) ship in their own PRs and
 * each appends one entry here.
 */
import type { ComponentType } from 'react';

import type {
  BlueprintProps,
  BlueprintSection,
  ClientFacts,
  KnownBlueprintKey,
  ResolvedTheme,
} from '../astro/types';

import { Services3ColCardGrid } from './Services3ColCardGrid';
import { SupportPlanCalloutSplit } from './SupportPlanCalloutSplit';
import { BlueprintFallback } from './BlueprintFallback';

const BLUEPRINT_REGISTRY: Partial<
  Record<KnownBlueprintKey, ComponentType<BlueprintProps>>
> = {
  services_3col_card_grid: Services3ColCardGrid,
  support_plan_callout_split: SupportPlanCalloutSplit,
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
        const Component =
          (key && BLUEPRINT_REGISTRY[key]) || BlueprintFallback;
        return (
          <Component
            key={section.sectionKey}
            section={section}
            clientFacts={clientFacts}
            theme={theme}
          />
        );
      })}
    </>
  );
}

export default BlueprintDispatcher;
