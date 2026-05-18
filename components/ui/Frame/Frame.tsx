import { type HTMLAttributes, type ReactNode, type ElementType, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';
import './Frame.css';

/**
 * Aspect-ratio slug. Backed by the `--aspect-*` token family (BDS #486).
 *
 * **Primitives** (numerical, dimension-explicit — preferred for new code):
 * - `1-1`  — 1/1   (square)
 * - `3-2`  — 3/2   (DSLR landscape, service card media)
 * - `2-3`  — 2/3   (DSLR portrait)
 * - `4-3`  — 4/3   (legacy landscape, product shots)
 * - `3-4`  — 3/4   (legacy portrait)
 * - `16-9` — 16/9  (video, hero banners)
 * - `9-16` — 9/16  (vertical video, mobile portrait)
 * - `21-9` — 21/9  (cinematic, full-bleed)
 *
 * **Semantic aliases** (role-named — prefer when the role drives the choice):
 * - `square`            — 1/1
 * - `photo-landscape`   — 3/2
 * - `photo-portrait`    — 2/3
 * - `cinema`            — 16/9
 *
 * **Deprecated mode-words** (kept working for one minor version — migrate
 * to primitives above):
 * - `portrait`  → use `3-4`
 * - `landscape` → use `4-3`
 * - `wide`      → use `16-9` or `cinema`
 * - `ultrawide` → use `21-9`
 */
export type FrameRatio =
  // Primitives
  | '1-1'
  | '3-2'
  | '2-3'
  | '4-3'
  | '3-4'
  | '16-9'
  | '9-16'
  | '21-9'
  // Semantic aliases
  | 'square'
  | 'photo-landscape'
  | 'photo-portrait'
  | 'cinema'
  // Deprecated mode-words
  /** @deprecated Use `3-4` instead. */
  | 'portrait'
  /** @deprecated Use `4-3` instead. */
  | 'landscape'
  /** @deprecated Use `16-9` or `cinema` instead. */
  | 'wide'
  /** @deprecated Use `21-9` instead. */
  | 'ultrawide';

export type FrameFit = 'cover' | 'contain' | 'fill' | 'none';

export interface FrameProps extends HTMLAttributes<HTMLElement> {
  /**
   * Named aspect-ratio slug. Defaults to `4-3` (legacy landscape).
   * See `FrameRatio` for the full vocabulary. Use `customRatio` for one-offs.
   */
  ratio?: FrameRatio;
  /**
   * Custom aspect-ratio string (CSS `aspect-ratio` syntax). Overrides `ratio`
   * when set. Prefer a `FrameRatio` slug; reserve `customRatio` for genuine
   * one-offs that don't fit the canonical vocabulary. Examples: `"5 / 4"`,
   * `"1.618"`.
   */
  customRatio?: string;
  /**
   * How the inner content should fit. Applies `object-fit` to the first
   * `<img>` / `<video>` / `<svg>` descendant. Default `cover`.
   */
  fit?: FrameFit;
  /** HTML element to render as. Default `div`. */
  as?: ElementType;
  /** Slotted child content. */
  children?: ReactNode;
}

/**
 * Frame — aspect-ratio container.
 *
 * For images, videos, illustration slots, and any content that must hold
 * a specific shape regardless of the natural size of its child. Pair with
 * `<img>` or `<Image>` inside; the `fit` prop controls how the image fills
 * the frame.
 *
 * @example
 * ```tsx
 * <Frame ratio="1-1">
 *   <img src="/icon.png" alt="" />
 * </Frame>
 *
 * <Frame ratio="16-9" fit="cover">
 *   <Image src={hero} alt="" fill />
 * </Frame>
 *
 * <Frame ratio="photo-landscape">
 *   <img src="/product.jpg" alt="" />
 * </Frame>
 * ```
 *
 * Multi-platform note: `ratio` maps to SwiftUI `.aspectRatio(_:contentMode:)`
 * and Compose `.aspectRatio()`. The numerical slugs are platform-portable.
 *
 * @summary Aspect-ratio container — for images, videos, illustrations.
 */
export function Frame({
  ratio = '4-3',
  customRatio,
  fit = 'cover',
  as: Element = 'div',
  className,
  style,
  ...props
}: FrameProps) {
  const composedStyle: CSSProperties = {
    ...(customRatio ? { aspectRatio: customRatio } : {}),
    ...style,
  };

  return (
    <Element
      className={bdsClass(
        'bds-frame',
        !customRatio && `bds-frame--ratio-${ratio}`,
        `bds-frame--fit-${fit}`,
        className,
      )}
      style={composedStyle}
      {...props}
    />
  );
}

export default Frame;
