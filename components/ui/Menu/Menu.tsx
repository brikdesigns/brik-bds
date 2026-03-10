import {
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { bdsClass } from '../../utils';

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
 * Panel styles — floating dropdown container
 *
 * Token reference:
 * - --background-primary (white background)
 * - --border-radius-lg = 8px (corners)
 * - --padding-md = 16px (panel padding)
 * - --gap-md = 8px (item gap)
 */
const panelStyles: CSSProperties = {
  position: 'absolute',
  zIndex: 100,
  backgroundColor: 'var(--background-primary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--padding-md)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)', // bds-lint-ignore — shadow tokens resolve to zero
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
  minWidth: '200px',
};

/**
 * Menu item button styles
 *
 * Token reference:
 * - --gap-md = 8px (icon-text gap)
 * - --font-family-body (body font)
 * - --body-md = 16px
 * - --font-line-height-normal
 * - --text-primary
 */
const itemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-md)',
  padding: 'var(--padding-tiny)',
  background: 'none',
  border: 'none',
  borderRadius: 'var(--border-radius-sm)',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  textTransform: 'capitalize' as const,
};

/**
 * Active item styles
 *
 * Token reference:
 * - --surface-secondary (active background)
 */
const activeItemStyles: CSSProperties = {
  ...itemStyles,
  backgroundColor: 'var(--surface-secondary)',
};

/**
 * Disabled item styles
 */
const disabledItemStyles: CSSProperties = {
  ...itemStyles,
  opacity: 0.5,
  cursor: 'not-allowed',
};

/**
 * Icon wrapper styles
 *
 * Token reference:
 * - --icon-lg = 18px (icon size)
 * - --text-primary
 */
const iconWrapperStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px', // bds-lint-ignore — icon wrapper touch target
  height: '24px', // bds-lint-ignore
  fontSize: 'var(--icon-lg)',
  color: 'var(--text-primary)',
  flexShrink: 0,
};

/**
 * MenuItem - Single menu option (exported for direct use)
 */
export function MenuItem({ item, isActive, className, style, ...props }: MenuItemProps) {
  const baseStyle = item.disabled
    ? disabledItemStyles
    : isActive
      ? activeItemStyles
      : itemStyles;

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={item.onClick}
      className={bdsClass('bds-menu-item', isActive && 'bds-menu-item-active', item.disabled && 'bds-menu-item-disabled', className)}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {item.icon && <span style={iconWrapperStyles}>{item.icon}</span>}
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
 *       { id: '1', label: 'Edit', icon: <FontAwesomeIcon icon={faPen} /> },
 *       { id: '2', label: 'Delete', icon: <FontAwesomeIcon icon={faTrash} /> },
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

  const combinedStyles: CSSProperties = {
    ...panelStyles,
    ...style,
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      className={bdsClass('bds-menu', className)}
      style={combinedStyles}
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
