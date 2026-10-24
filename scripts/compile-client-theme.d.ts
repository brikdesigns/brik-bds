/**
 * Type definitions for @brikdesigns/bds/compile-client-theme.
 *
 * Source: scripts/compile-client-theme.mjs (hand-authored ESM, Node-only —
 * it runs Style Dictionary). These types are hand-written to keep the .mjs
 * file portable and out of the BDS lib build.
 */

/**
 * A Brand Kit, shaped like design-tokens/brand-kits/brik.json (Tokens Studio sets).
 * A kit without a `grayscale` family is compiled with the Foundations grayscale.
 */
export type BrandKit = Record<string, unknown>;

export interface CompileClientThemeOptions {
  /** Foundations Library. Default: the design-tokens/foundations.json this package ships. */
  foundations?: Record<string, unknown>;
  /** Mode per collection (e.g. `{ color: 'dark' }`), over the build's defaults. */
  modes?: Record<string, string>;
  /** Rule the custom properties are declared on. Default `:root`. */
  selector?: string;
}

/**
 * Compile a Brand Kit to the `--bds-*` custom-property sheet, in memory, with
 * the same ramp generator, merge, flatten and Style Dictionary platform as the
 * committed Brik build. Reads Foundations unless passed; writes no file; never
 * mutates `kit`.
 */
export function compileClientTheme(kit: BrandKit, opts?: CompileClientThemeOptions): Promise<string>;
