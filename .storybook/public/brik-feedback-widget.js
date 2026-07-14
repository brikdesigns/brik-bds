/**
 * Brik Design Review — Feedback Widget (pin mode)
 *
 * Click-anywhere pin-drop overlay for external clients reviewing pre-launch
 * mockups. Anonymous via review-token. Pins POST to portal.brikdesigns.com.
 * Served from Supabase Storage and injected at serve time
 * (src/lib/design/feedback-widget-inject.ts); also used by static
 * vale-partners-mockups via inject-widgets.sh.
 *
 * The structured-tag vocabulary (change_type / disposition) is single-sourced
 * from @brikdesigns/feedback-contract via the `widget-constants.global.js`
 * asset the inject path serves alongside this script (#1385).
 *
 * A dev-feedback FORM mode (brik-bds#467) once lived here too; it was removed in
 * #1385 once brikdesigns DevTools migrated to the React DevFeedbackWidget
 * (brikdesigns#479) — no live consumer remained.
 *
 * Configuration via data attributes on the script tag:
 *
 *   <script src="feedback-widget.js"
 *     data-review-token="abc123"
 *     data-api-url="https://portal.brikdesigns.com"
 *     data-variant-key="a"
 *     data-directory-url="https://portal.brikdesigns.com/review/abc123">
 *   </script>
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────
  const script = document.currentScript;
  const REVIEW_TOKEN = script?.getAttribute('data-review-token') || '';
  const API_URL = script?.getAttribute('data-api-url') || 'https://portal.brikdesigns.com';
  const VARIANT_KEY = script?.getAttribute('data-variant-key') || '';
  // Where the "All styles" button returns to. The portal serve-time inject
  // (feedback-widget-inject.ts) passes the absolute review-directory URL; legacy
  // static Netlify deploys omit it and fall back to the sibling index.html page.
  const DIRECTORY_URL = script?.getAttribute('data-directory-url') || 'index.html';

  // ── Chrome palette (#1305) ────────────────────────────────────────────────
  // The feedback widget is a Brik tool overlaid on client work, so its chrome
  // wears Brik's own brand (poppy) — NOT the client's brand token. Pin mode
  // previously pulled `var(--background-brand-primary, …)` (the client's colour)
  // and fell back to a stray blue (#4665f5) on any mockup that didn't define it.
  // Values are canonical BDS poppy/neutral hexes (inlined because the widget
  // ships raw to Storage and runs inside self-contained mockups where the BDS
  // token sheet isn't present).
  const C = {
    brand: '#e35335', // poppy-light — primary actions, pins, focus
    brandDark: '#b0351b', // poppy-dark — hover
    brandTintBg: '#ffefeb', // poppy-lightest — context / dropzone tint
    brandTintBorder: '#ffa693', // poppy-lighter — tint border
    danger: '#ef4444', // destructive — cancel-active, remove
    dangerDark: '#dc2626',
    pending: '#f59e0b', // amber — pending pin
    ink: '#1b1b1b', // toasts, tooltips, headings
    white: '#ffffff',
    border: '#dddddd', // neutral field borders
    fontLabel: "'Poppins', system-ui, sans-serif",
  };

  // ── Pin mode (existing path — review-token required) ────────────────────
  if (!REVIEW_TOKEN) {
    console.warn('[Brik Feedback] No review token configured. Widget disabled.');
    return;
  }

  // ── State ───────────────────────────────────────────────────────────────
  let feedbackMode = false;
  let pins = [];
  let pendingPin = null;
  let authorName = localStorage.getItem('brik-feedback-name') || '';
  let authorEmail = localStorage.getItem('brik-feedback-email') || '';
  let screenshotBase64 = null;

  // Structured revision tags (#1381) — set per pin, required before submit.
  // change_type drives the targeted-revision task; disposition says keep vs change.
  // Single-sourced from @brikdesigns/feedback-contract via the widget-constants
  // global the portal inject path serves alongside this script (#1385). The
  // inline arrays are the fallback for static Netlify mockups that don't load
  // the constants asset — they MUST match the contract (gated by the portal
  // feedback-widget-constants test).
  const FBC = (typeof window !== 'undefined' && window.BRIK_FEEDBACK_CONSTANTS) || {};
  const CHANGE_TYPES = FBC.REVIEW_CHANGE_TYPES || ['layout', 'color', 'copy', 'spacing', 'imagery', 'other'];
  const DISPOSITIONS = FBC.REVIEW_DISPOSITIONS || ['keep', 'change'];
  let pendingChangeType = null;
  let pendingDisposition = null;

  // ── Styles ──────────────────────────────────────────────────────────────
  const css = `
    .bfb-toolbar {
      position: fixed;
      bottom: var(--space-lg, 24px);
      right: var(--space-lg, 24px);
      z-index: 99999;
      display: flex;
      gap: var(--space-sm, 8px);
      align-items: center;
    }
    .bfb-btn {
      background: ${C.brand};
      color: #fff;
      border: none;
      border-radius: var(--radius-button, 100px);
      padding: var(--space-sm, 12px) var(--space-md, 20px);
      font-family: var(--typography-font-family-label, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);
      font-size: var(--label-sm, 14px);
      font-weight: var(--font-weight-bold, 600);
      letter-spacing: var(--letter-spacing-wide, 0);
      line-height: 1;
      text-decoration: none;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: var(--elevation-md, 0 4px 24px rgba(0,0,0,0.3));
      transition: background var(--duration-fast, 0.15s) var(--ease-default, ease),
                  transform var(--duration-fast, 0.15s) var(--ease-default, ease);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs, 6px);
      box-sizing: border-box;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
    .bfb-btn svg {
      width: var(--icon-md, 16px);
      height: var(--icon-md, 16px);
      flex-shrink: 0;
    }
    .bfb-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .bfb-btn--active { background: ${C.danger}; }
    .bfb-btn--active:hover { background: ${C.dangerDark}; }

    .bfb-pin {
      position: absolute;
      width: 28px;
      height: 28px;
      background: ${C.brand};
      border: 2px solid #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 99998;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      transition: transform 0.15s;
    }
    .bfb-pin:hover { transform: translate(-50%, -50%) scale(1.15); }
    .bfb-pin--pending { background: ${C.pending}; animation: bfb-pulse 1.5s infinite; }

    @keyframes bfb-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
      50% { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
    }

    /* Client-completed pins fade back; the comment is "done" for the reviewer. */
    .bfb-pin--done { opacity: 0.4; }

    /* Per-pin completion control — a vanilla replica of the BDS CompletionToggle
       visual (circle; brand fill + white checkmark when checked). Anchored to
       the top-right of its pin. Can't import the React component into an
       injected widget, so the look is reproduced by hand. */
    .bfb-pin-done {
      position: absolute;
      width: 18px;
      height: 18px;
      box-sizing: border-box;
      border-radius: 50%;
      border: 2px solid ${C.border};
      background: ${C.white};
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      cursor: pointer;
      padding: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(calc(-50% + 14px), calc(-50% - 14px));
      transition: background 0.15s, border-color 0.15s;
    }
    .bfb-pin-done:hover { border-color: ${C.brand}; }
    .bfb-pin-done--checked { background: ${C.brand}; border-color: ${C.brand}; }
    .bfb-pin-done__icon {
      display: block;
      width: 8px;
      height: 5px;
      border-left: 2px solid #fff;
      border-bottom: 2px solid #fff;
      transform: rotate(-45deg) translate(1px, -1px);
    }

    .bfb-form {
      position: fixed;
      z-index: 100000;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
      padding: 20px;
      width: 320px;
      max-width: calc(100vw - 24px);
      max-height: calc(100vh - 24px);
      overflow-y: auto;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
    .bfb-form h3 {
      margin: 0 0 14px;
      font-size: 15px;
      font-weight: 600;
      color: ${C.ink};
    }
    .bfb-form input, .bfb-form textarea {
      width: 100%;
      border: 1px solid ${C.border};
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      margin-bottom: 10px;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .bfb-form input:focus, .bfb-form textarea:focus {
      outline: none;
      border-color: ${C.brand};
    }
    .bfb-form textarea { resize: vertical; min-height: 80px; }
    .bfb-tag-group { margin-bottom: 10px; }
    .bfb-tag-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #888;
      margin-bottom: 6px;
    }
    .bfb-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .bfb-tag {
      border: 1px solid #ddd;
      background: #fff;
      color: #444;
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      line-height: 1;
      transition: background 0.12s, border-color 0.12s, color 0.12s;
    }
    .bfb-tag:hover { border-color: var(--border-brand-primary, ${C.brand}); }
    .bfb-tag--active {
      background: var(--background-brand-primary, ${C.brand});
      border-color: var(--background-brand-primary, ${C.brand});
      color: #fff;
    }
    .bfb-form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .bfb-form-actions button {
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .bfb-submit { background: ${C.brand}; color: #fff; }
    .bfb-submit:hover { background: ${C.brandDark}; }
    .bfb-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .bfb-cancel { background: #f3f3f3; color: #666; }
    .bfb-cancel:hover { background: #e8e8e8; }

    .bfb-context {
      background: ${C.brandTintBg};
      border: 1px solid ${C.brandTintBorder};
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 10px;
      font-size: 12px;
      color: #444;
      line-height: 1.4;
    }
    .bfb-context strong {
      color: ${C.brand};
      font-weight: 600;
    }
    .bfb-context-row {
      display: flex;
      gap: 4px;
    }
    .bfb-context-label {
      color: #888;
      min-width: 50px;
    }

    .bfb-toast {
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 100001;
      background: ${C.ink};
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: bfb-fadein 0.2s;
    }
    @keyframes bfb-fadein {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .bfb-screenshot-zone {
      border: 2px dashed ${C.border};
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
      text-align: center;
      font-size: 12px;
      color: #888;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      position: relative;
    }
    .bfb-screenshot-zone:hover,
    .bfb-screenshot-zone--dragover {
      border-color: ${C.brand};
      background: ${C.brandTintBg};
    }
    .bfb-screenshot-zone input[type="file"] {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .bfb-screenshot-preview {
      position: relative;
      display: inline-block;
      margin-bottom: 10px;
    }
    .bfb-screenshot-preview img {
      max-width: 100%;
      max-height: 120px;
      border-radius: 6px;
      border: 1px solid ${C.border};
      display: block;
    }
    .bfb-screenshot-remove {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      background: ${C.danger};
      color: #fff;
      border: 2px solid #fff;
      border-radius: 50%;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .bfb-screenshot-remove:hover { background: ${C.dangerDark}; }

    .bfb-crosshair { cursor: crosshair !important; }
    .bfb-crosshair * { cursor: crosshair !important; }

    .bfb-pin-tooltip {
      position: absolute;
      background: ${C.ink};
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      max-width: 240px;
      z-index: 99999;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      white-space: pre-wrap;
    }
    .bfb-pin-tooltip::after {
      content: '';
      position: absolute;
      top: -6px;
      left: 14px;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid ${C.ink};
    }
  `;

  // ── Inject styles ───────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── Load existing feedback ──────────────────────────────────────────────
  async function loadExistingPins() {
    try {
      const res = await fetch(`${API_URL}/api/review/${REVIEW_TOKEN}`);
      if (!res.ok) return;
      const { review } = await res.json();
      if (!review?.design_feedback) return;

      const variantFeedback = review.design_feedback.filter(
        (f) => f.variant_key === VARIANT_KEY && f.pin_x != null
      );

      variantFeedback.forEach((f, i) => {
        pins.push({
          id: f.id,
          x: f.pin_x,
          y: f.pin_y,
          comment: f.comment,
          author: f.author_name,
          number: i + 1,
          clientCompleted: f.client_completed_at != null,
        });
      });

      renderPins();
    } catch (e) {
      console.warn('[Brik Feedback] Could not load existing feedback:', e);
    }
  }

  // ── Render pins on page ─────────────────────────────────────────────────
  function renderPins() {
    document.querySelectorAll('.bfb-pin:not(.bfb-pin--pending), .bfb-pin-done').forEach((el) => el.remove());

    pins.forEach((pin) => {
      const el = document.createElement('div');
      el.className = pin.clientCompleted ? 'bfb-pin bfb-pin--done' : 'bfb-pin';
      el.textContent = String(pin.number);
      el.style.left = pin.x + '%';
      el.style.top = pin.y + 'px';

      el.addEventListener('mouseenter', (e) => showTooltip(e, pin));
      el.addEventListener('mouseleave', hideTooltip);

      document.body.appendChild(el);

      // Completion toggle — only for persisted pins (need a feedback id to PATCH).
      if (pin.id) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = pin.clientCompleted ? 'bfb-pin-done bfb-pin-done--checked' : 'bfb-pin-done';
        toggle.style.left = pin.x + '%';
        toggle.style.top = pin.y + 'px';
        toggle.setAttribute('aria-pressed', String(!!pin.clientCompleted));
        toggle.setAttribute('aria-label', pin.clientCompleted ? 'Mark comment not done' : 'Mark comment done');
        if (pin.clientCompleted) {
          const icon = document.createElement('span');
          icon.className = 'bfb-pin-done__icon';
          icon.setAttribute('aria-hidden', 'true');
          toggle.appendChild(icon);
        }
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          markPinCompletion(pin, !pin.clientCompleted);
        });
        document.body.appendChild(toggle);
      }
    });
  }

  // ── Client-side completion ───────────────────────────────────────────────
  async function markPinCompletion(pin, completed) {
    try {
      const res = await fetch(`${API_URL}/api/review/${REVIEW_TOKEN}/feedback/${pin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_completed: completed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update');
      }
      pin.clientCompleted = completed;
      renderPins();
      toast(completed ? 'Marked as done' : 'Marked as not done');
    } catch (e) {
      console.warn('[Brik Feedback] Could not update completion:', e);
      toast('Could not update — please try again');
    }
  }

  // ── Tooltip ─────────────────────────────────────────────────────────────
  let tooltipEl = null;

  function showTooltip(e, pin) {
    hideTooltip();
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'bfb-pin-tooltip';
    tooltipEl.textContent = `${pin.author}: ${pin.comment}`;

    const rect = e.target.getBoundingClientRect();
    tooltipEl.style.left = (rect.left + window.scrollX) + 'px';
    tooltipEl.style.top = (rect.bottom + window.scrollY + 8) + 'px';

    document.body.appendChild(tooltipEl);
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  }

  // ── Controls (#1234) ──────────────────────────────────────────────────────
  // Register into the shared DevBar so the review controls render as one ordered
  // group: All styles (0) → Leave feedback (10) → Inspect (20, self-registered
  // by inspect-widget). Falls back to a standalone bottom-right toolbar when no
  // DevBar is present on the page (mirrors inspect-widget's fallback).
  const ICON_COMMENT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const ICON_CANCEL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  const ICON_BACK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>';

  let toolbar = null;      // standalone fallback container (only if no DevBar)
  let feedbackBtn = null;  // standalone fallback toggle button

  // Reflect feedback-mode state on whichever control surface is present.
  function syncFeedbackControls() {
    if (feedbackBtn) {
      feedbackBtn.className = feedbackMode ? 'bfb-btn bfb-btn--active' : 'bfb-btn';
      feedbackBtn.innerHTML = feedbackMode ? `${ICON_CANCEL} Cancel` : `${ICON_COMMENT} Leave feedback`;
    }
    if (window.BrikDevBar?.isRegistered?.('feedback')) {
      window.BrikDevBar.setActive('feedback', feedbackMode);
    }
  }

  function setFeedbackMode(on) {
    feedbackMode = on;
    if (on) {
      document.documentElement.classList.add('bfb-crosshair');
      toast('Click anywhere on the page to drop a pin');
    } else {
      document.documentElement.classList.remove('bfb-crosshair');
      removePendingPin();
      removeForm();
    }
    syncFeedbackControls();
  }

  // Kept for existing callers (e.g. after a successful submit).
  function deactivate() {
    setFeedbackMode(false);
  }

  function registerFeedbackSlots() {
    const slots = [
      { id: 'all-styles', label: 'All styles', icon: ICON_BACK, order: 0,
        onActivate: () => { window.location.href = DIRECTORY_URL; } },
      { id: 'feedback', label: 'Leave feedback', icon: ICON_COMMENT, order: 10,
        onActivate: () => setFeedbackMode(true),
        onDeactivate: () => setFeedbackMode(false) },
    ];
    if (window.BrikDevBar) {
      slots.forEach((s) => window.BrikDevBar.register(s));
      return true;
    }
    // Queue for devbar.js if it loads after us.
    window.BrikDevBarQueue = window.BrikDevBarQueue || [];
    slots.forEach((s) => window.BrikDevBarQueue.push(s));
    return false;
  }

  function buildStandaloneToolbar() {
    if (toolbar) return;
    toolbar = document.createElement('div');
    toolbar.className = 'bfb-toolbar';

    const backBtn = document.createElement('a');
    backBtn.className = 'bfb-btn';
    backBtn.href = DIRECTORY_URL;
    backBtn.innerHTML = `${ICON_BACK} All styles`;

    feedbackBtn = document.createElement('button');
    feedbackBtn.className = 'bfb-btn';
    feedbackBtn.innerHTML = `${ICON_COMMENT} Leave feedback`;
    feedbackBtn.addEventListener('click', () => setFeedbackMode(!feedbackMode));

    toolbar.appendChild(backBtn);      // All styles first
    toolbar.appendChild(feedbackBtn);  // then Leave feedback
    document.body.appendChild(toolbar);
  }

  registerFeedbackSlots();
  setTimeout(() => {
    if (!window.BrikDevBar) buildStandaloneToolbar();
  }, 80);

  // ── Section detection (delegates to the shared inspector detector) ────────
  // ADR-007 makes the inspector the single element-context detector. On mockup
  // deploys the inspect widget is injected alongside this one and exposes
  // window.BrikInspect.detectContext(el); we map its result to the
  // section_context shape stored in Supabase design_feedback.section_context.
  // No parallel detection here (brik-client-portal#1132). If the inspector is
  // somehow absent, degrade to empty context rather than throw.
  function sectionContextFromDetector(target) {
    const detect =
      (typeof window !== 'undefined' && window.BrikInspect && window.BrikInspect.detectContext) || null;
    if (!detect) return {};

    const c = detect(target) || {};
    const ctx = {};
    if (c.section_type) ctx.section_type = c.section_type;
    if (c.section_label) ctx.section_label = c.section_label;
    if (c.section_id) ctx.section_id = c.section_id;
    if (c.content_source) ctx.content_source = c.content_source;
    if (c.section_number) ctx.section_number = c.section_number;
    if (c.layout) ctx.layout = c.layout;
    if (c.element_tag) ctx.element_tag = c.element_tag;
    return ctx;
  }

  // ── Click to pin ────────────────────────────────────────────────────────
  let currentSectionContext = null;

  document.addEventListener('click', (e) => {
    if (!feedbackMode) return;
    if (e.target.closest('.bfb-toolbar, .bdb-bar, .bfb-form, .bfb-pin')) return;

    e.preventDefault();
    e.stopPropagation();

    removePendingPin();
    removeForm();

    const x = ((e.pageX) / document.documentElement.scrollWidth) * 100;
    const y = e.pageY;

    // Detect section context before creating the pin overlay
    currentSectionContext = sectionContextFromDetector(e.target);

    pendingPin = document.createElement('div');
    pendingPin.className = 'bfb-pin bfb-pin--pending';
    pendingPin.textContent = '?';
    pendingPin.style.left = x + '%';
    pendingPin.style.top = y + 'px';
    document.body.appendChild(pendingPin);

    showForm(x, y, e.clientX, e.clientY);
  }, true);

  // ── Comment form ────────────────────────────────────────────────────────
  let formEl = null;

  // Collision-aware placement. Anchors the popover to the pin (viewport coords),
  // preferring right-of / below the anchor, flipping to the left / above side
  // when it would overflow, and clamping within the viewport as a final guard so
  // the popover — and its Submit button — is never rendered off-screen.
  function positionForm(el, anchorX, anchorY) {
    const gap = 16;    // space between the pin and the popover
    const margin = 12; // min gap from the viewport edge
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { width: w, height: h } = el.getBoundingClientRect();

    let left = anchorX + gap;
    if (left + w > vw - margin) left = anchorX - gap - w; // flip to the left
    if (left < margin) left = Math.max(margin, vw - w - margin);

    let top = anchorY + gap;
    if (top + h > vh - margin) top = anchorY - gap - h;   // flip above
    if (top < margin) top = Math.max(margin, vh - h - margin);

    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
    el.style.visibility = '';
  }

  function showForm(pinX, pinY, screenX, screenY) {
    removeForm();

    // Reset structured tags for this pin (#1381).
    pendingChangeType = null;
    pendingDisposition = null;

    formEl = document.createElement('div');
    formEl.className = 'bfb-form';
    // Hidden until measured — positionForm() places it collision-aware after
    // the content is in the DOM (its height varies with context/tags).
    formEl.style.visibility = 'hidden';

    // Build context display
    const ctx = currentSectionContext || {};
    let contextHtml = '';
    if (ctx.section_type || ctx.section_label) {
      const parts = [];
      if (ctx.section_number) parts.push(`<span class="bfb-context-label">Section</span> <strong>${ctx.section_number}: ${(ctx.section_type || '').replace(/-/g, ' ')}</strong>`);
      else if (ctx.section_type) parts.push(`<span class="bfb-context-label">Section</span> <strong>${ctx.section_type.replace(/-/g, ' ')}</strong>`);
      if (ctx.section_label && ctx.section_label !== ctx.section_type) parts.push(`<span class="bfb-context-label">Label</span> ${esc(ctx.section_label)}`);
      if (ctx.element_tag) parts.push(`<span class="bfb-context-label">Element</span> &lt;${ctx.element_tag}&gt;`);
      if (ctx.layout) parts.push(`<span class="bfb-context-label">Layout</span> ${ctx.layout}`);
      contextHtml = `<div class="bfb-context">${parts.map(p => `<div class="bfb-context-row">${p}</div>`).join('')}</div>`;
    }

    formEl.innerHTML = `
      <h3>Leave a comment</h3>
      ${contextHtml}
      <input type="text" class="bfb-name" placeholder="Your name" value="${esc(authorName)}" autocomplete="off" data-1p-ignore />
      <input type="text" class="bfb-email" placeholder="Email (optional)" value="${esc(authorEmail)}" autocomplete="off" data-1p-ignore />
      <textarea class="bfb-comment" placeholder="What are your thoughts?" data-1p-ignore></textarea>
      <div class="bfb-tag-group">
        <span class="bfb-tag-label">What kind of change?</span>
        <div class="bfb-tags bfb-tags--change-type">
          ${CHANGE_TYPES.map((t) => `<button type="button" class="bfb-tag" data-change-type="${t}">${t}</button>`).join('')}
        </div>
      </div>
      <div class="bfb-tag-group">
        <span class="bfb-tag-label">Keep or change?</span>
        <div class="bfb-tags bfb-tags--disposition">
          ${DISPOSITIONS.map((d) => `<button type="button" class="bfb-tag" data-disposition="${d}">${d}</button>`).join('')}
        </div>
      </div>
      <div class="bfb-screenshot-zone">
        \uD83D\uDCCE Paste, drag, or <u>upload</u> a screenshot
        <input type="file" accept="image/*" />
      </div>
      <div class="bfb-form-actions">
        <button type="button" class="bfb-cancel">Cancel</button>
        <button type="button" class="bfb-submit">Submit</button>
      </div>
    `;

    // Wire screenshot zone events
    const ssZone = formEl.querySelector('.bfb-screenshot-zone');
    const ssInput = ssZone.querySelector('input[type="file"]');
    ssInput.addEventListener('change', (e) => {
      if (e.target.files[0]) processImageFile(e.target.files[0]);
    });
    ssZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      ssZone.classList.add('bfb-screenshot-zone--dragover');
    });
    ssZone.addEventListener('dragleave', () => {
      ssZone.classList.remove('bfb-screenshot-zone--dragover');
    });
    ssZone.addEventListener('drop', (e) => {
      e.preventDefault();
      ssZone.classList.remove('bfb-screenshot-zone--dragover');
      const file = e.dataTransfer?.files[0];
      if (file) processImageFile(file);
    });

    // Structured tag selection (#1381) — single-select per group.
    formEl.querySelectorAll('.bfb-tags--change-type .bfb-tag').forEach((btn) => {
      btn.addEventListener('click', () => {
        pendingChangeType = btn.getAttribute('data-change-type');
        formEl.querySelectorAll('.bfb-tags--change-type .bfb-tag').forEach((b) => {
          b.classList.toggle('bfb-tag--active', b === btn);
        });
      });
    });
    formEl.querySelectorAll('.bfb-tags--disposition .bfb-tag').forEach((btn) => {
      btn.addEventListener('click', () => {
        pendingDisposition = btn.getAttribute('data-disposition');
        formEl.querySelectorAll('.bfb-tags--disposition .bfb-tag').forEach((b) => {
          b.classList.toggle('bfb-tag--active', b === btn);
        });
      });
    });

    formEl.querySelector('.bfb-cancel').addEventListener('click', () => {
      screenshotBase64 = null;
      removePendingPin();
      removeForm();
    });

    formEl.querySelector('.bfb-submit').addEventListener('click', () => {
      submitFeedback(pinX, pinY);
    });

    // Submit on Cmd/Ctrl+Enter
    formEl.querySelector('.bfb-comment').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        submitFeedback(pinX, pinY);
      }
    });

    document.body.appendChild(formEl);

    // Place collision-aware now that the popover is measurable.
    positionForm(formEl, screenX, screenY);

    // Focus the right field
    if (!authorName) {
      formEl.querySelector('.bfb-name').focus();
    } else {
      formEl.querySelector('.bfb-comment').focus();
    }
  }

  async function submitFeedback(pinX, pinY) {
    if (!formEl) return;

    const name = formEl.querySelector('.bfb-name').value.trim();
    const email = formEl.querySelector('.bfb-email').value.trim();
    const comment = formEl.querySelector('.bfb-comment').value.trim();

    if (!name || !comment) {
      toast('Please enter your name and a comment');
      return;
    }
    if (!pendingChangeType || !pendingDisposition) {
      toast('Please tag the change type and keep/change');
      return;
    }

    const submitBtn = formEl.querySelector('.bfb-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Remember name/email for next time
    authorName = name;
    authorEmail = email;
    localStorage.setItem('brik-feedback-name', name);
    localStorage.setItem('brik-feedback-email', email);

    try {
      const res = await fetch(`${API_URL}/api/review/${REVIEW_TOKEN}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_key: VARIANT_KEY,
          author_name: name,
          author_email: email || undefined,
          comment,
          pin_x: Math.round(pinX * 100) / 100,
          pin_y: Math.round(pinY),
          viewport_width: window.innerWidth,
          page_url: window.location.href,
          section_context: Object.keys(currentSectionContext || {}).length > 0 ? currentSectionContext : undefined,
          screenshot_base64: screenshotBase64 || undefined,
          change_type: pendingChangeType,
          disposition: pendingDisposition,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit');
      }

      // Capture the new feedback id so its completion toggle works without a reload.
      const created = await res.json().catch(() => ({}));

      // Convert pending pin to permanent
      const pinNumber = pins.length + 1;
      pins.push({ id: created?.feedback?.id, x: pinX, y: pinY, comment, author: name, number: pinNumber, clientCompleted: false });

      screenshotBase64 = null;
      removePendingPin();
      removeForm();
      renderPins();
      deactivate();
      toast('Feedback sent — thank you!');
    } catch (err) {
      console.error('[Brik Feedback]', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      toast('Could not send feedback. Please try again.');
    }
  }

  function removePendingPin() {
    if (pendingPin) {
      pendingPin.remove();
      pendingPin = null;
    }
  }

  function removeForm() {
    if (formEl) {
      formEl.remove();
      formEl = null;
    }
  }

  // ── Toast ───────────────────────────────────────────────────────────────
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'bfb-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Screenshot processing ──────────────────────────────────────────────
  const MAX_IMG_WIDTH = 1200;
  const JPEG_QUALITY = 0.75;

  function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => resizeAndStore(e.target.result);
    reader.readAsDataURL(file);
  }

  function resizeAndStore(dataUrl) {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMG_WIDTH) {
        height = Math.round(height * (MAX_IMG_WIDTH / width));
        width = MAX_IMG_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      screenshotBase64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      renderScreenshotPreview();
    };
    img.src = dataUrl;
  }

  function renderScreenshotPreview() {
    if (!formEl) return;
    // Remove any existing preview
    formEl.querySelector('.bfb-screenshot-preview')?.remove();
    formEl.querySelector('.bfb-screenshot-zone')?.remove();

    if (!screenshotBase64) {
      // Re-insert the upload zone before the actions
      const actions = formEl.querySelector('.bfb-form-actions');
      if (actions) actions.before(createScreenshotZone());
      return;
    }

    const preview = document.createElement('div');
    preview.className = 'bfb-screenshot-preview';

    const thumb = document.createElement('img');
    thumb.src = screenshotBase64;
    preview.appendChild(thumb);

    const removeBtn = document.createElement('div');
    removeBtn.className = 'bfb-screenshot-remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      screenshotBase64 = null;
      renderScreenshotPreview();
    });
    preview.appendChild(removeBtn);

    // Insert before actions
    const actions = formEl.querySelector('.bfb-form-actions');
    if (actions) actions.before(preview);
  }

  function createScreenshotZone() {
    const zone = document.createElement('div');
    zone.className = 'bfb-screenshot-zone';
    zone.innerHTML = '\uD83D\uDCCE Paste, drag, or <u>upload</u> a screenshot';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) processImageFile(e.target.files[0]);
    });
    zone.appendChild(fileInput);

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('bfb-screenshot-zone--dragover');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('bfb-screenshot-zone--dragover');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('bfb-screenshot-zone--dragover');
      const file = e.dataTransfer?.files[0];
      if (file) processImageFile(file);
    });

    return zone;
  }

  // Global paste handler — only active when feedback form is open
  document.addEventListener('paste', (e) => {
    if (!formEl) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        processImageFile(item.getAsFile());
        return;
      }
    }
  });

  // ── Init ────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExistingPins);
  } else {
    loadExistingPins();
  }

})();
