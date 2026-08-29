import {
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { bdsClass } from '../../utils';
import './SyncedMediaSteps.css';

/** A single step: its accordion row content plus the media it drives. */
export interface SyncedMediaStepData {
  /** Stable identity — used for the controlled `activeStep` value and the ARIA wiring ids. */
  id: string;
  /** Row label, always visible. */
  title: ReactNode;
  /** Body copy revealed while the step is active. */
  description?: ReactNode;
  /** Media rendered in the synced panel while the step is active — image, video, or Lottie. */
  media: ReactNode;
}

/** Which side of the step list the media panel sits on. */
export type SyncedMediaStepsMediaPosition = 'start' | 'end';

/** SyncedMediaSteps component props */
export interface SyncedMediaStepsProps extends HTMLAttributes<HTMLDivElement> {
  /** Ordered steps. Rendered as an `<ol>` — the sequence is the point. */
  steps: SyncedMediaStepData[];
  /** Controlled active step id. When provided, internal state is ignored and `onActiveStepChange` is the only way state advances. */
  activeStep?: string;
  /** Called with the next step id on click or auto-advance. Required for controlled use. */
  onActiveStepChange?: (id: string) => void;
  /** Initial active step id when uncontrolled. Defaults to the first step. */
  defaultActiveStep?: string;
  /** Auto-advance through the steps while the component is in view. Default `true`. Always off under `prefers-reduced-motion: reduce`. */
  autoplay?: boolean;
  /** Dwell time per step — any CSS duration (`number` is treated as ms). Overrides the `--bds-synced-media-steps-interval` default, which resolves to the `--duration-autoplay` token. Drives both the countdown bar and the advance timer. */
  interval?: number | string;
  /** Pause the auto-advance while the pointer is over the component. Default `true`. Focus always pauses. */
  pauseOnHover?: boolean;
  /** Which side the media panel sits on. Default `'end'`. */
  mediaPosition?: SyncedMediaStepsMediaPosition;
  /** Render the 1-based step number ahead of each title. Default `true`. */
  showStepNumbers?: boolean;
  /** Show the per-step countdown dwell cue on the active step. Default `true`. The advance timer is unaffected — this hides only the visual cue. */
  showCountdown?: boolean;
}

/** Fraction of the component that must be visible before autoplay starts. */
const IN_VIEW_THRESHOLD = 0.4;

/**
 * Fallback dwell time, used only when the interval custom property cannot be
 * read (SSR, jsdom without layout). The real value comes from CSS so the
 * countdown bar and the advance timer cannot drift apart.
 */
const FALLBACK_INTERVAL_MS = 10_000;

/** Parse a CSS `<time>` (`10s`, `500ms`) into milliseconds. */
function parseCssDuration(raw: string): number | null {
  const value = raw.trim();
  if (!value) return null;
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return null;
  if (value.endsWith('ms')) return numeric;
  if (value.endsWith('s')) return numeric * 1000;
  return null;
}

/**
 * Read the dwell time off the resolved custom property, so the JS timer and the
 * CSS countdown animation share one source of truth (the `interval` prop sets
 * that property; its default resolves to the `--duration-autoplay` token).
 */
function readIntervalMs(el: HTMLElement | null): number {
  if (!el || typeof window === 'undefined' || !window.getComputedStyle) {
    return FALLBACK_INTERVAL_MS;
  }
  const raw = window
    .getComputedStyle(el)
    .getPropertyValue('--bds-synced-media-steps-interval');
  return parseCssDuration(raw) ?? FALLBACK_INTERVAL_MS;
}

/** Track `prefers-reduced-motion: reduce`, reacting to live changes. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * SyncedMediaSteps — accordion-style step sequence driving a synced media panel.
 *
 * Each step is a real `<button>` inside an `<ol>`; the active step reveals its
 * description and crossfades its media into the panel. Auto-advance is gated to
 * in-view via `IntersectionObserver`, pauses on hover and focus, and yields to a
 * click.
 *
 * **Keyboard contract is the accordion pattern, not tabs.** Every step button
 * sits in the page Tab sequence, per the WAI-ARIA APG accordion pattern
 * ("all focusable elements in the accordion are included in the page Tab
 * sequence"). A roving tabindex belongs to the tabs pattern — `MediaTabs`
 * (#2047) is where that contract lives.
 *
 * Under `prefers-reduced-motion: reduce` autoplay is disabled, the countdown is
 * hidden, and the media swap and description reveal are instant — the active
 * step still reads correctly, statically.
 *
 * @example
 * ```tsx
 * <SyncedMediaSteps
 *   steps={[
 *     { id: 'plan', title: 'Plan', description: 'Scope the work.', media: <img src="/plan.png" alt="" /> },
 *     { id: 'build', title: 'Build', description: 'Ship it.', media: <img src="/build.png" alt="" /> },
 *   ]}
 * />
 * ```
 *
 * @summary Step sequence driving a synced media panel
 */
export function SyncedMediaSteps({
  steps,
  activeStep,
  onActiveStepChange,
  defaultActiveStep,
  autoplay = true,
  interval,
  pauseOnHover = true,
  mediaPosition = 'end',
  showStepNumbers = true,
  showCountdown = true,
  className,
  style,
  ...props
}: SyncedMediaStepsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const reducedMotion = usePrefersReducedMotion();

  const isControlled = activeStep !== undefined;
  const [internalActive, setInternalActive] = useState<string | undefined>(
    defaultActiveStep ?? steps[0]?.id,
  );
  const currentId = isControlled ? activeStep : internalActive;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);

  const paused = (pauseOnHover && hovered) || focused || !inView;
  const running = autoplay && !reducedMotion && !paused && steps.length > 1;

  /* ─── In-view gate ─────────────────────────────────────────────
     Autoplay that runs off-screen burns the sequence before anyone
     sees it, so the observer — not mount — is what starts the timer. */

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { threshold: IN_VIEW_THRESHOLD },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ─── Advance ──────────────────────────────────────────────────
     Held in a ref so the timer effect depends only on `running` and
     the active id — an inline `steps` array would otherwise restart
     the countdown on every parent render. */

  const advanceRef = useRef<() => void>(() => {});

  const selectStep = useCallback(
    (id: string) => {
      if (!isControlled) setInternalActive(id);
      onActiveStepChange?.(id);
    },
    [isControlled, onActiveStepChange],
  );

  useEffect(() => {
    advanceRef.current = () => {
      if (steps.length === 0) return;
      const index = steps.findIndex((step) => step.id === currentId);
      const next = steps[(index + 1) % steps.length];
      if (next) selectStep(next.id);
    };
  });

  /* ─── Advance timer ────────────────────────────────────────────
     A JS timer owns the advance; the CSS bar is a cue synced to it.
     Driving the advance off the bar's `animationend` instead would
     spin at frame rate wherever animations are forced to `0s` (the
     Storybook animations-off global does exactly that).

     `remainingRef` banks the unelapsed slice on pause so resuming
     finishes the current step rather than restarting it. */

  const remainingRef = useRef<number | null>(null);

  // Runs before the timer effect below, so a step change lands as a full
  // fresh dwell rather than inheriting the previous step's banked remainder.
  useEffect(() => {
    remainingRef.current = null;
  }, [currentId]);

  useEffect(() => {
    if (!running) return;
    if (remainingRef.current === null) {
      remainingRef.current = readIntervalMs(rootRef.current);
    }
    const wait = remainingRef.current;
    const startedAt = Date.now();
    const timer = setTimeout(() => {
      remainingRef.current = null;
      advanceRef.current();
    }, wait);

    return () => {
      clearTimeout(timer);
      // Non-null means the timer was cleared before firing — bank the rest.
      if (remainingRef.current !== null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAt));
      }
    };
  }, [running, currentId]);

  /* ─── Render ───────────────────────────────────────────────────
     Defining --bds-* custom properties inline is the sanctioned
     runtime binding; all token consumption lives in the CSS file. */

  const rootStyle: CSSProperties = {
    ...style,
    ...(interval !== undefined && {
      '--bds-synced-media-steps-interval':
        typeof interval === 'number' ? `${interval}ms` : interval,
    }),
  } as CSSProperties;

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setFocused(false);
      }
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      className={bdsClass('bds-synced-media-steps', className)}
      style={rootStyle}
      data-media-position={mediaPosition}
      data-paused={paused || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      <ol className="bds-synced-media-steps__steps">
        {steps.map((step, index) => {
          const isActive = step.id === currentId;
          const triggerId = `${baseId}-trigger-${step.id}`;
          const panelId = `${baseId}-panel-${step.id}`;

          return (
            <li
              key={step.id}
              className="bds-synced-media-steps__step"
              data-active={isActive || undefined}
            >
              <button
                type="button"
                id={triggerId}
                className="bds-synced-media-steps__trigger"
                aria-expanded={isActive}
                aria-controls={panelId}
                onClick={() => selectStep(step.id)}
              >
                {showStepNumbers && (
                  <span className="bds-synced-media-steps__index" aria-hidden="true">
                    {index + 1}
                  </span>
                )}
                <span className="bds-synced-media-steps__title">{step.title}</span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="bds-synced-media-steps__panel"
              >
                {/* The inner wrapper carries `visibility` so collapsed copy
                    leaves both the accessibility tree and the tab order — the
                    grid-rows reveal on the panel cannot do that on its own. */}
                <div className="bds-synced-media-steps__panel-inner">
                  {step.description && (
                    <p className="bds-synced-media-steps__description">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Decorative dwell cue — the timer above is the real clock. */}
              {showCountdown && (
                <div className="bds-synced-media-steps__countdown" aria-hidden="true">
                  <span className="bds-synced-media-steps__countdown-fill" />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="bds-synced-media-steps__media">
        {steps.map((step) => {
          const isActive = step.id === currentId;
          return (
            <div
              key={step.id}
              className="bds-synced-media-steps__media-item"
              data-active={isActive || undefined}
              aria-hidden={!isActive || undefined}
            >
              {step.media}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SyncedMediaSteps;
