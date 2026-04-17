import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  ThemeNumber,
  BDSThemeConfig,
  defaultTheme,
  getThemeClasses,
  themeMetadata,
} from '../../tokens';

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

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * localStorage key for persisting theme
 */
const STORAGE_KEY = 'bds-theme';

/**
 * Load theme from localStorage
 */
function loadThemeFromStorage(): Partial<BDSThemeConfig> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load theme from localStorage:', e);
  }
  return {};
}

/**
 * Save theme to localStorage
 */
function saveThemeToStorage(theme: BDSThemeConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.warn('Failed to save theme to localStorage:', e);
  }
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
 * Available Themes (class + data-theme attribute):
 * - theme-brand-brik + data-theme="light": Brik Light (default)
 * - theme-brand-brik + data-theme="dark": Brik Dark
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
export function ThemeProvider({
  children,
  initialTheme = {},
  persist = true,
  applyToBody = true,
}: ThemeProviderProps) {
  // Load initial theme from storage or props
  const [theme, setTheme] = useState<BDSThemeConfig>(() => {
    const stored = persist ? loadThemeFromStorage() : {};
    return {
      ...defaultTheme,
      ...stored,
      ...initialTheme,
    };
  });

  // Update theme when initialTheme prop changes (for Storybook toolbar)
  useEffect(() => {
    if (initialTheme.themeNumber && initialTheme.themeNumber !== theme.themeNumber) {
      setTheme((prev) => ({
        ...prev,
        ...initialTheme,
      }));
    }
  }, [initialTheme.themeNumber]);

  // Generate theme classes
  const themeClasses = getThemeClasses(theme);

  // Get metadata for current theme
  const metadata = themeMetadata[theme.themeNumber] || themeMetadata['brik'];

  // Apply theme to body
  useEffect(() => {
    if (!applyToBody || typeof document === 'undefined') return;

    const body = document.body;

    // Webflow CSS uses .body.theme-X selectors, so we need BOTH classes
    // Add 'body' class if not present (required for Webflow CSS selectors)
    if (!body.classList.contains('body')) {
      body.classList.add('body');
    }

    // Remove old theme classes (includes legacy 'theme-brik' / 'theme-brik-dark'
    // names from pre-v0.7 BDS in case a consumer upgrades without a hard reload)
    body.classList.remove(
      'theme-brik',
      'theme-brik-dark',
      'theme-brand-brik',
      'theme-client-sim',
      'theme-1',
      'theme-2',
      'theme-3',
      'theme-4',
      'theme-5',
      'theme-6',
      'theme-7',
      'theme-8'
    );

    // Brand themes share the 'theme-brand-brik' class and differentiate via
    // the `data-theme` attribute on <html>. Numbered template themes keep the
    // 'theme-X' class (no data-theme attribute).
    const html = document.documentElement;
    if (theme.themeNumber === 'brik' || theme.themeNumber === 'brik-dark') {
      body.classList.add('theme-brand-brik');
      html.setAttribute('data-theme', theme.themeNumber === 'brik-dark' ? 'dark' : 'light');
    } else if (theme.themeNumber === 'client-sim') {
      body.classList.add('theme-brand-brik', 'theme-client-sim');
      html.setAttribute('data-theme', 'light');
    } else {
      body.classList.add(`theme-${theme.themeNumber}`);
      html.removeAttribute('data-theme');
    }

    // Dispatch custom event for other scripts
    document.dispatchEvent(
      new CustomEvent('bds-theme-changed', {
        detail: theme,
      })
    );
  }, [theme, applyToBody]);

  // Persist theme to storage
  useEffect(() => {
    if (persist) {
      saveThemeToStorage(theme);
    }
  }, [theme, persist]);

  // Theme setter
  const setThemeNumber = useCallback((num: ThemeNumber) => {
    setTheme((prev) => ({ ...prev, themeNumber: num }));
  }, []);

  const value: ThemeContextValue = {
    themeNumber: theme.themeNumber,
    setThemeNumber,
    themeClasses,
    theme,
    themeName: metadata.name,
    themeDescription: metadata.description,
    isDark: metadata.isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

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
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
