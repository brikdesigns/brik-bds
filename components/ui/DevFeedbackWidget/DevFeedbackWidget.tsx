'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Brik Dev Feedback Widget
 *
 * Consolidated React feedback widget used by brik-client-portal (/api/feedback)
 * and the BDS Storybook preview. Replaces the previously drifting copies in:
 *   - brik-client-portal/src/components/DevFeedbackWidget.tsx
 *   - brik-bds/.storybook/FeedbackWidget.tsx
 *
 * Visual brand (Poppy / Poppins / BDS spacing) is inlined so the widget
 * renders identically regardless of the host's light/dark theme.
 *
 * Integrates with the Brik DevBar (`window.BrikDevBar`) when present,
 * falling back to a standalone FAB otherwise. Set the `variant` prop to
 * `'slot'` or `'fab'` to assert the mode explicitly and skip the runtime
 * detect — useful for product apps that want to swap modes via env gate
 * without the FAB-flicker that 'auto' mode permits during DevBar load.
 *
 * @token-exempt — the inlined BDS object below holds raw hex values on
 * purpose: this widget is a dev overlay that must render consistently even
 * when the host's stylesheet has failed to load or is mid-swap. Referencing
 * BDS tokens here would defeat the stability guarantee. If you're adding a
 * new host-surface component, use tokens instead.
 */

// ── Brand tokens (inlined — widget is a dev overlay, not consumer surface) ──
const BDS = {
  poppy: '#e35335',
  poppyDark: '#b0351b',
  white: '#ffffff',
  tanLightest: '#f1f0ec',
  grayLighter: '#e0e0e0',
  grayLight: '#bdbdbd',
  grayDark: '#828282',
  grayDarker: '#4f4f4f',
  grayDarkest: '#333333',
  fontFamily: "'Poppins', system-ui, sans-serif",
} as const;

const FEEDBACK_TYPES = [
  { label: 'Bug', value: 'bug' },
  { label: 'UI', value: 'ui' },
  { label: 'Suggestion', value: 'suggestion' },
  { label: 'Question', value: 'question' },
] as const;

// ── DevBar integration types ────────────────────────────────────────────
// Types live in BrikDevBar — imported here to avoid duplicate declarations.
import type { DevBarSlotDef } from '../BrikDevBar';
import { detectContext, type CapturedContext } from './detectContext';

/**
 * Rendering variant.
 * - `'auto'` (default) — runtime-detect `window.BrikDevBar`; render as a
 *   slot when present, fall back to a standalone FAB. Backwards-compatible.
 * - `'slot'` — assert slot mode. Register with BrikDevBar (queues if the
 *   bar hasn't loaded yet) and never render the FAB. Logs a warning if no
 *   DevBar appears within 2s.
 * - `'fab'` — assert FAB mode. Skip the DevBar lookup entirely; render the
 *   standalone floating button immediately.
 */
export type DevFeedbackVariant = 'auto' | 'slot' | 'fab';

// ── Public props ────────────────────────────────────────────────────────
export interface DevFeedbackWidgetProps {
  /** POST endpoint for feedback submissions. */
  endpoint?: string;
  /** Label shown before the context value (e.g. "Page", "Story"). */
  contextLabel?: string;
  /** Returns the current context string (e.g. pathname or story name). */
  getContextValue?: () => string;
  /** Standalone FAB position when DevBar is not present. */
  fabPosition?: { bottom?: string; left?: string; right?: string };
  /** Additional payload fields sent with every submission. */
  extraPayload?: Record<string, unknown>;
  /** Rendering variant — controls slot vs FAB explicitly. Defaults to `'auto'` (back-compat). */
  variant?: DevFeedbackVariant;
}

// ── Component ───────────────────────────────────────────────────────────
/**
 * @summary Floating dev-only feedback capture widget
 */
