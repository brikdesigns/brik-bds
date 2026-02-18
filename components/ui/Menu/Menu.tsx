import {
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  useRef,
  useEffect,
  useCallback,
} from 'react';

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
 * - --_color---background--primary (white background)
 * - --_border-radius---lg = 8px (corners)
 * - --_space---xl = 24px (padding)
 * - --_space---gap--md = 8px (item gap)
 */
const panelStyles: CSSProperties = {
  position: 'absolute',
  zIndex: 100,
  backgroundColor: 'var(--_color---background--primary)',
  borderRadius: 'var(--_border-radius---lg)',
  padding: 'var(--_space---xl)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
  minWidth: '200px',
};

/**
 * Menu item button styles
 *
 * Token reference:
 * - --_space---gap--md = 8px (icon-text gap)
 * - --_typography---font-family--body (body font)
 * - --_typography---body--md-base = 16px
 * - --font-line-height--150
 * - --_color---text--primary
 */
const itemStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  padding: 'var(--_space---gap--md)',
  background: 'none',
  border: 'none',
  borderRadius: 'var(--_border-radius---sm)',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
};

/**
 * Active item styles
 *
 * Token reference:
 * - --_color---surface--secondary (active background)
 */
const activeItemStyles: CSSProperties = {
  ...itemStyles,
  backgroundColor: 'var(--_color---surface--secondary)',
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
 * - --_typography---icon--large = 18px (icon size)
 * - --_color---text--primary
 */
const iconWrapperStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  fontSize: 'var(--_typography---icon--large)',
  color: 'var(--_color---text--primary)',
  flexShrink: 0,
};

/**
 * MenuItem - Single menu option (exported for direct use)
 */
export function MenuItem({ item, isActive, style, ...props }: MenuItemProps) {
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
      className={className || undefined}
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
