/**
 * HeroMediaCardImage — presentational hero media-card image (brik-bds#2284).
 * Wraps the existing `<Frame>` primitive so `.bds-hero__image-frame` /
 * `.bds-hero__image` are never hand-typed by a consumer — extracted
 * class-identical from `HeroSplitImageCardOverlay.tsx:127-134`.
 *
 * Composes with `<HeroMediaCard>` as its first child.
 *
 * @summary Hero media-card image — a `Frame`-wrapped `<img>`, class-identical to the legacy adapter's inline markup.
 */
import { type HTMLAttributes } from 'react';

import { Frame, type FrameRatio } from '../../../components/ui/Frame/Frame';
import { bdsClass } from '../../../components/utils';

export interface HeroMediaCardImageProps extends HTMLAttributes<HTMLElement> {
  /** Image URL. */
  src: string;
  /** Accessible alt text. Defaults to empty (decorative), matching the adapter's fallback. */
  alt?: string;
  /** Aspect ratio for the `Frame`. Default `"square"`, matching the adapter's `imageRatio` default. */
  ratio?: FrameRatio;
}

export function HeroMediaCardImage({
  src,
  alt = '',
  ratio = 'square',
  className,
  ...rest
}: HeroMediaCardImageProps) {
  return (
    <Frame ratio={ratio} className={bdsClass('bds-hero__image-frame', className)} {...rest}>
      <img src={src} alt={alt} loading="eager" decoding="async" className="bds-hero__image" />
    </Frame>
  );
}

export default HeroMediaCardImage;
