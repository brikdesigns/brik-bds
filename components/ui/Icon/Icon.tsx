import { Icon as IconifyIcon, addCollection, type IconProps, type IconifyJSON } from '@iconify/react';
import phSubset from '../../icons.generated.json';

// Register the curated Phosphor subset once, at module load, into Iconify's
// global icon store. Any `@iconify/react` <Icon> in the app — this wrapper and
// BDS's own components alike — then resolves `ph:*` from bundled data with no
// request to api.iconify.design. The subset (components/icons.generated.json)
// is generated from shipped `ph:*` usage by scripts/gen-icon-collection.mjs.
addCollection(phSubset as IconifyJSON);

export type { IconProps };

/**
 * Phosphor stroke weight. Phosphor encodes weight in the icon *name* —
 * `ph:{name}` (regular), `ph:{name}-bold`, `ph:{name}-fill`, etc. BDS exposes it
 * as a prop and defaults to `bold` (§ Icon weight below).
 */
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

// Non-regular Phosphor weights carry a name suffix; regular carries none. An
// icon whose name already ends in one of these is explicitly weighted and left
// untouched by the `weight` prop.
const PH_WEIGHT_SUFFIXES: readonly Exclude<IconWeight, 'regular'>[] = [
  'thin',
  'light',
  'bold',
  'fill',
  'duotone',
];

/**
 * Apply the requested Phosphor `weight` to a `ph:*` icon name by rewriting the
 * suffix. Non-`ph:*` names, non-string icons (IconifyJSON objects), and names
 * that already carry an explicit weight suffix pass through unchanged.
 */
function applyWeight(icon: IconProps['icon'], weight: IconWeight): IconProps['icon'] {
  if (typeof icon !== 'string' || !icon.startsWith('ph:')) return icon;
  const name = icon.slice('ph:'.length);
  if (PH_WEIGHT_SUFFIXES.some((w) => name.endsWith(`-${w}`))) return icon;
  if (weight === 'regular') return icon;
  return `ph:${name}-${weight}`;
}

export interface BdsIconProps extends IconProps {
  /**
   * Phosphor stroke weight for `ph:*` icons. Defaults to `'bold'` — BDS's
   * standard line density. Icons that already name a weight (e.g.
   * `ph:{name}-fill`) keep it; pass `weight="regular"` to opt back to Phosphor's
   * thin default weight, and non-`ph:*` icons ignore this entirely.
   */
  weight?: IconWeight;
}

/**
 * BDS `<Icon>` — offline-first Iconify wrapper.
 *
 * @summary Phosphor icons from a bundled subset — no runtime CDN fetch
 *
 * Renders Phosphor (`ph:*`) icons from a bundled subset, so first paint never
 * waits on (or silently fails against) the Iconify CDN. API-compatible with
 * `@iconify/react`'s `<Icon>`, so `import { Icon } from '@brikdesigns/bds'` is
 * a drop-in for `import { Icon } from '@iconify/react'`.
 *
 * Offline contract: icons in the bundled subset resolve synchronously with no
 * network. An icon NOT in the subset (a non-`ph:*` set, or a `ph:*` icon not
 * yet used in shipped source) falls through to Iconify's default behaviour — a
 * runtime CDN fetch, rendering an empty sized box until it resolves. Bring more
 * icons offline with {@link addBrikIcons}; a `ph:*` icon used in BDS source is
 * picked up automatically on the next `npm run gen:icons`.
 *
 * ## Icon weight
 *
 * `ph:*` icons render at `bold` weight by default — BDS's standard line density.
 * Pass `weight` to change it (`regular` for Phosphor's default thin stroke,
 * `fill`/`duotone`/`thin`/`light` for the other Phosphor weights). An icon whose
 * name already encodes a weight (`ph:{name}-fill`) is left as-is.
 *
 * @example
 * <Icon icon="ph:rocket" width={24} />            // bold (default)
 * <Icon icon="ph:rocket" weight="regular" />       // Phosphor regular
 */
export function Icon({ weight = 'bold', ...props }: BdsIconProps) {
  return <IconifyIcon {...props} icon={applyWeight(props.icon, weight)} />;
}

/**
 * Register additional Iconify collections for offline resolution.
 *
 * The BDS Phosphor subset is registered automatically when this module loads;
 * consumers with their own icons call this once at app start so theirs resolve
 * offline too:
 *
 * @example
 * import { addBrikIcons } from '@brikdesigns/bds';
 * import myIcons from './my-icons.json';
 * addBrikIcons(myIcons);
 */
export function addBrikIcons(...collections: IconifyJSON[]): void {
  for (const collection of collections) addCollection(collection);
}
