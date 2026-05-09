import { type HTMLAttributes, type ReactNode, type ElementType, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';
import './Frame.css';

/**
 * Named aspect-ratio presets for the most common Brik image/illustration shapes:
 * - `square`    — 1/1
 * - `portrait`  — 3/4
 * - `landscape` — 4/3
 * - `wide`      — 16/9
 * - `ultrawide` — 21/9
 */
export type FrameRatio = 'square' | 'portrait' | 'landscape' | 'wide' | 'ultrawide';
export type FrameFit = 'cover' | 'contain' | 'fill' | 'none';

export interface FrameProps extends HTMLAttributes<HTMLElement> {
  /** Named aspect-ratio preset. Use `customRatio` for arbitrary ratios. */
  ratio?: FrameRatio;
  /**
   * Custom aspect-ratio string (CSS `aspect-ratio` syntax). Overrides `ratio`
   * when set. Examples: `"3 / 2"`, `"5 / 4"`, `"1.618"`.
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
 * <Frame ratio="square">
 *   <img src="/icon.png" alt="" />
 * </Frame>
 *
 * <Frame ratio="wide" fit="cover">
 *   <Image src={hero} alt="" fill />
 * </Frame>
 *
 * <Frame customRatio="3 / 2">
 *   <video src={preview} />
 * </Frame>
 * ```
 *
 * Multi-platform note: `ratio` maps to SwiftUI `.aspectRatio(_:contentMode:)`
 * and Compose `.aspectRatio()`. The named presets are platform-portable.
 *
 * @summary Aspect-ratio container — for images, videos, illustrations.
 */
export function Frame({
  ratio = 'landscape',
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
