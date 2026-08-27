import {
  type HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Lottie, type LottieHandle } from 'lottie-react';
import { bdsClass } from '../../utils';
import { usePrefersReducedMotion } from '../shared/usePrefersReducedMotion';
import { paintParticleField } from './particleField';
import './AmbientField.css';

/**
 * How the field is drawn.
 * - `lottie` — a Lottie animation. The default: cheap, already in the toolkit,
 *   and art-directable by whoever made the file.
 * - `canvas` — a 2D-canvas particle field. Only worth its cost when the brief
 *   asks for a physical feel a designed loop cannot fake.
 *
 * Read as `[data-mode]`, not a BEM modifier: ADR-033 § 2's closed axis list is
 * tone · status · variant · emphasis · appearance · density · orientation, and
 * § 4 requires a modifier to carry one of those prefixes. `mode` is on none of
 * them, so a `--mode-*` modifier would need a § 6 amendment first. Same call as
 * Marquee's `[data-direction]` and ZIndexMediaBand's `[data-seam]`.
 */
export type AmbientFieldMode = 'lottie' | 'canvas';

export interface AmbientFieldProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Lottie source — parsed animation JSON, or a path/URL to fetch it from.
   * `mode="lottie"` only.
   *
   * Omit it to fall back to `--bds-bg-field-src`, which is the per-client swap
   * path: a theme sets the custom property and every AmbientField on the page
   * picks up that client's loop with no prop change. The token is read once on
   * mount via `getComputedStyle` — a CSS custom property is not available to
   * the server, so a token-sourced field paints from the first client render,
   * not from SSR output. Pass `src` when that matters.
   */
  src?: string | object;
  /** How the field is drawn. Default `lottie`. */
  mode?: AmbientFieldMode;
  /**
   * Particle count for `mode="canvas"`. Default `48`. Cost is linear — the
   * field is decorative, so prefer fewer.
   */
  particleCount?: number;
}

/** Strips the `url("…")` wrapper off a CSS custom property value. */
function unwrapCssUrl(raw: string): string | undefined {
  const value = raw.trim();
  if (!value || value === 'none') return undefined;
  const match = /^url\((['"]?)(.*)\1\)$/.exec(value);
  return match ? match[2] : value;
}

/**
 * AmbientField — living motion field behind content. **Premium tier.**
 *
 * The decorative layer only: absolutely positioned (`inset: 0; z-index: 1`),
 * `aria-hidden`, and non-interactive. It does not own a stacking context or a
 * content slot, because `ZIndexMediaBand` already owns that recipe — slot an
 * AmbientField into its `graphic` and the band handles the rest.
 *
 * **Reduced motion is the ship gate, not a nicety.** Under
 * `prefers-reduced-motion: reduce` the field freezes to a static poster frame
 * rather than disappearing: Lottie loads and holds frame 0 (`stop()`), and the
 * canvas paints exactly one frame and never schedules `requestAnimationFrame`.
 * A reader who asked for less motion still gets the composition the designer
 * intended, minus the movement. The CSS carries the same rule for anything
 * animation-driven, so the still state applies before any JS runs.
 *
 * @example
 * ```tsx
 * // Inside the primitive that owns the stacking context:
 * <ZIndexMediaBand as="section" graphic={<AmbientField src={fieldLoop} />}>
 *   <SectionHeader title="How we work" />
 * </ZIndexMediaBand>
 *
 * // Per-client loop, no prop:
 * // .theme-acme { --bds-bg-field-src: url('/acme/field.json'); }
 * <ZIndexMediaBand as="section" graphic={<AmbientField />}>…</ZIndexMediaBand>
 *
 * // Physics feel instead of a designed loop:
 * <AmbientField mode="canvas" particleCount={64} />
 * ```
 *
 * @summary Ambient motion field behind content (Premium)
 */
export function AmbientField({
  src,
  mode = 'lottie',
  particleCount = 48,
  className,
  style,
  ...props
}: AmbientFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lottieRef = useRef<LottieHandle>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Token-sourced Lottie fallback. Layout effect so the read happens before
  // paint once the element exists; `src` always wins when supplied.
  const [tokenSrc, setTokenSrc] = useState<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (src !== undefined || mode !== 'lottie') return;
    const node = rootRef.current;
    if (!node || typeof window === 'undefined') return;
    const raw = window
      .getComputedStyle(node)
      .getPropertyValue('--bds-bg-field-src');
    setTokenSrc(unwrapCssUrl(raw));
  }, [src, mode]);

  const resolvedSrc = src ?? tokenSrc;

  // Poster frame. lottie-react v3 already declines to autoplay under reduced
  // motion, but relying on that would make the ship gate a vendor behaviour
  // that a future bump could change silently. Hold frame 0 explicitly —
  // `stop()` is documented as "stops and returns to the first frame".
  useEffect(() => {
    if (mode !== 'lottie' || !resolvedSrc) return;
    if (reducedMotion) lottieRef.current?.stop();
    else lottieRef.current?.play();
  }, [mode, reducedMotion, resolvedSrc]);

  useEffect(() => {
    if (mode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    return paintParticleField(canvas, { particleCount, animate: !reducedMotion });
  }, [mode, particleCount, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={bdsClass('bds-ambient-field', className)}
      data-mode={mode}
      aria-hidden="true"
      style={style}
      {...props}
    >
      {mode === 'canvas' ? (
        <canvas ref={canvasRef} className="bds-ambient-field__canvas" />
      ) : (
        resolvedSrc !== undefined && (
          <Lottie
            lottieRef={lottieRef}
            className="bds-ambient-field__media"
            src={resolvedSrc}
            loop={!reducedMotion}
            autoplay={!reducedMotion}
          />
        )
      )}
      <div className="bds-ambient-field__tint" />
    </div>
  );
}

export default AmbientField;
