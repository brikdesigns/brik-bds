'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { SheetVariant, SheetTab, SheetMode, SheetSecondaryAction } from '../ui/Sheet';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SheetFrame {
  /** Unique key for React reconciliation */
  key: string;
  /** Entity type from the consumer's registry (e.g. 'request', 'vendor') */
  type: string;
  /** Props to pass to the sheet component (typically `{ id: string }`) */
  props: Record<string, unknown>;
  /** Sheet variant — defaults to 'floating' for view sheets */
  variant: SheetVariant;
  /** Title to display in the sheet header */
  title?: string;
}

export interface SheetStackContextValue {
  /** Current navigation stack (last = topmost) */
  stack: SheetFrame[];
  /** Whether any sheet is open */
  isOpen: boolean;
  /** Whether the topmost frame is animating out */
  isExiting: boolean;
  /** Direction of the current transition ('forward' | 'back') */
  direction: 'forward' | 'back';
  /** Clear the stack and open a single sheet (for opening from outside) */
  openSheet: (type: string, props: Record<string, unknown>, opts?: { variant?: SheetVariant; title?: string }) => void;
  /** Push a sheet onto the existing stack (for drilling into related records) */
  pushSheet: (type: string, props: Record<string, unknown>, opts?: { variant?: SheetVariant; title?: string }) => void;
  /** Pop the topmost sheet (animated). If stack becomes empty, sheet closes. */
  back: () => void;
  /** Close the entire stack immediately */
  closeAll: () => void;
}

const SheetStackContext = createContext<SheetStackContextValue | undefined>(undefined);

// ─── Sheet Config (headless mode) ──────────────────────────────────────────

/** Configuration set by headless sheet components via useConfigureSheet */
export interface SheetConfig {
  title?: ReactNode;
  /** Subtitle rendered under the title */
  subtitle?: ReactNode;
  tabs?: SheetTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  /**
   * Custom footer. When provided, overrides the mode-driven auto-footer.
   */
  footer?: ReactNode;
  /** Override body content (e.g. skeleton while loading) */
  body?: ReactNode;
  /**
   * Sheet mode — drives auto-footer when no custom `footer` is set.
   * - `read` with `onEdit` → `[Close] [Edit]`
   * - `edit` with `onSave` → `[Cancel] [Save]`
   */
  mode?: SheetMode;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  editLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  closeLabel?: string;
  saveDisabled?: boolean;
  saveLoading?: boolean;
  /**
   * Optional left-aligned ancillary action rendered in the auto-footer
   * alongside the mode-driven primary actions. Suppressed in edit mode.
   * Ignored when a custom `footer` is supplied.
   */
  secondaryAction?: SheetSecondaryAction;
}

interface SheetConfigContextValue {
  config: SheetConfig;
  setConfig: (config: SheetConfig) => void;
}

const SheetConfigContext = createContext<SheetConfigContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────

let frameCounter = 0;
function nextKey(type: string): string {
  return `${type}-${++frameCounter}`;
}

export interface SheetStackProviderProps {
  children: ReactNode;
}

/**
 * SheetStackProvider — manages a navigation stack of sheet frames.
 *
 * Wrap your app (or auth layout) with this provider.
 * Use `useSheetStack()` to open/push/pop sheets from any component.
 *
 * The provider owns the stack state. A companion `SheetStackRenderer`
 * reads this context and renders the active frame inside a BDS `<Sheet>`.
 */
export function SheetStackProvider({ children }: SheetStackProviderProps) {
  const [stack, setStack] = useState<SheetFrame[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>({});

  const clearExitTimer = useCallback(() => {
    if (exitTimer.current) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  }, []);

  const openSheet = useCallback((
    type: string,
    props: Record<string, unknown>,
    opts?: { variant?: SheetVariant; title?: string },
  ) => {
    clearExitTimer();
    setIsExiting(false);
    setDirection('forward');
    setSheetConfig({});
    setStack([{
      key: nextKey(type),
      type,
      props,
      variant: opts?.variant ?? 'floating',
      title: opts?.title,
    }]);
  }, [clearExitTimer]);

  const pushSheet = useCallback((
    type: string,
    props: Record<string, unknown>,
    opts?: { variant?: SheetVariant; title?: string },
  ) => {
    clearExitTimer();
    setIsExiting(false);
    setDirection('forward');
    setSheetConfig({});
    setStack((prev) => [...prev, {
      key: nextKey(type),
      type,
      props,
      variant: opts?.variant ?? 'floating',
      title: opts?.title,
    }]);
  }, [clearExitTimer]);

  const back = useCallback(() => {
    if (stack.length <= 1) {
      // Last frame — close the sheet
      setStack([]);
      return;
    }
    // Animate out, then pop
    setDirection('back');
    setIsExiting(true);
    clearExitTimer();
    exitTimer.current = setTimeout(() => {
      setIsExiting(false);
      setSheetConfig({});
      setStack((prev) => prev.slice(0, -1));
    }, 150);
  }, [stack.length, clearExitTimer]);

  const closeAll = useCallback(() => {
    clearExitTimer();
    setIsExiting(false);
    setStack([]);
  }, [clearExitTimer]);

  const value: SheetStackContextValue = {
    stack,
    isOpen: stack.length > 0,
    isExiting,
    direction,
    openSheet,
    pushSheet,
    back,
    closeAll,
  };

  const configValue: SheetConfigContextValue = { config: sheetConfig, setConfig: setSheetConfig };

  return (
    <SheetStackContext.Provider value={value}>
      <SheetConfigContext.Provider value={configValue}>
        {children}
      </SheetConfigContext.Provider>
    </SheetStackContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * useSheetStack — access the global sheet navigation stack.
 *
 * @throws Error if used outside of SheetStackProvider
 *
 * @example
 * ```tsx
 * const { openSheet, pushSheet, back } = useSheetStack();
 *
 * // Open a request from a notification
 * openSheet('request', { id: 'abc123' });
 *
 * // Drill into a vendor from inside a request sheet
 * pushSheet('vendor', { id: req.vendor_id });
 *
 * // Go back to the request
 * back();
 * ```
 */
export function useSheetStack(): SheetStackContextValue {
  const context = useContext(SheetStackContext);
  if (context === undefined) {
    throw new Error('useSheetStack must be used within a SheetStackProvider');
  }
  return context;
}

/**
 * useConfigureSheet — headless mode hook for sheet view components.
 *
 * Call from a useLayoutEffect to push title, tabs, footer, etc. up to the
 * SheetStackRenderer without rendering your own `<Sheet>`.
 *
 * @returns setter function that accepts a SheetConfig object
 *
 * @example
 * ```tsx
 * const configureSheet = useConfigureSheet();
 *
 * useLayoutEffect(() => {
 *   configureSheet({ title: user.name, tabs: myTabs, footer: <SaveButton /> });
 * }, [user, configureSheet]);
 *
 * return null; // headless — renderer owns the Sheet chrome
 * ```
 */
export function useConfigureSheet(): (config: SheetConfig) => void {
  const context = useContext(SheetConfigContext);
  if (context === undefined) {
    throw new Error('useConfigureSheet must be used within a SheetStackProvider');
  }
  return context.setConfig;
}

/**
 * useSheetConfig — read the current sheet configuration (used by SheetStackRenderer).
 * @internal
 */
export function useSheetConfig(): SheetConfig {
  const context = useContext(SheetConfigContext);
  return context?.config ?? {};
}

export default SheetStackProvider;
