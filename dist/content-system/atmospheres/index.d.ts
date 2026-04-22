/**
 * Atmosphere manifest — maps atmosphere slug to its CSS asset path.
 *
 * Consumers (portal generate-theme-css.ts, docs renderers) can read this
 * to resolve the canonical @import path for an atmosphere without
 * string-building by hand.
 *
 * CSS files live as siblings and are exported through the package
 * exports field in package.json under `./atmospheres/*.css`.
 */
import type { Atmosphere } from '../vocabularies/atmosphere';
export interface AtmosphereManifestEntry {
    slug: Atmosphere;
    cssPath: string;
    themeMode: 'light' | 'dark' | null;
    /** One-line description for admin UI tooltips. */
    blurb: string;
    /** Short industries/verticals that naturally fit this atmosphere. */
    naturalFit: readonly string[];
}
export declare const ATMOSPHERE_MANIFEST: Record<Atmosphere, AtmosphereManifestEntry>;
/**
 * Resolve the @import path for an atmosphere slug. Used by the portal
 * theme generator to emit a canonical import reference into the stored
 * theme CSS artifact.
 */
export declare function getAtmosphereImportPath(atmosphere: Atmosphere): string;
//# sourceMappingURL=index.d.ts.map