import {
  type HTMLAttributes,
  type ReactNode,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { bdsClass } from '../../utils';
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
export function MenuItem({ item, isActive, className, style, ...props }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={item.onClick}
      className={bdsClass(
        'bds-menu__item',
        isActive && 'bds-menu__item--active',
        item.disabled && 'bds-menu__item--disabled',
        className,
      )}
      style={style}
      {...props}
    >
      {item.icon && <span className="bds-menu__icon">{item.icon}</span>}
      <span>{item.label}</span>
    </button>
  );
}

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
export function Menu({
  items,
  isOpen,
  onClose,
  activeId,
  className = '',
  style,
  ...props
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleKeyDown, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className={bdsClass('bds-menu', className)}
      style={style}
      {...props}
    >
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          isActive={activeId === item.id}
        />
      ))}
    </div>
  );
}

export default Menu;
