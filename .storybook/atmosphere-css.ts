import type { Atmosphere } from '../content-system/vocabularies/atmosphere';

// Atmosphere CSS is resolved per slug so a story or the toolbar can load the
// correct asset at runtime. Using `new URL(path, import.meta.url)` — Vite
// handles this as an asset reference and emits the same hashed URL at build
// time that a `?url` import would produce. Chose this shape over `?url`
// imports because the anti-slop scanner's import resolver doesn't strip
// query-string suffixes and flags the `?url` paths as unresolvable
// (pre-existing false positive from PR #188).
export const atmosphereCssMap: Record<Atmosphere, string> = {
  'editorial-luxury': new URL('../content-system/atmospheres/editorial-luxury.css', import.meta.url).href,
  'cinematic-dramatic': new URL('../content-system/atmospheres/cinematic-dramatic.css', import.meta.url).href,
  'minimal-clinical': new URL('../content-system/atmospheres/minimal-clinical.css', import.meta.url).href,
  'warm-soft': new URL('../content-system/atmospheres/warm-soft.css', import.meta.url).href,
  'clean-bright': new URL('../content-system/atmospheres/clean-bright.css', import.meta.url).href,
  'organic-textured': new URL('../content-system/atmospheres/organic-textured.css', import.meta.url).href,
  'none': new URL('../content-system/atmospheres/none.css', import.meta.url).href,
};
