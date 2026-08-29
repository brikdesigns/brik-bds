import {
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  type FocusEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { bdsClass } from '../../utils';
import { TabBar, type TabBarVariant } from '../TabBar';
import './MediaTabs.css';

/** A single tab: its label, the copy it reveals, and the media it drives. */
export interface MediaTabData {
  /** Stable identity — used for the controlled `activeTab` value and the ARIA wiring ids. */
  id: string;
  /** Tab label, shown in the rail. */
  label: string;
  /** Body copy revealed in the tab's panel while it is active. */
  description?: ReactNode;
  /** Media rendered in the synced panel while the tab is active — image, video, or Lottie. */
  media: ReactNode;
  /** Disable this tab. Skipped by auto-advance and keyboard navigation. */
  disabled?: boolean;
}

/** Rail axis. `'vertical'` matches the reference mechanism. */
export type MediaTabsOrientation = 'horizontal' | 'vertical';

/** Which side of the tab rail the media panel sits on. */
export type MediaTabsMediaPosition = 'start' | 'end';

/** MediaTabs component props */
export interface MediaTabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Ordered tabs — peer categories, each with its own media panel. */
  tabs: MediaTabData[];
  /** Controlled active tab id. When provided, internal state is ignored and `onActiveTabChange` is the only way state advances. */
  activeTab?: string;
  /** Called with the next tab id on click, keyboard, or auto-advance. Required for controlled use. */
  onActiveTabChange?: (id: string) => void;
  /** Initial active tab id when uncontrolled. Defaults to the first tab. */
  defaultActiveTab?: string;
  /** Auto-advance through the tabs while the component is in view. Default `true`. Always off under `prefers-reduced-motion: reduce`. */
  autoplay?: boolean;
  /** Dwell time per tab — any CSS duration (`number` is treated as ms). Overrides the `--bds-media-tabs-interval` default, which resolves to the `--duration-autoplay` token. Drives both the progress cue and the advance timer. */
  interval?: number | string;
  /** Pause the auto-advance while the pointer is over the component. Default `true`. Focus always pauses. */
  pauseOnHover?: boolean;
  /** Rail axis. Default `'vertical'`. */
  orientation?: MediaTabsOrientation;
  /** Which side the media panel sits on. Default `'end'`. */
  mediaPosition?: MediaTabsMediaPosition;
  /** Visual variant passed through to the underlying `TabBar` rail. Default `'tab'`. */
  variant?: TabBarVariant;
  /** Show the autoplay progress cue between the tab rail and the panels. Default `true`. The advance timer is unaffected — this hides only the visual dwell cue. */
  showProgress?: boolean;
}

/** Fraction of the component that must be visible before autoplay starts. */
const IN_VIEW_THRESHOLD = 0.4;

/**
 * Fallback dwell time, used only when the interval custom property cannot be
 * read (SSR, jsdom without layout). The real value comes from CSS so the
 * progress cue and the advance timer cannot drift apart.
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
 * CSS progress animation share one source of truth (the `interval` prop sets
 * that property; its default resolves to the `--duration-autoplay` token).
 */
