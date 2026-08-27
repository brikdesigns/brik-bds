import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import lottieWeb from 'lottie-web';
import { AnimatedIcon } from './index';
// This project does not load .storybook/preview.tsx, so it installs the #2029
// warning filter itself. It only hides that one line; every assertion below
// reads lottie-web's registry, not the console.
import '../../../tests/suppress-lottie-callback-ref-warning';

/**
 * Teardown guard for #2029.
 *
 * `lottie-react` v3's `mergeRefs` returns a cleanup function from a ref
 * callback — the React 19 pattern — while declaring support for React 18.2+.
 * On React 18 the return value is discarded and React logs `Unexpected return
 * value from a callback ref`. `.storybook/preview.tsx` filters that one string
 * so it stops drowning story runs.
 *
 * Filtering a warning is only safe if the thing the warning gestures at is
 * independently asserted. That is this file. `item.destroy()` lives in a
 * `useEffect` cleanup inside `useLottieAnimation`, not in the ref cleanup, so
 * unmount tears the animation down on React 18 and 19 alike — and lottie-web's
 * module-level registry is where that is observable. If a future React or
 * lottie-react bump ever does turn the discarded ref cleanup into a real leak,
 * the suppressed warning will not say so; this test will.
 *
 * Browser-only: lottie-web paints into a real element and reads layout, so
 * node/jsdom cannot host it. Runs under the `components-browser` project.
 */

/** Minimal valid Lottie: one filled ellipse, 60 frames. */
const src = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 60,
  w: 32,
  h: 32,
  nm: 'teardown-guard',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'shape',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [16, 16, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [20, 20] }, nm: 'ellipse' },
        { ty: 'fl', c: { a: 0, k: [1, 0, 0, 1] }, o: { a: 0, k: 100 }, nm: 'fill' },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

const registeredAnimations = (): number =>
  (
    lottieWeb as unknown as { getRegisteredAnimations: () => unknown[] }
  ).getRegisteredAnimations().length;

let host: HTMLDivElement | null = null;
let root: Root | null = null;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

describe('AnimatedIcon teardown (#2029)', () => {
  it('destroys the lottie animation on unmount, on whatever React BDS builds against', async () => {
    const before = registeredAnimations();

    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root!.render(
        React.createElement(AnimatedIcon, { src, size: 32, label: 'teardown guard' }),
      );
    });
    // lottie-web loads and registers asynchronously; wait for DOMLoaded to paint.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    expect(host.querySelectorAll('svg').length).toBe(1);
    expect(registeredAnimations()).toBe(before + 1);

    const mounted = root;
    root = null; // afterEach must not unmount twice
    await act(async () => mounted.unmount());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // The assertion the preview.tsx warning filter rests on.
    expect(registeredAnimations()).toBe(before);
  });
});
