import { type ReactNode } from 'react';
import './Sheet.css';
export type SheetSide = 'right' | 'left' | 'bottom';
export interface SheetTab {
    id: string;
    label: string;
    content: ReactNode;
}
export type SheetVariant = 'default' | 'floating';
export interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    children?: ReactNode;
    side?: SheetSide;
    title?: ReactNode;
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
    /** Optional footer pinned to bottom of sheet */
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
 * Width is a runtime value passed via inline style since it's user-configurable.
 * Close icon matches Modal dismiss treatment (FontAwesome xmark).
 *
 * Tab variant: pass `tabs` array to render a tab bar below the header.
 * Each tab's content replaces `children` in the body area.
 */
export declare function Sheet({ isOpen, onClose, children, side, title, width, variant, closeOnBackdrop, closeOnEscape, showCloseButton, footer, tabs, activeTab: controlledTab, onTabChange, }: SheetProps): import("react").ReactPortal | null;
export default Sheet;
