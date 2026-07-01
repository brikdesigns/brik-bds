import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { Frame, type FrameRatio, type FrameFit } from '../Frame';
import './Image.css';

export interface ImageProps extends HTMLAttributes<HTMLElement> {
  /** Image URL. */
  src: string;
  /**
   * Accessible alt text. Required — pass `alt=""` explicitly for purely
   * decorative images so screen readers skip them.
   */
  alt: string;
  /**
   * Named aspect-ratio slug. When set, the image is wrapped in a `<Frame>`
   * that locks the shape (via the `--aspect-*` token family) and reserves
   * layout space before the image loads — the primary CLS-prevention lever.
   * Omit for images that should render at their natural ratio.
   */
  ratio?: FrameRatio;
  /**
   * How the image fills its frame. Only meaningful together with `ratio`.
   * Default `cover`. Passed through to the wrapping `<Frame>`.
   */
  fit?: FrameFit;
  /**
   * `object-position` for the image inside its frame (e.g. `"top"`,
   * `"50% 25%"`). Only meaningful together with `ratio` + a cropping `fit`.
   */
  position?: string;
  /**
   * Load eagerly and hint high fetch priority. Use for the LCP image
   * (above-the-fold hero) only — defeats the default lazy loading.
   */
  eager?: boolean;
  /** Responsive `srcset` — pass-through to the `<img>`. */
  srcSet?: string;
  /** Responsive `sizes` — pass-through to the `<img>`. */
  sizes?: string;
  /**
   * Intrinsic pixel `width`. Supply with `height` to prevent layout shift
   * even when `ratio` is omitted.
   */
  width?: number | string;
  /** Intrinsic pixel `height`. See `width`. */
  height?: number | string;
  /** Optional caption; renders as a `<figcaption>` below the image. */
  caption?: ReactNode;
}

/**
 * Image — SEO- and CLS-aware `<img>` wrapper.
 *
 * Renders a semantic `<figure>` + `<img>` (+ optional `<figcaption>`). Lazy
 * loads and async-decodes by default; set `eager` for the LCP image. When
 * `ratio` is set the image is wrapped in a `<Frame>` so the shape is locked
 * to the `--aspect-*` token family and layout space is reserved before load.
 *
 * Not an image-optimization layer — pair with `next/image` / `@astrojs/image`
 * or a CDN at the consumer level for resizing and format negotiation. This
 * component owns the design-system constraints: shape, fit, and semantics.
 *
 * @example
 * ```tsx
 * <Image src="/hero.jpg" alt="Team at work" ratio="16-9" eager />
 *
 * <Image
 *   src="/portrait.jpg"
 *   alt="Dr. Alice Chen"
 *   ratio="3-4"
 *   caption="Dr. Alice Chen, Lead Orthodontist"
 * />
 * ```
 *
 * @summary SEO- and CLS-aware img wrapper with ratio + caption
 */
export function Image({
  src,
  alt,
  ratio,
  fit = 'cover',
  position,
  eager = false,
  srcSet,
  sizes,
  width,
  height,
  caption,
  className,
  style,
  ...props
}: ImageProps) {
  const img = (
    <img
      className="bds-image__image"
      src={src}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      style={position ? { objectPosition: position } : undefined}
    />
  );

  return (
    <figure className={bdsClass('bds-image', className)} style={style} {...props}>
      {ratio ? (
        <Frame className="bds-image__media" ratio={ratio} fit={fit}>
          {img}
        </Frame>
      ) : (
        img
      )}
      {caption != null && <figcaption className="bds-image__caption">{caption}</figcaption>}
    </figure>
  );
}

export default Image;
