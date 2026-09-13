import { useRef, useEffect } from 'react';
import { Lottie, type LottieHandle } from 'lottie-react';
import { bdsClass } from '../../utils';
import './AnimatedIcon.css';

export type AnimatedIconTrigger = 'loop' | 'hover' | 'click' | 'once';

export interface AnimatedIconProps {
  /**
   * The animation: parsed Lottie JSON, or a path/URL to fetch it from.
   * Import from your app's src/animations/.
   *
   * Named `src` to match `lottie-react` v3, which replaced `animationData`
   * (brik-llm — brik-bds#2028).
   */
  src: string | object;
  /** Pixel size (width = height) */
  size?: number;
  /** Playback control */
  trigger?: AnimatedIconTrigger;
  /** Loop the animation (overrides trigger loop logic) */
  loop?: boolean;
  /** aria-label for accessibility */
  label?: string;
  /** Optional CSS class names appended to the wrapping `<span>`. */
  className?: string;
}

/**
 * Reads `prefers-reduced-motion: reduce` synchronously. Deliberately NOT the
 * `usePrefersReducedMotion` hook: that starts `false` and corrects a commit
 * later, leaving an above-the-fold icon a stale window in which the loop has
 * already autoplayed before the gate engages (brik-bds#2533). A synchronous
 * read at render decides `autoplay` on the first paint, so the gate is
 * by-construction — a Lottie with `autoplay={false}` renders its first frame
 * static, which IS the reduced-motion state. SSR-safe: no `window` → `false`
 * (Lottie is client-only, so the browser read is the one that governs motion).
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * AnimatedIcon — Lottie wrapper for animated UI icon states.
 *
 * Source Lottie JSON from useanimations.com and store in your app's
 * `src/animations/` directory. Pass the imported JSON as `src`.
 *
 * **Reduced-motion-gated by construction**: under `prefers-reduced-motion:
 * reduce` the icon never autoplays, loops, or responds to hover/click — it
 * renders its first frame as a static icon. This is what makes it safe to
 * dispatch through the blueprint `contentMotion: animated-svg` axis (#2533).
 *
 * @example
 * ```tsx
 * import checkAnimation from '@/animations/checkbox.json';
 * <AnimatedIcon src={checkAnimation} trigger="once" size={32} label="Completed" />
 * ```
 *
 * @summary Lottie wrapper for animated icon states, reduced-motion-gated by construction
 */
export function AnimatedIcon({
  src,
  size = 32,
  trigger = 'loop',
  loop,
  label,
  className,
}: AnimatedIconProps) {
  // v3 narrowed the handle to commands only (no state/error/speed getters) and
  // renamed the type; `play`/`stop` are unchanged, so the calls below still hold.
  const lottieRef = useRef<LottieHandle>(null);

  const reduced = prefersReducedMotion();
  const shouldLoop = reduced ? false : loop !== undefined ? loop : trigger === 'loop';

  useEffect(() => {
    if (!reduced && trigger === 'once') {
      lottieRef.current?.play();
    }
  }, [trigger, reduced]);

  const handleMouseEnter = () => {
    if (!reduced && trigger === 'hover') lottieRef.current?.play();
  };

  const handleMouseLeave = () => {
    if (!reduced && trigger === 'hover') lottieRef.current?.stop();
  };

  const handleClick = () => {
    if (!reduced && trigger === 'click') {
      lottieRef.current?.stop();
      lottieRef.current?.play();
    }
  };

  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      className={bdsClass('bds-animated-icon', className)}
      style={{ width: size, height: size, display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Lottie
        lottieRef={lottieRef}
        src={src}
        loop={shouldLoop}
        autoplay={!reduced && (trigger === 'loop' || trigger === 'once')}
        style={{ width: size, height: size }}
        aria-hidden
      />
    </span>
  );
}

export default AnimatedIcon;
