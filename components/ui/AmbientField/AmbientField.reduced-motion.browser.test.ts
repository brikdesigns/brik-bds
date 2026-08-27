import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { AmbientField } from './index';
import driftField from './_examples/drift-field.json';
// AmbientField renders <Lottie>; this project does not load
// .storybook/preview.tsx, so it installs the #2029 warning filter itself.
import '../../../tests/suppress-lottie-callback-ref-warning';

/**
 * Reduced motion is #2050's ship gate, so it is asserted rather than described.
 *
 * The claim under test is specific and easy to get wrong in the direction that
 * looks correct: under `prefers-reduced-motion: reduce` the field must FREEZE,
 * not vanish. A component that returned `null` would pass a naive "nothing
 * moves" check while destroying the composition the tier exists to deliver.
 *
 * Browser-only: the canvas mode paints through a real 2D context and schedules
 * real animation frames. Runs under the `components-browser` project.
 */

/** Force `matchMedia('(prefers-reduced-motion: reduce)')` to a fixed answer. */
function stubReducedMotion(reduce: boolean): () => void {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion: reduce') ? reduce : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

let host: HTMLDivElement | null = null;
let root: Root | null = null;
let restoreMatchMedia: (() => void) | null = null;

/** Mounts into a sized, positioned parent — the field is `inset: 0`. */
async function mount(element: React.ReactElement): Promise<HTMLDivElement> {
  host = document.createElement('div');
  host.style.position = 'relative';
  host.style.width = '320px';
  host.style.height = '200px';
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(element);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
  return host;
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  host?.remove();
  root = null;
  host = null;
  restoreMatchMedia?.();
  restoreMatchMedia = null;
  vi.restoreAllMocks();
});

/** Waits, then reports whether the canvas painted anything different. */
async function pixelsChangedOver(canvas: HTMLCanvasElement, ms: number) {
  const before = canvas.toDataURL();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
  return { changed: canvas.toDataURL() !== before, before };
}

describe('AmbientField reduced-motion ship gate (#2050)', () => {
  // Asserted on painted pixels, not on a `requestAnimationFrame` spy. React's
  // own scheduler calls rAF during mount, so a spy answers "did anything in the
  // page schedule a frame", which is not the claim. Whether the field moves is.
  it('canvas mode holds a single still frame under reduced motion', async () => {
    restoreMatchMedia = stubReducedMotion(true);

    const mounted = await mount(
      React.createElement(AmbientField, { mode: 'canvas', particleCount: 24 }),
    );

    const canvas = mounted.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    // Frozen, NOT gone — the layer still occupies its box and the canvas is
    // still sized, so the composition survives the preference.
    expect(canvas.width).toBeGreaterThan(0);

    const { changed, before } = await pixelsChangedOver(canvas, 250);
    expect(changed).toBe(false);
    // ...and it is a painted frame, not an empty one. A canvas that drew
    // nothing would also never change.
    expect(before).not.toBe(document.createElement('canvas').toDataURL());
  });

  it('canvas mode DOES animate when motion is allowed', async () => {
    restoreMatchMedia = stubReducedMotion(false);

    const mounted = await mount(
      React.createElement(AmbientField, { mode: 'canvas', particleCount: 24 }),
    );

    // The negative assertion above is only meaningful if the positive one
    // holds — otherwise a field that never painted would pass both.
    const canvas = mounted.querySelector('canvas') as HTMLCanvasElement;
    const { changed } = await pixelsChangedOver(canvas, 250);
    expect(changed).toBe(true);
  });

  it('cancels its animation frame on unmount', async () => {
    restoreMatchMedia = stubReducedMotion(false);

    await mount(
      React.createElement(AmbientField, { mode: 'canvas', particleCount: 24 }),
    );

    const unmounting = root!;
    root = null; // afterEach must not unmount twice
    await act(async () => unmounting.unmount());

    // Count frames scheduled AFTER unmount: the loop reschedules itself every
    // frame, so a leaked rAF shows up as a rising count while a cancelled one
    // stays flat. Spying only now keeps React's mount-time frames out of it.
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(raf).not.toHaveBeenCalled();
  });

  it('lottie mode renders the animation frozen rather than removing it', async () => {
    restoreMatchMedia = stubReducedMotion(true);

    const mounted = await mount(
      React.createElement(AmbientField, { mode: 'lottie', src: driftField }),
    );

    // Still rendered — the poster frame is the whole point.
    expect(mounted.querySelectorAll('svg').length).toBe(1);
    expect(mounted.querySelector('.bds-ambient-field')).not.toBeNull();
  });

  it('is out of the accessibility tree and non-interactive', async () => {
    restoreMatchMedia = stubReducedMotion(false);

    const mounted = await mount(
      React.createElement(AmbientField, { mode: 'canvas', particleCount: 8 }),
    );

    const field = mounted.querySelector('.bds-ambient-field') as HTMLElement;
    expect(field.getAttribute('aria-hidden')).toBe('true');
    expect(window.getComputedStyle(field).pointerEvents).toBe('none');
  });
});
