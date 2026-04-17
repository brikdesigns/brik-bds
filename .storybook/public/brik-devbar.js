/**
 * Brik DevBar — unified bottom-pinned dev toolbar
 *
 * Provides a shared, branded dock that other widgets register into. Any widget
 * loaded *after* devbar.js can attach itself via the global registration API;
 * widgets loaded *before* it can still register through a queued fallback.
 *
 * Visibility model:
 *   - Bar renders only if at least one widget registers.
 *   - Each widget gates its own registration (review token, data-attr, etc.).
 *   - User can collapse the bar; preference persists in localStorage.
 *
 * Widget registration API (window.BrikDevBar):
 *
 *   BrikDevBar.register({
 *     id:         'inspect',           // unique string
 *     label:      'Inspect',           // shown in expanded bar + aria-label
 *     icon:       '<svg…/>' | string,  // inline SVG or emoji, 14px target
 *     onActivate: (api) => { … },      // called when user clicks the slot
 *     onDeactivate: (api) => { … },    // optional — called when user re-clicks
 *     badge:      null,                // initial badge content (number/string)
 *     order:      0,                   // lower = further left
 *   });
 *
 *   BrikDevBar.unregister('inspect');
 *   BrikDevBar.setBadge('inspect', 3);
 *   BrikDevBar.setActive('inspect', true);  // mark slot as toggled on
 *
 * The API passes itself to onActivate handlers so widgets know where the
 * bar lives and can position popovers above it.
 *
 * If devbar.js isn't loaded, widgets should fall back to their own standalone
 * FAB — just check: `if (window.BrikDevBar) …` at init.
 *
 * Zero deps, standalone, BDS-branded to match the rest of mockup-shared.
 */