export function DevFeedbackWidget({
  endpoint = '/api/feedback',
  contextLabel = 'Page',
  getContextValue,
  fabPosition = { bottom: '16px', left: '72px' },
  extraPayload,
  variant = 'auto',
}: DevFeedbackWidgetProps = {}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contextValue, setContextValue] = useState('');
  // For variant='slot' we treat the DevBar as present from the start so
  // the FAB never flashes while the bar is registering. For variant='fab'
  // we keep it false (no DevBar lookup runs). Auto seeds false and lets
  // runtime detection update it.
  const [devBarPresent, setDevBarPresent] = useState(variant === 'slot');
  // Pick-element mode: when active, the next page click captures section/element
  // context for the submission (brik-llm#979).
  const [picking, setPicking] = useState(false);
  const [captured, setCaptured] = useState<CapturedContext | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Poppins (once per page; other Brik widgets inject it too but this is idempotent).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.querySelector('link[href*="Poppins"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  // Refresh context value whenever the panel opens.
  useEffect(() => {
    if (!open) return;
    const next = getContextValue
      ? getContextValue()
      : typeof window !== 'undefined'
      ? window.location.pathname
      : '';
    setContextValue(next);
  }, [open, getContextValue]);

  // Click-outside + Esc.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (picking) return; // pick-element mode owns page clicks
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (fabRef.current?.contains(target)) return;
      // Ignore clicks on the Brik DevBar so pressing its slot toggles this widget.
      if (
        target.nodeType === 1 &&
        (target as Element).closest?.('.bdb-bar')
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (picking) return; // Esc cancels picking, not the panel (handled below)
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, picking]);

  // Reset capture + picking whenever the panel closes so nothing carries over.
  useEffect(() => {
    if (!open) {
      setPicking(false);
      setCaptured(null);
    }
  }, [open]);

  // Pick-element mode: highlight the hovered element and capture context on
  // click. Page clicks are intercepted in the capture phase; widget chrome is
  // ignored so the user can still interact with the panel. Esc cancels.
  useEffect(() => {
    if (!picking || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = '.bfb-picking, .bfb-picking * { cursor: crosshair !important; }';
    document.head.appendChild(style);
    document.documentElement.classList.add('bfb-picking');

    const isWidgetChrome = (el: Element | null): boolean =>
      !el ||
      !!panelRef.current?.contains(el) ||
      !!fabRef.current?.contains(el) ||
      !!highlightRef.current?.contains(el) ||
      !!el.closest?.('.bdb-bar');

    const onMove = (e: MouseEvent) => {
      const box = highlightRef.current;
      if (!box) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (isWidgetChrome(el)) {
        box.style.display = 'none';
        return;
      }
      const r = (el as Element).getBoundingClientRect();
      box.style.display = 'block';
      box.style.top = `${r.top}px`;
      box.style.left = `${r.left}px`;
      box.style.width = `${r.width}px`;
      box.style.height = `${r.height}px`;
    };
    const onClick = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (isWidgetChrome(el)) return; // let widget interactions through
      e.preventDefault();
      e.stopPropagation();
      if (el) setCaptured(detectContext(el));
      setPicking(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setPicking(false);
      }
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.documentElement.classList.remove('bfb-picking');
      style.remove();
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [picking]);

  // Detect DevBar so we can hide the standalone FAB. Only runs in 'auto'
  // mode — explicit variants short-circuit the polling.
  useEffect(() => {
    if (variant !== 'auto') return;
    const check = () => {
      if (typeof window !== 'undefined' && window.BrikDevBar) {
        setDevBarPresent(true);
      }
    };
    check();
    const iv = setInterval(check, 100);
    const stop = setTimeout(() => clearInterval(iv), 2000);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
    };
  }, [variant]);

  // Register the DevBar slot (queues if DevBar hasn't loaded yet).
  const slotDef = useMemo<DevBarSlotDef>(
    () => ({
      id: 'feedback',
      label: 'Feedback',
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      order: 10,
      onActivate: () => setOpen(true),
      onDeactivate: () => setOpen(false),
    }),
    [],
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (variant === 'fab') return;
    const tryRegister = () => {
      if (window.BrikDevBar) {
        window.BrikDevBar.register(slotDef);
        return true;
      }
      return false;
    };
    if (tryRegister()) {
      return () => {
        window.BrikDevBar?.unregister(slotDef.id);
      };
    }
    window.BrikDevBarQueue = window.BrikDevBarQueue || [];
    window.BrikDevBarQueue.push(slotDef);
    const iv = setInterval(() => {
      if (tryRegister()) clearInterval(iv);
    }, 100);
    const stop = setTimeout(() => {
      clearInterval(iv);
      if (variant === 'slot' && !window.BrikDevBar) {
        // eslint-disable-next-line no-console
        console.warn(
          '[DevFeedbackWidget] variant="slot" but BrikDevBar did not appear within 2s — widget will not be reachable.',
        );
      }
    }, 2000);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
      window.BrikDevBar?.unregister(slotDef.id);
    };
  }, [slotDef, variant]);

  // Sync DevBar active state with our open state.
  useEffect(() => {
    window.BrikDevBar?.setActive('feedback', open);
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_url:
            typeof window !== 'undefined' ? window.location.pathname : '',
          feedback_type: type,
          description: description.trim(),
          context: contextValue,
          // Human page name is always known; section/component only when the
          // user picked a target element (brik-llm#979).
          page:
            captured?.page ??
            (typeof document !== 'undefined' ? document.title || undefined : undefined),
          section: captured?.section,
          component: captured?.component,
          ...extraPayload,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
          setDescription('');
          setType('bug');
          setCaptured(null);
        }, 1500);
        return;
      }
      const data = await res.json().catch(() => ({}));
      console.error('[DevFeedbackWidget] submission failed:', data);
      window.alert(
        `Feedback failed: ${JSON.stringify(
          (data as { details?: unknown; error?: unknown }).details ??
            (data as { error?: unknown }).error ??
            'unknown',
        )}`,
      );
    } catch (err) {
      console.error('[DevFeedbackWidget] submission error:', err);
      window.alert('Feedback failed — see console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────
  const fabStyle: CSSProperties = {
    position: 'fixed',
    bottom: fabPosition.bottom,
    left: fabPosition.left,
    right: fabPosition.right,
    zIndex: 9998,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: BDS.poppy,
    color: BDS.white,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px', // bds-lint-ignore — dev overlay renders fixed size
    fontFamily: BDS.fontFamily,
    boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
    transition: 'background-color 0.15s ease, transform 0.15s ease',
  };

  // Panel anchors to the same horizontal edge as the FAB so the open menu
  // visually "grows" out of the trigger. Earlier code hardcoded
  // `left: '16px'` and ignored `fabPosition`, which left the panel on the
  // opposite edge whenever the FAB was pinned to `right` (e.g. renew-pms).
  // Vertical offset = FAB bottom + FAB height (40px) + gap (8px) = 48px.
  // brik-bds#415.
  const panelStyleBase: CSSProperties = {
    position: 'fixed',
    bottom: `calc(${fabPosition.bottom ?? '16px'} + 48px)`,
    left: fabPosition.right === undefined ? (fabPosition.left ?? '16px') : undefined,
    right: fabPosition.right,
    zIndex: 9998,
    width: '320px',
    backgroundColor: BDS.white,
    borderRadius: '12px', // bds-lint-ignore — dev overlay renders fixed
    border: `1px solid ${BDS.grayLighter}`,
    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    padding: '16px', // bds-lint-ignore — dev overlay renders fixed
    display: 'flex',
    flexDirection: 'column',
    gap: '8px', // bds-lint-ignore — dev overlay renders fixed
    fontFamily: BDS.fontFamily,
    color: BDS.grayDarkest,
  };
  const panelStyleAnchored: CSSProperties = {
    ...panelStyleBase,
    bottom: '72px',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  const headerStyle: CSSProperties = {
    fontSize: '11px', // bds-lint-ignore — dev overlay renders fixed
    fontWeight: 700, // bds-lint-ignore — dev overlay renders fixed
    color: BDS.grayDark,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  };

  const typeGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px', // bds-lint-ignore — dev overlay renders fixed
  };

  const typeBtnStyle = (active: boolean): CSSProperties => ({
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${active ? BDS.poppy : BDS.grayLighter}`,
    backgroundColor: active ? BDS.poppy : 'transparent',
    color: active ? BDS.white : BDS.grayDarkest,
    fontFamily: BDS.fontFamily,
    fontSize: '13px', // bds-lint-ignore — dev overlay renders fixed
    fontWeight: 600, // bds-lint-ignore — dev overlay renders fixed
    letterSpacing: '0.02em',
    cursor: 'pointer',
    lineHeight: 1, // bds-lint-ignore — dev overlay renders fixed
    transition:
      'background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease',
  });

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: '80px',
    padding: '10px 12px',
    borderRadius: '8px', // bds-lint-ignore — dev overlay renders fixed
    border: `1px solid ${BDS.grayLighter}`,
    backgroundColor: BDS.white,
    color: BDS.grayDarkest,
    fontSize: '13px', // bds-lint-ignore — dev overlay renders fixed
    fontFamily: BDS.fontFamily,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const contextStyle: CSSProperties = {
    fontSize: '10px', // bds-lint-ignore — dev overlay renders fixed
    color: BDS.grayDark,
    fontFamily: BDS.fontFamily,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const submitBtnStyle = (disabled: boolean): CSSProperties => ({
    padding: '10px 16px',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: disabled ? BDS.grayLighter : BDS.poppy,
    color: disabled ? BDS.grayDark : BDS.white,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px', // bds-lint-ignore — dev overlay renders fixed
    fontFamily: BDS.fontFamily,
    fontWeight: 600, // bds-lint-ignore — dev overlay renders fixed
    letterSpacing: '0.02em',
    transition: 'background-color 0.12s ease',
  });

  const successStyle: CSSProperties = {
    textAlign: 'center',
    color: BDS.poppy,
    fontSize: '13px', // bds-lint-ignore — dev overlay renders fixed
    fontFamily: BDS.fontFamily,
    fontWeight: 600, // bds-lint-ignore — dev overlay renders fixed
    padding: '20px 0',
  };

  const pickBtnStyle: CSSProperties = {
    padding: '7px 12px',
    borderRadius: '999px',
    border: `1px dashed ${picking ? BDS.poppy : BDS.grayLight}`,
    backgroundColor: picking ? BDS.tanLightest : 'transparent',
    color: picking ? BDS.poppy : BDS.grayDarker,
    cursor: 'pointer',
    fontFamily: BDS.fontFamily,
    fontSize: '12px', // bds-lint-ignore — dev overlay renders fixed
    fontWeight: 600, // bds-lint-ignore — dev overlay renders fixed
    letterSpacing: '0.02em',
    textAlign: 'center',
  };

  const capturedStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px', // bds-lint-ignore — dev overlay renders fixed
    fontSize: '11px', // bds-lint-ignore — dev overlay renders fixed
    color: BDS.grayDarker,
    fontFamily: BDS.fontFamily,
    backgroundColor: BDS.tanLightest,
    borderRadius: '8px', // bds-lint-ignore — dev overlay renders fixed
    padding: '8px 10px',
  };

  // Hover outline drawn over the page while picking. Direct-positioned via ref.
  const highlightStyle: CSSProperties = {
    position: 'fixed',
    zIndex: 9997,
    display: 'none',
    pointerEvents: 'none',
    border: `2px solid ${BDS.poppy}`,
    backgroundColor: 'rgba(227,83,53,0.08)',
    borderRadius: '2px', // bds-lint-ignore — dev overlay renders fixed
    transition: 'all 0.04s linear',
  };

  return (
    <>
      {!devBarPresent && (
        <div
          ref={fabRef}
          style={fabStyle}
          role="button"
          tabIndex={0}
          aria-label={open ? 'Close feedback' : 'Open feedback'}
          title={open ? 'Close feedback' : 'Open feedback'}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
          }}
        >
          {open ? '✕' : '💬'}
        </div>
      )}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            style={devBarPresent ? panelStyleAnchored : panelStyleBase}
            role="dialog"
            aria-label="Submit feedback"
          >
            <div style={headerStyle}>Submit Feedback</div>

            {submitted ? (
              <div style={successStyle}>Submitted — thank you!</div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px', // bds-lint-ignore — dev overlay renders fixed
                }}
              >
                <div style={typeGridStyle} role="radiogroup" aria-label="Feedback type">
                  {FEEDBACK_TYPES.map((ft) => (
                    <button
                      key={ft.value}
                      type="button"
                      role="radio"
                      aria-checked={type === ft.value}
                      style={typeBtnStyle(type === ft.value)}
                      onClick={() => setType(ft.value)}
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>

                <textarea
                  style={textareaStyle}
                  placeholder="Describe what you found..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  autoFocus
                />

                <button
                  type="button"
                  style={pickBtnStyle}
                  aria-pressed={picking}
                  onClick={() => setPicking((v) => !v)}
                >
                  {picking
                    ? 'Click an element… (Esc to cancel)'
                    : captured
                    ? '📍 Re-pick element'
                    : '📍 Pick element'}
                </button>

                {captured &&
                  (captured.section || captured.component || captured.element_tag) && (
                    <div style={capturedStyle}>
                      {captured.section && (
                        <div>
                          Section: <strong>{captured.section}</strong>
                        </div>
                      )}
                      {captured.component && (
                        <div>
                          Component: <strong>{captured.component}</strong>
                        </div>
                      )}
                      {!captured.component && captured.element_tag && (
                        <div>
                          Element: <strong>&lt;{captured.element_tag}&gt;</strong>
                        </div>
                      )}
                    </div>
                  )}

                <div style={contextStyle}>
                  {contextLabel}: {contextValue}
                </div>

                <button
                  type="submit"
                  style={submitBtnStyle(submitting || !description.trim())}
                  disabled={submitting || !description.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>,
          document.body,
        )}
      {picking &&
        typeof document !== 'undefined' &&
        createPortal(<div ref={highlightRef} style={highlightStyle} />, document.body)}
    </>
  );
}
