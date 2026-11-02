import type { BlueprintSection } from './types';

/**
 * Applies a section's per-section axes (`align`, `columns`, `media`) over a
 * registry entry's default props (ADR-039). The section value wins; an unset
 * axis is omitted — not passed as `undefined` — so the registry default (or the
 * block's own default) still applies. `media.role` maps to the block's `media`
 * prop and `media.ratio` to its `imageRatio`.
 */
export function resolveSectionProps(
  defaults: Readonly<Record<string, unknown>>,
  section: Pick<BlueprintSection, 'align' | 'columns' | 'media'>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...defaults };
  if (section.align !== undefined) out.align = section.align;
  if (section.columns !== undefined) out.columns = section.columns;
  if (section.media !== undefined) {
    out.media = section.media.role;
    if (section.media.role !== 'none') out.imageRatio = section.media.ratio;
  }
  return out;
}
