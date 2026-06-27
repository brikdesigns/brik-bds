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
 * @example
 * <Icon icon="ph:rocket" width={24} />
 */
export function Icon(props: IconProps) {
  return <IconifyIcon {...props} />;
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
