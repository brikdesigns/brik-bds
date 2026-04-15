import { type HTMLAttributes, type ReactNode } from 'react';
import './Menu.css';
/**
 * MenuItem data shape
 */
export interface MenuItemData {
    /** Unique identifier */
    id: string;
    /** Display label */
    label: string;
    /** Optional icon before the label */
    icon?: ReactNode;
    /** Disabled state */
    disabled?: boolean;
    /** Click handler */
    onClick?: () => void;
}
/**
 * Menu component props
 */
export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Menu items to display */
    items: MenuItemData[];
    /** Whether the menu is visible */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Currently active/selected item ID */
    activeId?: string;
}
/**
 * MenuItem component props (internal)
 */
export interface MenuItemProps extends HTMLAttributes<HTMLButtonElement> {
    /** Item data */
    item: MenuItemData;
    /** Whether this item is active */
    isActive?: boolean;
}
/**
 * MenuItem - Single menu option (exported for direct use)
 */
export declare function MenuItem({ item, isActive, className, style, ...props }: MenuItemProps): import("react/jsx-runtime").JSX.Element;
/**
 * Menu - BDS dropdown menu component
 *
 * A floating panel containing a list of selectable items with optional icons.
 * Closes on outside click or Escape key. Use alongside a trigger element
 * (Button, IconButton, etc.) in a relatively positioned wrapper.
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative' }}>
 *   <Button onClick={() => setOpen(!open)}>Options</Button>
 *   <Menu
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     items={[
 *       { id: '1', label: 'Edit', icon: <Icon icon="ph:pencil" /> },
 *       { id: '2', label: 'Delete', icon: <Icon icon="ph:trash" /> },
 *     ]}
 *   />
 * </div>
 * ```
 */
export declare function Menu({ items, isOpen, onClose, activeId, className, style, ...props }: MenuProps): import("react/jsx-runtime").JSX.Element | null;
export default Menu;
