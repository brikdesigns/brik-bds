/**
 * Theme registry — the single source of truth for every theme the
 * Contrast Compliance audit (and any future multi-theme probe) should
 * evaluate.
 *
 * Why this exists
 * ---------------
 * BDS ships 3 built-in themes (Brik, Brik Dark, Client Sim). Client
 * brands ship their own `theme-{client}.css` in consumer repos (portal,
 * renew-pms, brikdesigns, client sites). The Contrast Compliance story
 * used to hardcode a `THEMES` array, which meant adding a client theme
 * to the WCAG probe required hand-editing stories code.
 *
 * With this registry, consumers with a client theme loaded in their
 * Storybook composition can call `registerClientTheme({...})` once (e.g.
 * in `.storybook/preview.ts`) and the theme enters every registry-aware
 * probe automatically.
 *
 * Usage from a consumer Storybook
 * -------------------------------
 *   // .storybook/preview.ts (consumer repo)
 *   import { registerClientTheme } from '@brikdesigns/bds';
 *   import './styles/theme-freedom.css'; // must also load the stylesheet
 *
 *   registerClientTheme({
 *     key: 'freedom',
 *     name: 'Freedom',
 *     description: 'Freedom Group — slate on warm ivory',
 *     bodyClasses: ['body', 'theme-brand-freedom'],
 *     dataTheme: 'light',
 *   });
 *
 * Registration only tells the audit the theme exists; it does not load
 * the stylesheet. The CSS import is what makes the class + data-theme
 * selectors actually resolve on the page.
 */

export interface ThemeSpec {
  /** Stable identifier for the theme — used as React key + audit row id. */
  key: string;
  /** Human-readable name shown in audit output. */
  name: string;
  /** One-line description surfaced under the name in audit cards. */
  description: string;
  /**
   * Classes to apply to `<body>` when probing this theme. The built-in
   * 'brand' class (`theme-brand-brik`) plus any additional theme-specific
   * class (`theme-client-sim`) goes here — order matters for cascade.
   */
  bodyClasses: string[];
  /**
   * Value to set on `html[data-theme]` when probing. Used by Figma-generated
   * dark-mode tokens to scope their overrides.
   */
  dataTheme: 'light' | 'dark';
}

/**
 * The three themes BDS itself ships. Never mutate — consumers extend via
 * `registerClientTheme`.
 */
export const BUILT_IN_THEMES: readonly ThemeSpec[] = [
  {
    key: 'brik',
    name: 'Brik',
    description: 'Default brand — poppy on white, light mode',
    bodyClasses: ['body', 'theme-brand-brik'],
    dataTheme: 'light',
  },
  {
    key: 'brik-dark',
    name: 'Brik Dark',
    description: 'Default brand — poppy on near-black, dark mode',
    bodyClasses: ['body', 'theme-brand-brik'],
    dataTheme: 'dark',
  },
  {
    key: 'client-sim',
    name: 'Client Sim',
    description: 'Font-audit theme — Georgia / Verdana / Courier New to expose family misuse',
    bodyClasses: ['body', 'theme-brand-brik', 'theme-client-sim'],
    dataTheme: 'light',
  },
] as const;

// Module-level registry of client themes. Populated by `registerClientTheme`
// at consumer Storybook init; read by `getAllThemes()` at probe time.
const registeredClientThemes: ThemeSpec[] = [];

/**
 * Register a client theme so it enters every registry-aware probe
 * (Contrast Compliance, future font-audit passes, etc.). Call from a
 * consumer Storybook's `.storybook/preview.ts` alongside the stylesheet
 * import for the theme.
 *
 * If a theme with the same `key` is already registered, the new spec
 * replaces it — no duplicates.
 */
export function registerClientTheme(spec: ThemeSpec): void {
  const existingIndex = registeredClientThemes.findIndex((t) => t.key === spec.key);
  if (existingIndex >= 0) {
    registeredClientThemes[existingIndex] = spec;
    return;
  }
  registeredClientThemes.push(spec);
}

/**
 * Return every theme the audit should evaluate: the three BDS built-ins
 * followed by any client themes registered by a consumer Storybook.
 * Callers should not mutate the returned array.
 */
export function getAllThemes(): readonly ThemeSpec[] {
  return [...BUILT_IN_THEMES, ...registeredClientThemes];
}

/**
 * Test-only escape hatch — resets the registered client themes list.
 * Not exported from the package index; use only in unit tests.
 */
export function _resetClientThemesForTests(): void {
  registeredClientThemes.length = 0;
}
