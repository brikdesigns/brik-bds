import { type ReactNode } from 'react';
import type { SheetVariant, SheetTab, SheetMode, SheetSecondaryAction } from '../ui/Sheet';
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
    openSheet: (type: string, props: Record<string, unknown>, opts?: {
        variant?: SheetVariant;
        title?: string;
    }) => void;
    /** Push a sheet onto the existing stack (for drilling into related records) */
    pushSheet: (type: string, props: Record<string, unknown>, opts?: {
        variant?: SheetVariant;
        title?: string;
    }) => void;
    /** Pop the topmost sheet (animated). If stack becomes empty, sheet closes. */
    back: () => void;
    /** Close the entire stack immediately */
    closeAll: () => void;
}
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
export declare function SheetStackProvider({ children }: SheetStackProviderProps): import("react/jsx-runtime").JSX.Element;
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
export declare function useSheetStack(): SheetStackContextValue;
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
export declare function useConfigureSheet(): (config: SheetConfig) => void;
/**
 * useSheetConfig — read the current sheet configuration (used by SheetStackRenderer).
 * @internal
 */
export declare function useSheetConfig(): SheetConfig;
export default SheetStackProvider;
