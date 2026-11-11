import { Texture, type TextureProps, type TextureVariant } from './Texture';

// Kept out of Texture.tsx: a `@deprecated` value export there reads as the
// whole component being deprecated (lint-story-shape `deprecated-manifest`).

/** @deprecated Renamed `Texture`. Removable next major (brik-bds#3080). */
export const BackgroundPattern = Texture;
/** @deprecated Renamed `TextureProps`. */
export type BackgroundPatternProps = TextureProps;
/** @deprecated Renamed `TextureVariant`. */
export type BackgroundPatternVariant = TextureVariant;
