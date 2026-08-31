import { createContext, useContext } from 'react';

/**
 * Phosphor stroke weight. Phosphor encodes weight in the icon *name* —
 * `ph:{name}` (regular), `ph:{name}-bold`, `ph:{name}-fill`, etc. BDS exposes it
 * as an `<Icon weight>` prop and as a per-app default carried on context.
 *
 * Lives in its own module (not Icon.tsx) so both `<Icon>` and ThemeProvider can
 * import the context without an Icon↔ThemeProvider import cycle.
 */
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

/**
 * BDS's standard line density. The weight `<Icon>` renders when neither a
 * `weight` prop nor an enclosing provider says otherwise — unchanged from the
 * pre-provider default (`bold`).
 */
export const DEFAULT_ICON_WEIGHT: IconWeight = 'bold';

/**
 * Per-app default Phosphor weight, set by a provider (ThemeProvider's
 * `defaultIconWeight` prop). `undefined` means no provider is mounted — the
 * common case for an isolated `<Icon>` — and callers fall back to
 * {@link DEFAULT_ICON_WEIGHT}.
 *
 * Icon weight is NOT a `[data-mode-*]` CSS token: weight selects a different
 * SVG asset by rewriting the Phosphor name in JS (see `applyWeight` in
 * Icon.tsx), which the CSS cascade cannot carry. It therefore travels on React
 * context, not through `dist/tokens.css` (ADR-036).
 */
export const IconWeightContext = createContext<IconWeight | undefined>(undefined);

/**
 * Resolve the ambient default icon weight. Non-throwing by design — unlike
 * `useTheme`, `<Icon>` is used in trees with no provider above it, so a missing
 * provider must degrade to {@link DEFAULT_ICON_WEIGHT}, never error.
 */
export function useIconWeight(): IconWeight {
  return useContext(IconWeightContext) ?? DEFAULT_ICON_WEIGHT;
}