(function () {
  'use strict';

  // Re-entry guard (in case script is injected twice).
  if (window.BrikDevBar && window.BrikDevBar.__initialized) return;

  // ── BDS Tokens (mirror feedback-widget.js / inspect-widget.js) ──────────
  const T = {
    colorPoppyLight:       '#e35335',
    colorPoppyDark:        '#b0351b',
    colorPoppyLightest:    '#ffefeb',
    colorGrayscaleWhite:   '#ffffff',
    colorGrayscaleLighter: '#e0e0e0',
    colorGrayscaleLight:   '#bdbdbd',
    colorGrayscaleDark:    '#828282',
    colorGrayscaleDarker:  '#4f4f4f',
    colorGrayscaleDarkest: '#333333',
    colorTanLightest:      '#f1f0ec',
    backgroundBrandPrimary:'#e35335',
    interactionBrandHover: '#b0351b',
    textPrimary:   '#333333',
    textMuted:     '#828282',
    textInverse:   '#ffffff',
    borderPrimary: '#e0e0e0',
    fontFamily:    "'Poppins', system-ui, sans-serif",
    fontSizeSm:    '11.54px',
    fontSizeBody:  '14px',
    fontWeightSemiBold: '600',
    fontWeightBold:     '700',
    space100: '4px',
    space200: '8px',
    space300: '12px',
    space400: '16px',
    radius100:  '4px',
    radius200:  '8px',
    radiusPill: '999px',
  };

  // ── State ───────────────────────────────────────────────────────────────
  const slots = new Map();              // id → slot definition
  const elRefs = { bar: null, list: null, toggle: null, logo: null };
  let collapsed = localStorage.getItem('brik-devbar-collapsed') === '1';
  let initialized = false;

  // ── Font load (shared with sibling widgets) ────────────────────────────
  if (!document.querySelector('link[href*="Poppins"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // ── Styles ──────────────────────────────────────────────────────────────
  const css = `
    .bdb-bar {
      position: fixed;
      bottom: ${T.space400};
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483640;
      display: inline-flex;
      align-items: center;
      gap: ${T.space200};
      padding: ${T.space200} ${T.space300};
      background: ${T.backgroundBrandPrimary};
      color: ${T.colorGrayscaleWhite};
      border: 1px solid ${T.interactionBrandHover};
      border-radius: ${T.radiusPill};
      box-shadow: 0 8px 28px rgba(0,0,0,0.22);
      font-family: ${T.fontFamily};
      font-size: ${T.fontSizeBody};
      transition: padding 0.18s ease, gap 0.18s ease;
    }
    .bdb-bar[data-collapsed="true"] {
      padding: ${T.space200};
      gap: 0;
    }
    .bdb-bar[data-collapsed="true"] .bdb-list { display: none; }
    .bdb-bar[data-collapsed="true"] .bdb-divider { display: none; }

    .bdb-logo {
      display: inline-flex; align-items: center; gap: ${T.space200};
      color: ${T.colorGrayscaleWhite};
      font-weight: ${T.fontWeightBold};
      font-size: ${T.fontSizeBody};
      letter-spacing: -0.01em;
      padding: 0 ${T.space100};
      user-select: none;
      pointer-events: none;
    }
    .bdb-logo__mark {
      position: relative;
      width: 20px; height: 20px;
      border-radius: ${T.radius100};
      background: ${T.colorGrayscaleWhite};
      color: ${T.backgroundBrandPrimary};
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: ${T.fontWeightBold};
      letter-spacing: 0;
    }
    /* Aggregate dot — shown when any slot has a badge. Especially useful when
       the bar is collapsed and the slots themselves are hidden. */
    .bdb-logo__mark[data-agg-badge="true"]::after {
      content: '';
      position: absolute;
      top: -3px; right: -3px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${T.colorGrayscaleDarkest};
      border: 1.5px solid ${T.backgroundBrandPrimary};
    }

    .bdb-divider {
      width: 1px; height: 18px;
      background: rgba(255,255,255,0.28);
      margin: 0 ${T.space100};
    }

    .bdb-list {
      display: inline-flex;
      align-items: center;
      gap: ${T.space100};
    }

    .bdb-slot {
      position: relative;
      display: inline-flex; align-items: center; justify-content: center;
      gap: ${T.space100};
      padding: 0;
      width: 40px; height: 40px;
      background: transparent;
      color: ${T.colorGrayscaleWhite};
      border: none;
      border-radius: ${T.radius200};
      font-family: ${T.fontFamily};
      font-size: ${T.fontSizeSm};
      font-weight: ${T.fontWeightSemiBold};
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
      line-height: 1;
      white-space: nowrap;
    }
    .bdb-slot__label { display: none; }
    .bdb-slot:hover { background: rgba(255,255,255,0.15); }
    .bdb-slot[data-active="true"] {
      background: ${T.colorGrayscaleWhite};
      color: ${T.backgroundBrandPrimary};
    }
    .bdb-slot[data-active="true"]:hover { background: ${T.colorTanLightest}; }
    .bdb-slot__icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 14px; height: 14px;
    }
    .bdb-slot__icon svg { width: 16px; height: 16px; }
    .bdb-slot__badge {
      position: absolute; top: -2px; right: -4px;
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 14px; height: 14px;
      padding: 0 3px;
      border-radius: ${T.radiusPill};
      background: ${T.colorGrayscaleDarkest};
      color: ${T.colorGrayscaleWhite};
      font-family: ${T.fontFamily};
      font-size: 9px;
      font-weight: ${T.fontWeightBold};
      line-height: 1;
      border: 1px solid ${T.colorGrayscaleWhite};
    }
    .bdb-slot[data-active="true"] .bdb-slot__badge {
      background: ${T.colorGrayscaleWhite};
      color: ${T.backgroundBrandPrimary};
    }

    .bdb-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px;
      padding: 0;
      background: transparent;
      color: rgba(255,255,255,0.78);
      border: none;
      border-radius: ${T.radiusPill};
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .bdb-toggle:hover {
      background: rgba(255,255,255,0.15);
      color: ${T.colorGrayscaleWhite};
    }
    .bdb-toggle svg { width: 14px; height: 14px; }
  `;

  function injectStyles() {
    if (document.querySelector('style[data-brik-devbar]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-brik-devbar', '');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Icons ───────────────────────────────────────────────────────────────
  const ICON_EXPAND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  const ICON_COLLAPSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  // ── DOM ─────────────────────────────────────────────────────────────────
  function buildBar() {
    if (elRefs.bar) return;

    const bar = document.createElement('div');
    bar.className = 'bdb-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Brik DevBar');
    bar.setAttribute('data-collapsed', String(collapsed));

    const logo = document.createElement('div');
    logo.className = 'bdb-logo';
    logo.innerHTML = `<span class="bdb-logo__mark">B</span><span>Brik</span>`;
    bar.appendChild(logo);

    const divider = document.createElement('span');
    divider.className = 'bdb-divider';
    bar.appendChild(divider);

    const list = document.createElement('div');
    list.className = 'bdb-list';
    list.setAttribute('role', 'group');
    bar.appendChild(list);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'bdb-toggle';
    toggle.setAttribute('aria-label', 'Collapse DevBar');
    toggle.innerHTML = collapsed ? ICON_EXPAND : ICON_COLLAPSE;
    toggle.addEventListener('click', toggleCollapsed);
    bar.appendChild(toggle);

    document.body.appendChild(bar);

    elRefs.bar = bar;
    elRefs.list = list;
    elRefs.toggle = toggle;
    elRefs.logo = logo;
  }

  function toggleCollapsed() {
    collapsed = !collapsed;
    localStorage.setItem('brik-devbar-collapsed', collapsed ? '1' : '0');
    if (elRefs.bar) elRefs.bar.setAttribute('data-collapsed', String(collapsed));
    if (elRefs.toggle) {
      elRefs.toggle.innerHTML = collapsed ? ICON_EXPAND : ICON_COLLAPSE;
      elRefs.toggle.setAttribute('aria-label', collapsed ? 'Expand DevBar' : 'Collapse DevBar');
    }
  }

  // ── Slot rendering ──────────────────────────────────────────────────────
  function renderSlot(def) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bdb-slot';
    btn.setAttribute('data-slot-id', def.id);
    btn.setAttribute('data-active', 'false');
    btn.setAttribute('aria-label', def.label);
    btn.setAttribute('title', def.label);
    btn.innerHTML = `
      <span class="bdb-slot__icon">${def.icon || ''}</span>
      <span class="bdb-slot__label">${escapeHtml(def.label)}</span>
      ${def.badge != null ? `<span class="bdb-slot__badge">${escapeHtml(String(def.badge))}</span>` : ''}
    `;

    btn.addEventListener('click', () => {
      const wasActive = btn.getAttribute('data-active') === 'true';
      if (wasActive) {
        setActive(def.id, false);
        if (typeof def.onDeactivate === 'function') def.onDeactivate(api);
      } else {
        setActive(def.id, true);
        if (typeof def.onActivate === 'function') def.onActivate(api);
      }
    });

    return btn;
  }

  function resort() {
    if (!elRefs.list) return;
    const ordered = Array.from(slots.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    elRefs.list.innerHTML = '';
    for (const def of ordered) {
      const el = renderSlot(def);
      elRefs.list.appendChild(el);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ── Public API ──────────────────────────────────────────────────────────
  function register(def) {
    if (!def || !def.id || !def.label) {
      console.warn('[BrikDevBar] register() requires { id, label }');
      return;
    }
    slots.set(def.id, { order: 0, badge: null, ...def });
    if (!initialized) {
      injectStyles();
      buildBar();
      initialized = true;
    }
    resort();
    updateAggregateBadge();
    return api;
  }

  function unregister(id) {
    if (!slots.has(id)) return;
    slots.delete(id);
    resort();
    updateAggregateBadge();
    if (slots.size === 0 && elRefs.bar) {
      elRefs.bar.remove();
      elRefs.bar = null;
      elRefs.list = null;
      elRefs.toggle = null;
      elRefs.logo = null;
      initialized = false;
    }
  }

  function setBadge(id, value) {
    const slot = slots.get(id);
    if (!slot) return;
    slot.badge = value;
    const btn = elRefs.list?.querySelector(`[data-slot-id="${id}"]`);
    if (btn) {
      let badgeEl = btn.querySelector('.bdb-slot__badge');
      if (value == null) {
        if (badgeEl) badgeEl.remove();
      } else {
        if (!badgeEl) {
          badgeEl = document.createElement('span');
          badgeEl.className = 'bdb-slot__badge';
          btn.appendChild(badgeEl);
        }
        badgeEl.textContent = String(value);
      }
    }
    updateAggregateBadge();
  }

  // When any slot has a badge, show a small dot on the logo mark so the
  // user sees activity even when the bar is collapsed.
  function updateAggregateBadge() {
    const hasAny = Array.from(slots.values()).some((s) => s.badge != null && s.badge !== '' && s.badge !== 0);
    if (!elRefs.logo) return;
    const mark = elRefs.logo.querySelector('.bdb-logo__mark');
    if (!mark) return;
    if (hasAny) mark.setAttribute('data-agg-badge', 'true');
    else mark.removeAttribute('data-agg-badge');
  }

  function setActive(id, active) {
    const btn = elRefs.list?.querySelector(`[data-slot-id="${id}"]`);
    if (btn) btn.setAttribute('data-active', String(!!active));
    // Also clear any other active slots if this one was activated — single-select behavior.
    if (active && elRefs.list) {
      for (const other of elRefs.list.querySelectorAll('.bdb-slot[data-active="true"]')) {
        if (other.getAttribute('data-slot-id') !== id) other.setAttribute('data-active', 'false');
      }
    }
  }

  function isRegistered(id) {
    return slots.has(id);
  }

  const api = {
    __initialized: true,
    register,
    unregister,
    setBadge,
    setActive,
    isRegistered,
    // Position helpers for widgets rendering popovers anchored above the bar.
    getBarRect: () => (elRefs.bar ? elRefs.bar.getBoundingClientRect() : null),
    getSlotRect: (id) => {
      const btn = elRefs.list?.querySelector(`[data-slot-id="${id}"]`);
      return btn ? btn.getBoundingClientRect() : null;
    },
  };

  // ── Flush any queued registrations posted before this script loaded ─────
  // Widgets may do:  (window.BrikDevBarQueue = window.BrikDevBarQueue || []).push(def)
  // so they can register even if devbar.js loads later.
  window.BrikDevBar = api;
  if (Array.isArray(window.BrikDevBarQueue)) {
    for (const def of window.BrikDevBarQueue) register(def);
    window.BrikDevBarQueue = [];
  }
})();
