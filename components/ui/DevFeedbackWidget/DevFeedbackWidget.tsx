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
 * falling back to a standalone FAB otherwise.
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
}

// ── Component ───────────────────────────────────────────────────────────
export function DevFeedbackWidget({
  endpoint = '/api/feedback',
  contextLabel = 'Page',
  getContextValue,
  fabPosition = { bottom: '16px', left: '72px' },
  extraPayload,
}: DevFeedbackWidgetProps = {}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contextValue, setContextValue] = useState('');
  const [devBarPresent, setDevBarPresent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);

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
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Detect DevBar so we can hide the standalone FAB.
  useEffect(() => {
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
  }, []);

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
    const stop = setTimeout(() => clearInterval(iv), 2000);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
      window.BrikDevBar?.unregister(slotDef.id);
    };
  }, [slotDef]);

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

  const panelStyleBase: CSSProperties = {
    position: 'fixed',
    bottom: '64px',
    left: '16px',
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
    </>
  );
}
