'use client';

/**
 * Storybook preview InspectWidget — mounts the vanilla Brik inspector
 * (`brik-inspect.js`, served from `.storybook/public`) as a Brik DevBar slot so
 * reviewers can inspect any component's tokens, BDS classes, and a11y directly
 * in the preview iframe.
 *
 * The inspector engine is injected once and left in host-managed mode
 * (`window.__BRIK_INSPECT_DEVBAR_HOST_MANAGED__`) so THIS component owns the
 * DevBar slot lifecycle — registering on mount, unregistering + deactivating on
 * unmount — exactly like the feedback slot (DevFeedbackWidget). That keeps the
 * `devWidgets` toolbar toggle authoritative: flipping it off removes the slot
 * (and tears down any active inspect overlay); flipping it back on restores it.
 * The decorator suppresses the whole widget under Chromatic, so no dev chrome
 * leaks into visual-regression snapshots.
 *
 * The inspector logic itself stays single-sourced in the vanilla file that
 * product apps sync (`components/ui/BrikDevBar/widgets/inspect-widget.js`) —
 * this wrapper is only the Storybook mount + slot bridge.
 */

import { useEffect } from 'react';

declare global {
  interface Window {
    /** Inspector engine surface (brik-inspect.js). */
    BrikInspect?: {
      setActive?: (next: boolean) => void;
      isActive?: () => boolean;
      [key: string]: unknown;
    };
    /** When true, brik-inspect.js skips its own DevBar registration (host-managed). */
    __BRIK_INSPECT_DEVBAR_HOST_MANAGED__?: boolean;
  }
}

// Crosshair — mirrors iconCrosshair() in inspect-widget.js so the slot icon
// matches the inspector's own standalone-toolbar button.
const CROSSHAIR_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>';

export function InspectWidget() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Take over the DevBar slot from the engine so mount/unmount tracks the
    // devWidgets toggle. Set before injection so the engine's init() reads it.
    window.__BRIK_INSPECT_DEVBAR_HOST_MANAGED__ = true;

    // Inject the inspector engine once. `data-auto-enable` loads it inert —
    // hover stays off until the user clicks the slot. `data-storybook-base`
    // points its "Open in Storybook" deep-links at this same Storybook origin.
    if (!document.querySelector('script[data-brik-inspect-src]')) {
      const script = document.createElement('script');
      script.src = '/brik-inspect.js';
      script.setAttribute('data-auto-enable', '1');
      script.setAttribute('data-brik-inspect-src', '');
      script.setAttribute('data-storybook-base', window.location.origin);
      document.head.appendChild(script);
    }

    const slotDef = {
      id: 'inspect',
      label: 'Inspect',
      icon: CROSSHAIR_ICON,
      order: 20,
      onActivate: () => window.BrikInspect?.setActive?.(true),
      onDeactivate: () => window.BrikInspect?.setActive?.(false),
    };

    // Register now if the DevBar shell is up (loaded from preview-head.html),
    // otherwise queue for when it initialises.
    if (window.BrikDevBar) {
      window.BrikDevBar.register(slotDef);
    } else {
      window.BrikDevBarQueue = window.BrikDevBarQueue || [];
      window.BrikDevBarQueue.push(slotDef);
    }

    return () => {
      // devWidgets → off: stop any live inspect session and drop the slot.
      window.BrikInspect?.setActive?.(false);
      window.BrikDevBar?.unregister('inspect');
      window.BrikDevBarQueue = window.BrikDevBarQueue?.filter((d) => d.id !== 'inspect');
    };
  }, []);

  return null;
}
