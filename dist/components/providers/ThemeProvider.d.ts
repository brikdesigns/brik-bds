import { type ReactNode } from 'react';
import { ThemeNumber, BDSThemeConfig } from '../../tokens';
/**
 * Theme context value interface
 */
export interface ThemeContextValue {
    /** Current theme number (1-8) */
    themeNumber: ThemeNumber;
    /** Set theme by number */
    setThemeNumber: (num: ThemeNumber) => void;
    /** Get current theme classes for applying to elements */
    themeClasses: string;
    /** Full theme config object */
    theme: BDSThemeConfig;
    /** Theme metadata for display */
    themeName: string;
    themeDescription: string;
    isDark: boolean;
}
/**
 * ThemeProvider props
 */
export interface ThemeProviderProps {
    /** Child components */
    children: ReactNode;
    /** Initial theme config (overrides localStorage) */
    initialTheme?: Partial<BDSThemeConfig>;
    /** Whether to persist theme to localStorage */
    persist?: boolean;
    /** Whether to apply theme classes to document body */
    applyToBody?: boolean;
}
/**
 * ThemeProvider - Provides BDS theme context to components
 *
 * Features:
 * - 10 complete themes (Brik Light/Dark + 8 numbered)
 * - Each theme bundles color, typography, spacing, and border tokens
 * - localStorage persistence (optional)
 * - Automatic body class application (optional)
 *
 * Available Themes:
 * - theme-brik: Brik Light (Default)
 * - theme-brik-dark: Brik Dark
 * - theme-1: Peach (Open Sans)
 * - theme-2: Pastel (Source Sans)
 * - theme-3: Luxury (Hind)
 * - theme-4: Vibrant (Playfair Display)
 * - theme-5: White (Open Sans)
 * - theme-6: Black (Geist Mono)
 * - theme-7: Blue (Source Sans)
 * - theme-8: Yellow (Hind)
 *
 * @example
 * ```tsx
 * <ThemeProvider initialTheme={{ themeNumber: '2' }}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export declare function ThemeProvider({ children, initialTheme, persist, applyToBody, }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * useTheme - Hook to access theme context
 *
 * @throws Error if used outside of ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { themeNumber, setThemeNumber, themeName } = useTheme();
 *   return (
 *     <button onClick={() => setThemeNumber('2')}>
 *       Current: {themeName}
 *     </button>
 *   );
 * }
 * ```
 */
export declare function useTheme(): ThemeContextValue;
export default ThemeProvider;
