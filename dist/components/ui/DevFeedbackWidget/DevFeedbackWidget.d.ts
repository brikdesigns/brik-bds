/** Single source of truth for DevBar types. Portal's BrikDevBar loader
 *  imports these rather than redeclaring, to avoid global Window collisions. */
export interface DevBarSlotDef {
    id: string;
    label: string;
    icon: string;
    order?: number;
    badge?: string | number | null;
    onActivate?: (api: DevBarApi) => void;
    onDeactivate?: (api: DevBarApi) => void;
}
export interface DevBarApi {
    register: (def: DevBarSlotDef) => DevBarApi;
    unregister: (id: string) => void;
    setBadge: (id: string, value: string | number | null) => void;
    setActive: (id: string, active: boolean) => void;
    isRegistered: (id: string) => boolean;
    getBarRect: () => DOMRect | null;
    getSlotRect: (id: string) => DOMRect | null;
}
declare global {
    interface Window {
        BrikDevBar?: DevBarApi;
        BrikDevBarQueue?: DevBarSlotDef[];
    }
}
export interface DevFeedbackWidgetProps {
    /** POST endpoint for feedback submissions. */
    endpoint?: string;
    /** Label shown before the context value (e.g. "Page", "Story"). */
    contextLabel?: string;
    /** Returns the current context string (e.g. pathname or story name). */
    getContextValue?: () => string;
    /** Standalone FAB position when DevBar is not present. */
    fabPosition?: {
        bottom?: string;
        left?: string;
        right?: string;
    };
    /** Additional payload fields sent with every submission. */
    extraPayload?: Record<string, unknown>;
}
export declare function DevFeedbackWidget({ endpoint, contextLabel, getContextValue, fabPosition, extraPayload, }?: DevFeedbackWidgetProps): import("react/jsx-runtime").JSX.Element;
