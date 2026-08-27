/**
 * Silences one React 18 dev warning, and only that one — brik-bds#2029.
 *
 * `lottie-react` v3 declares `react: "^18.2.0 || ^19.0.0"`, but its `mergeRefs`
 * returns a cleanup function from a ref callback: the React 19 pattern. React 18
 * discards the return value and logs
 *
 *     Unexpected return value from a callback ref in %s.
 *     A callback ref should not return a function.
 *
 * once per rendered `<Lottie>`. BDS dev-tests on React 18.3.1, so every
 * AnimatedIcon story and every Storybook session pays it. That is loud enough to
 * bury real console output, which is the whole reason console warnings are worth
 * reading.
 *
 * The warning is cosmetic and NOTHING leaks. `item.destroy()` lives in a
 * `useEffect` cleanup inside lottie-react's `useLottieAnimation`, not in the ref
 * cleanup, and effect cleanups run on unmount under React 18 exactly as under 19.
 * Measured on React 18.3.1: lottie-web's registered-animation count goes 1 → 0
 * across unmount. That measurement is asserted permanently by
 * `components/ui/AnimatedIcon/AnimatedIcon.unmount.browser.test.ts`, so this
 * filter cannot mask a teardown regression — the guard fails even while the
 * warning stays hidden.
 *
 * Matched on the leading clause, not the whole sentence. React passes a FORMAT
 * string with `%s` placeholders (`in %s`), so the rendered text and the argument
 * `console.error` actually receives are different strings; matching the full
 * sentence silently never fires.
 *
 * Installed by importing for side effect. Both call sites need it because they
 * are different runtimes: `.storybook/preview.tsx` covers Storybook dev and the
 * `storybook` Vitest project, and the AnimatedIcon teardown test runs in the
 * `components-browser` project, which does not load the preview. Vitest's
 * `onConsoleLog` is NOT an option — these lines reach the terminal through
 * Vite's own browser-console forwarder (`server.ln`, tagged `[vite] (client)`),
 * which bypasses Vitest's console capture entirely; only `server.ln.logLevels`
 * can touch them, and that drops every browser `console.error`, real ones too.
 *
 * Remove when lottie-react ships the upstream fix — filed as
 * https://github.com/Gamote/lottie-react/issues/140 — or when BDS's dev React
 * moves to 19. Either makes this file dead; check the upstream issue before
 * assuming it is still needed.
 */
const WARNING_PREFIX = 'Unexpected return value from a callback ref';

const isLottieCallbackRefWarning = (args: unknown[]): boolean =>
  typeof args[0] === 'string' && args[0].includes(WARNING_PREFIX);

type Filtered = typeof console.error & { __bdsLottieFilter?: true };

export function suppressLottieCallbackRefWarning(): void {
  // Vitest re-patches the browser console after project setup, so a single
  // install can be overwritten. Guard on the marker and re-wrap whatever
  // `console.error` currently is, rather than assuming ours is still in place.
  if ((console.error as Filtered).__bdsLottieFilter) return;

  const passThrough = console.error.bind(console);
  const filtered: Filtered = (...args: unknown[]) => {
    if (isLottieCallbackRefWarning(args)) return;
    passThrough(...args);
  };
  filtered.__bdsLottieFilter = true;
  console.error = filtered;
}

suppressLottieCallbackRefWarning();
