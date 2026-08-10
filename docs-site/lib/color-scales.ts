/**
 * The 11-step color ramps, read from the generated source rather than transcribed.
 *
 * `design-tokens/color-ramps.generated.json` is the output of
 * `scripts/generate-color-ramps.mjs` (brik-bds#1737) and is gated by
 * `npm run gen:color-ramps:check`. Deriving the docs swatches from it means the
 * Color page cannot drift from the shipped ramp the way the 6-step prose did
 * (brik-bds#1753) — there is no hex value to hand-maintain here.
 *
 * The palettes exported from `tokens/index.ts` still carry the six legacy anchor
 * names because they are public API of `@brikdesigns/bds`. This module is
 * docs-only and deliberately not re-exported from there.
 */

import ramps from '../../design-tokens/color-ramps.generated.json';

type RampStop = {
  $value: string;
  $extensions?: {
    'com.brikdesigns.ramp'?: {
      source: 'anchor' | 'generated';
      legacyName?: string;
      midpointOf?: string[];
    };
  };
};

const families = ramps.brik['primitives/value'].color as unknown as Record<
  string,
  Record<string, RampStop>
>;

/** Ramp order, lightest → darkest. The generator emits exactly these eleven. */
export const STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;

/** `{ poppy: { '50': '#fff7f5', … }, … }` — the shape `<PaletteGrid>` consumes. */
export const colorScales: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(families).map(([family, stops]) => [
    family,
    Object.fromEntries(STOPS.map((s) => [s, stops[s].$value])),
  ]),
);

/**
 * `{ '100': 'lightest', … }` — the six deprecated aliases and the stops they
 * resolve to. Uniform across all nine families (asserted by the generator's
 * anchor pinning), so one map serves every ramp.
 */
export const legacyAliasByStop: Record<string, string> = Object.fromEntries(
  Object.entries(families.poppy)
    .map(([stop, def]) => [stop, def.$extensions?.['com.brikdesigns.ramp']?.legacyName])
    .filter((entry): entry is [string, string] => Boolean(entry[1])),
);

export const {
  grayscale,
  poppy,
  tan,
  orange,
  yellow,
  green,
  blue,
  purple,
  pink,
} = colorScales;
