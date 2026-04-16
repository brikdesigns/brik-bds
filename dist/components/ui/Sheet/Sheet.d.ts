import { type ReactNode } from 'react';
import './Sheet.css';
export type SheetSide = 'right' | 'left' | 'bottom';
export interface SheetTab {
    id: string;
    label: string;
    content: ReactNode;
}
export type SheetVariant = 'default' | 'floating';
export type SheetMode = 'read' | 'edit';
export interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    children?: ReactNode;
    side?: SheetSide;
    title?: ReactNode;
    /** Optional subtitle rendered under the title */
    subtitle?: ReactNode;
    /** Width for left/right sheets (default: 400px) */
    width?: string;
    /**
     * Visual variant:
     * - `default` — full-height overlay with backdrop (forms, edit workflows)
     * - `floating` — rounded floating panel with elevation, no backdrop (read-only detail views)
     */
    variant?: SheetVariant;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    /**
     * When set, renders a back button in the header for nested sheet navigation.
     */
    onBack?: () => void;
    /**
     * Sheet mode. When set, the footer auto-renders mode-appropriate actions
     * unless a custom `footer` is provided.
     * - `read` with `onEdit` → renders `[Close] [Edit]` (primary Edit)
     * - `edit` → renders `[Cancel] [Save]` (primary Save)
     */
    mode?: SheetMode;
    /** Triggered from the primary action in read mode (switch to edit) */
    onEdit?: () => void;
    /** Triggered from the primary action in edit mode (commit changes) */
    onSave?: () => void;
    /** Triggered from the secondary action in edit mode. Falls back to `onClose`. */
    onCancel?: () => void;
    editLabel?: string;
    saveLabel?: string;
    cancelLabel?: string;
    closeLabel?: string;
    /** Disable the save button (e.g. while form is invalid) */
    saveDisabled?: boolean;
    /** Show loading state on the save button */
    saveLoading?: boolean;
    /**
     * Custom footer. When provided, overrides mode-driven auto-footer.
     * Use this for non-standard action sets.
     */
    footer?: ReactNode;
    /** Optional tabs rendered below the header. When provided, children is ignored. */
    tabs?: SheetTab[];
    /** Controlled active tab id (defaults to first tab) */
    activeTab?: string;
    /** Called when a tab is selected */
    onTabChange?: (tabId: string) => void;
}
/**
 * Sheet — sliding panel overlay for contextual content.
 *
 * Read / edit mode: pass `mode="read"` with `onEdit` for a view-only sheet that
 * exposes a primary Edit action in the footer. Pass `mode="edit"` with `onSave`
 * to switch into form state with Cancel / Save actions. Custom `footer` always
 * wins when supplied.
 */
export declare function Sheet({ isOpen, onClose, children, side, title, subtitle, width, variant, closeOnBackdrop, closeOnEscape, showCloseButton, onBack, mode, onEdit, onSave, onCancel, editLabel, saveLabel, cancelLabel, closeLabel, saveDisabled, saveLoading, footer, tabs, activeTab: controlledTab, onTabChange, }: SheetProps): import("react").ReactPortal | null;
export default Sheet;
