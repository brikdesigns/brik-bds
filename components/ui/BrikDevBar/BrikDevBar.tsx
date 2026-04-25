'use client';

import { useEffect, useRef } from 'react';

/**
 * Brik DevBar — React bootstrap.
 *
 * Mounts the canonical vanilla devbar.js (public/brik-devbar.js) once per page
 * and exposes typed React hooks so other dev widgets can register slots.
 *
 * The underlying shell is the same code that powers mockup deploys, the
 * Brik Client Portal, and Renew PMS — that's the point: one visual source of
 * truth, identical across all Brik surfaces.
 *
 * Source: brik-llm/scripts/brik-dev-tool/widgets/devbar.js (synced via sync-downstream.sh)
 *
 * Promoted from brik-client-portal/src/components/BrikDevBar.tsx on 2026-04-25.
 * DevBarSlotDef + DevBarApi types moved here from DevFeedbackWidget.tsx
 * (they are DevBar API types, not feedback types — they ended up in
 * DevFeedbackWidget historically because that was the first consumer).
 */

// ── DevBar integration types ────────────────────────────────────────────────
/** A slot definition registered with the DevBar shell. */
export interface DevBarSlotDef {
  id: string;
  label: string;
  icon: string;
  order?: number;
  badge?: string | number | null;
  onActivate?: (api: DevBarApi) => void;
  onDeactivate?: (api: DevBarApi) => void;
}

/** Imperative API exposed by the DevBar shell on window.BrikDevBar. */
export interface DevBarApi {
  register: (def: DevBarSlotDef) => DevBarApi;
  unregister: (id: string) => void;
  setBadge: (id: string, value: string | number | null) => void;
  setActive: (id: string, active: boolean) => void;
  isRegistered: (id: string) => boolean;
  getBarRect: () => DOMRect | null;
  getSlotRect: (id: string) => DOMRect | null;
}

declare global {
  interface Window {
    BrikDevBar?: DevBarApi;
    BrikDevBarQueue?: DevBarSlotDef[];
  }
}

// ── BrikDevBar component ─────────────────────────────────────────────────────

/**
 * Loads brik-devbar.js + brik-inspect.js once. Idempotent.
 *
 * - `brik-devbar.js` — always loaded. Provides the shell other widgets register into.
 * - `brik-inspect.js` — always loaded in dev; registers its own Inspect + Scan slots.
 *   The BDS token auditor works against any BDS-built page, not just mockups.
 *
 * Render this once in your DevTools layout (or any high-level layout component).
 * Both scripts must be present in the app's public/ directory — see the sync
 * script at brik-llm/scripts/brik-dev-tool/sync-downstream.sh.
 */
export function BrikDevBar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const inject = (src: string, marker: string, attrs: Record<string, string> = {}) => {
      if (document.querySelector(`script[${marker}]`)) return;
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.setAttribute(marker, '');
      for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
      document.head.appendChild(s);
    };

    if (!window.BrikDevBar) inject('/brik-devbar.js', 'data-brik-devbar-loader');
    // Inspect auto-enables via data-attr → toolbar loads but hover is off
    // until the user clicks the Inspect slot.
    inject('/brik-inspect.js', 'data-brik-inspect-loader', { 'data-auto-enable': '1' });
  }, []);

  return null;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Register a slot with the DevBar. The slot disappears when this hook unmounts.
 *
 * The slot is queued if the DevBar shell hasn't loaded yet, and flushed as
 * soon as it becomes available — so render order doesn't matter.
 *
 * @example
 * useDevBarSlot({
 *   id: 'persona',
 *   label: 'Personas',
 *   icon: '<svg…/>',
 *   order: 30,
 *   onActivate: () => setOpen(true),
 *   onDeactivate: () => setOpen(false),
 * });
 */
export function useDevBarSlot(def: DevBarSlotDef | null) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!def) return;
    if (typeof window === 'undefined') return;

    const register = () => {
      if (!window.BrikDevBar) return false;
      window.BrikDevBar.register(def);
      registeredRef.current = true;
      return true;
    };

    if (register()) {
      // Registered synchronously — nothing more to do.
    } else {
      // Queue for when devbar.js loads.
      window.BrikDevBarQueue = window.BrikDevBarQueue || [];
      window.BrikDevBarQueue.push(def);
      // Poll briefly for late-load.
      const iv = setInterval(() => {
        if (register()) clearInterval(iv);
      }, 50);
      // Give up after 2s — devbar.js probably wasn't loaded on this page.
      setTimeout(() => clearInterval(iv), 2000);
    }

    return () => {
      if (registeredRef.current && window.BrikDevBar) {
        window.BrikDevBar.unregister(def.id);
        registeredRef.current = false;
      } else if (window.BrikDevBarQueue) {
        window.BrikDevBarQueue = window.BrikDevBarQueue.filter((d) => d.id !== def.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def?.id, def?.label]);
}

/**
 * Imperative access to the DevBar API, for widgets that need to toggle
 * active/badge state outside a hook.
 *
 * Returns null when called server-side or before devbar.js has loaded.
 */
export function useDevBarApi(): DevBarApi | null {
  if (typeof window === 'undefined') return null;
  return window.BrikDevBar ?? null;
}
