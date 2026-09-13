/**
 * BlockMedia — the shared media primitive for the blueprint media axis
 * (ADR-039 §Media axis, brik-bds#2493). React twin of `../astro/_Media.astro`.
 *
 * A blueprint never hand-rolls `<video>` markup, an `aspect-ratio`, or an
 * autoplay attribute. It selects a `media` value from the closed `BlueprintMedia`
 * union and BlockMedia renders the matching element wrapped in the `<Frame>`
 * primitive for aspect-lock — so the ratio comes from the token-backed
 * `bds-frame--ratio-*` vocabulary, not a hand-written `aspect-ratio` (which
 * `lint-blueprint-naming`'s `hardcoded-aspect-ratio` rule bans in blueprint CSS).
 *
 *   image    — a still `<img>`. Lazy by default (`loading`), `eager` for LCP media.
 *   video    — a foreground, user-controlled player (`controls`, no autoplay).
 *   bg-video — an ambient muted/loop video. **Reduced-motion-gated by
 *              construction**: it carries NO `autoplay` attribute (so the server
 *              HTML and any JS-off client rest on the `poster`); an effect starts
 *              playback only when `prefers-reduced-motion` is not set, and pauses
 *              it live when the setting flips. Lazy via `preload="none"`. This is
 *              the same gate the Astro twin's inline guard applies, and it is
 *              stronger than an `autoPlay={!reduced}` attribute — which ships
 *              `autoplay` in SSR and cannot pause an already-playing element.
 *   none     — renders nothing.
 *
 * The `ratio` prop is the `ratio` half of the axis (deferred here from #2492).
 *
 * The `bds-block-media*` / `bds-frame*` classes are single-sourced in
 * `BlockMedia.css` + `Frame.css` (→ `dist/styles.css`) so `canonical-class-check`
 * sees them and the Astro twin can emit the equivalent markup (ADR-040).
 *
 * @summary Blueprint media primitive — a `Frame`-wrapped `img`/`video` selected by the `media` axis, with reduced-motion-gated `bg-video`.
 */
import { type HTMLAttributes, useEffect, useRef } from 'react';

import { Frame, type FrameFit, type FrameRatio } from '../../../components/ui/Frame/Frame';
import { usePrefersReducedMotion } from '../../../components/ui/shared';
import { bdsClass } from '../../../components/utils';
import type { BlueprintMedia } from '../astro/types';
import './BlockMedia.css';

export interface BlockMediaProps extends HTMLAttributes<HTMLElement> {
  /** Which media the block carries. See `BlueprintMedia`. */
  media: BlueprintMedia;
  /**
   * Media source URL — the image for `image`, the video for `video` / `bg-video`.
   * When absent (or `media` is `none`) BlockMedia renders nothing; the caller
   * renders its own `data-content-needed` stub.
   */
  src?: string | null;
  /**
   * Poster still for `video` / `bg-video` — shown before playback, with JS off,
   * and under `prefers-reduced-motion` for `bg-video`. Ignored for `image`.
   */
  poster?: string | null;
  /** Alt text for `image`. Defaults to empty (decorative — the block's heading conveys meaning). */
  alt?: string;
  /** `Frame` aspect ratio. Defaults to `16-9` (video-native). */
  ratio?: FrameRatio;
  /** How the media fits the frame. Defaults to `cover`. Mirrors the Astro twin. */
  fit?: FrameFit;
  /**
   * `<img>` loading hint for `image`. Defaults to `lazy`; pass `eager` for
   * above-the-fold / LCP media (e.g. the hero image). Ignored for video.
   */
  loading?: 'eager' | 'lazy';
}

export function BlockMedia({
  media,
  src,
  poster,
  alt = '',
  ratio = '16-9',
  fit = 'cover',
  loading = 'lazy',
  className,
  ...rest
}: BlockMediaProps) {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isBgVideo = media === 'bg-video';

  // bg-video reduced-motion gate (AC3). The element carries NO `autoplay`
  // attribute; this effect is the only thing that starts it, and only when
  // motion is allowed. `usePrefersReducedMotion` starts `false` (its documented
  // SSR-safe default), so the first client pass may call `play()` — but with
  // `preload="none"` nothing is buffered yet, so no frame paints before the
  // setting resolves and pauses it. Removing an `autoplay` attribute would not
  // pause a playing element; `pause()` does.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isBgVideo) return;
    if (reduced) {
      video.pause();
    } else {
      // A muted `bg-video` is autoplay-policy-eligible, so this normally
      // resolves; a rejection is an anomaly (detached element, decode failure).
      // The poster stays visible either way — log it rather than hide it.
      video.play?.().then(undefined, (err) => {
        console.debug('[BlockMedia] bg-video play() rejected:', err);
      });
    }
  }, [reduced, isBgVideo, src]);

  if (media === 'none' || !src) return null;

  if (media === 'image') {
    return (
      <Frame ratio={ratio} fit={fit} className={bdsClass('bds-block-media', className)} {...rest}>
        <img
          className="bds-block-media__img"
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
        />
      </Frame>
    );
  }

  // Only `bg-video` carries a distinct modifier class (it needs its own CSS —
  // pointer-events); `image` / `video` differ by element, not by styling, so a
  // `--image` / `--video` modifier with no rule would be an invented class
  // (`canonical-class-check`).
  return (
    <Frame
      ratio={ratio}
      fit={fit}
      className={bdsClass('bds-block-media', isBgVideo && 'bds-block-media--bg-video', className)}
      {...rest}
    >
      <video
        ref={videoRef}
        className="bds-block-media__video"
        src={src}
        poster={poster ?? undefined}
        playsInline
        {...(isBgVideo
          ? {
              // Ambient → muted/loop, no controls, decorative to AT. NO `autoPlay`:
              // the effect above starts it only when motion is allowed, so the
              // poster shows in SSR / JS-off / reduced-motion. Lazy via `preload`.
              muted: true,
              loop: true,
              preload: 'none',
              'aria-hidden': true,
            }
          : {
              // Foreground player — user starts it, so no reduced-motion gate is
              // needed. Metadata-only until the user engages.
              controls: true,
              preload: 'metadata',
            })}
      />
    </Frame>
  );
}

export default BlockMedia;