function readIntervalMs(el: HTMLElement | null): number {
  if (!el || typeof window === 'undefined' || !window.getComputedStyle) {
    return FALLBACK_INTERVAL_MS;
  }
  const raw = window
    .getComputedStyle(el)
    .getPropertyValue('--bds-media-tabs-interval');
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
 * MediaTabs — peer tabs driving a synced media panel, with in-view auto-advance.
 *
 * The tab case of the switch-between-categories pattern (home "Services" /
 * "Industries"): a {@link TabBar} rail of peer labels, each revealing its
 * description and crossfading its media into a shared panel. Auto-advance is
 * gated to in-view via `IntersectionObserver`, pauses on hover and focus, and
 * yields to a click or keypress.
 *
 * **Keyboard contract is the WAI-ARIA tabs pattern**, delegated to `TabBar`:
 * the rail exposes one tab in the page Tab sequence (roving tabindex) and
 * Arrow / Home / End move focus and activate — the axis follows `orientation`.
 * This is the point of difference from `SyncedMediaSteps`, which is the
 * accordion pattern (every step in the Tab sequence, no arrow keys).
 *
 * Under `prefers-reduced-motion: reduce` autoplay is disabled, the progress cue
 * is hidden, and the media swap and description reveal are instant — the active
 * tab still reads correctly, statically.
 *
 * @example
 * ```tsx
 * <MediaTabs
 *   tabs={[
 *     { id: 'marketing', label: 'Marketing', description: 'Campaigns that ship.', media: <img src="/mk.png" alt="" /> },
 *     { id: 'back-office', label: 'Back office', description: 'Ops that scale.', media: <img src="/bo.png" alt="" /> },
 *   ]}
 * />
 * ```
 *
 * @summary Peer tabs driving a synced media panel
 */
export function MediaTabs({
  tabs,
  activeTab,
  onActiveTabChange,
  defaultActiveTab,
  autoplay = true,
  interval,
  pauseOnHover = true,
  orientation = 'vertical',
  mediaPosition = 'end',
  variant = 'tab',
  showProgress = true,
  className,
  style,
  ...props
}: MediaTabsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const reducedMotion = usePrefersReducedMotion();

  const isControlled = activeTab !== undefined;
  const [internalActive, setInternalActive] = useState<string | undefined>(
    defaultActiveTab ?? tabs[0]?.id,
  );
  const currentId = isControlled ? activeTab : internalActive;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);

  const paused = (pauseOnHover && hovered) || focused || !inView;
  const running = autoplay && !reducedMotion && !paused && tabs.length > 1;

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
     the active id — an inline `tabs` array would otherwise restart
     the countdown on every parent render. Auto-advance skips disabled
     tabs so it never dwells on a category with nothing behind it. */

  const advanceRef = useRef<() => void>(() => {});

  const selectTab = useCallback(
    (id: string) => {
      if (!isControlled) setInternalActive(id);
      onActiveTabChange?.(id);
    },
    [isControlled, onActiveTabChange],
  );

  useEffect(() => {
    advanceRef.current = () => {
      if (tabs.length === 0) return;
      const index = tabs.findIndex((tab) => tab.id === currentId);
      for (let step = 1; step <= tabs.length; step += 1) {
        const next = tabs[(index + step) % tabs.length];
        if (next && !next.disabled) {
          selectTab(next.id);
          return;
        }
      }
    };
  });

  /* ─── Advance timer ────────────────────────────────────────────
     A JS timer owns the advance; the CSS progress bar is a cue synced
     to it. Driving the advance off the bar's `animationend` instead
     would spin at frame rate wherever animations are forced to `0s`
     (the Storybook animations-off global does exactly that).

     `remainingRef` banks the unelapsed slice on pause so resuming
     finishes the current tab rather than restarting it. */

  const remainingRef = useRef<number | null>(null);

  // Runs before the timer effect below, so a tab change lands as a full
  // fresh dwell rather than inheriting the previous tab's banked remainder.
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
      '--bds-media-tabs-interval':
        typeof interval === 'number' ? `${interval}ms` : interval,
    }),
  } as CSSProperties;

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocused(false);
    }
  }, []);

  const triggerId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  const tabItems = tabs.map((tab) => ({
    label: tab.label,
    id: triggerId(tab.id),
    controls: panelId(tab.id),
    active: tab.id === currentId,
    disabled: tab.disabled,
    onClick: () => selectTab(tab.id),
  }));

  return (
    <div
      ref={rootRef}
      className={bdsClass('bds-media-tabs', className)}
      style={rootStyle}
      data-orientation={orientation}
      data-media-position={mediaPosition}
      data-paused={paused || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      <div className="bds-media-tabs__rail">
        <TabBar
          variant={variant}
          orientation={orientation}
          items={tabItems}
          className="bds-media-tabs__tabbar"
        />

        {/* Progress cue — the JS timer above is the real clock, so this carries
            aria-hidden and no progressbar role. Re-keyed on the active id so the
            CSS animation restarts cleanly on every advance. */}
        {showProgress && (
          <div className="bds-media-tabs__progress" aria-hidden="true">
            <span key={currentId} className="bds-media-tabs__progress-fill" />
          </div>
        )}

        {tabs.map((tab) => {
          const isActive = tab.id === currentId;
          return (
            <div
              key={tab.id}
              id={panelId(tab.id)}
              role="tabpanel"
              aria-labelledby={triggerId(tab.id)}
              tabIndex={isActive ? 0 : undefined}
              className="bds-media-tabs__panel"
              data-active={isActive || undefined}
            >
              {/* The inner wrapper carries `visibility` so collapsed copy leaves
                  both the accessibility tree and the tab order — the grid-rows
                  reveal on the panel cannot do that on its own, and a bare
                  `hidden` attribute would kill the reveal (display:none can't
                  animate). Same technique as SyncedMediaSteps. */}
              <div className="bds-media-tabs__panel-inner">
                {tab.description && (
                  <p className="bds-media-tabs__description">{tab.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bds-media-tabs__media">
        {tabs.map((tab) => {
          const isActive = tab.id === currentId;
          return (
            <div
              key={tab.id}
              className="bds-media-tabs__media-item"
              data-active={isActive || undefined}
              aria-hidden={!isActive || undefined}
            >
              {tab.media}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MediaTabs;
