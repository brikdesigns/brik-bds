import { type ReactNode, type CSSProperties, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { bdsClass } from '../../utils';

/**
 * Snackbar position
 */
export type SnackbarPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Snackbar variant
 */
export type SnackbarVariant = 'default' | 'success' | 'error' | 'warning';

/**
 * Snackbar component props
 */
export interface SnackbarProps {
  /** Whether the snackbar is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Message text */
  message: ReactNode;
  /** Optional action element (button/link) */
  action?: ReactNode;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Screen position */
  position?: SnackbarPosition;
  /** Visual variant */
  variant?: SnackbarVariant;
}

/**
 * Variant styles
 *
 * Token reference:
 * - default: dark bg, inverse text (matches Toast)
 * - success: --color-system-green
 * - error: --color-system-red
 * - warning: --color-system-orange
 */
const variantStyles: Record<SnackbarVariant, CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-grayscale-black, black)',
    color: 'var(--text-inverse)',
  },
  success: {
    backgroundColor: 'var(--color-system-green)',
    color: 'var(--text-on-color-dark)',
  },
  error: {
    backgroundColor: 'var(--color-system-red)',
    color: 'var(--text-on-color-dark)',
  },
  warning: {
    backgroundColor: 'var(--color-system-orange)',
    color: 'var(--text-on-color-light)',
  },
};

/**
 * Position styles
 */
const positionStyles: Record<SnackbarPosition, CSSProperties> = {
  top: { top: 'var(--padding-lg)', left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: 'var(--padding-lg)', left: '50%', transform: 'translateX(-50%)' },
  'top-left': { top: 'var(--padding-lg)', left: 'var(--padding-lg)' },
  'top-right': { top: 'var(--padding-lg)', right: 'var(--padding-lg)' },
  'bottom-left': { bottom: 'var(--padding-lg)', left: 'var(--padding-lg)' },
  'bottom-right': { bottom: 'var(--padding-lg)', right: 'var(--padding-lg)' },
};

/**
 * Snackbar container styles
 *
 * Token reference:
 * - --padding-md = 16px (vertical), --padding-lg = 24px (horizontal)
 * - --border-radius-lg = 8px
 * - --gap-lg = 16px (gap between message and action)
 */
const snackbarStyles: CSSProperties = {
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-lg)',
  padding: 'var(--padding-md) var(--padding-lg)',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)', // bds-lint-ignore — shadow tokens resolve to zero
  zIndex: 1100,
  maxWidth: 560,
  minWidth: 280,
  boxSizing: 'border-box',
};

/**
 * Message text styles
 *
 * Token reference:
 * - --font-family-body
 * - --body-sm = 14px
 * - --font-weight-regular = 400
 */
const messageStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  flex: 1,
  margin: 0,
};

/**
 * Close button styles
 */
const closeButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  padding: 'var(--gap-sm)',
  fontSize: 'var(--body-md)',
  lineHeight: 'var(--font-line-height-tight)',
  opacity: 0.7,
  flexShrink: 0,
};

/**
 * Snackbar - BDS temporary notification at screen edge
 *
 * A brief, non-blocking notification that appears at a screen edge
 * and auto-dismisses. Supports variants for success/error/warning
 * and configurable position.
 *
 * @example
 * ```tsx
 * <Snackbar
 *   isOpen={showSnackbar}
 *   onClose={() => setShowSnackbar(false)}
 *   message="Changes saved successfully"
 *   variant="success"
 *   duration={3000}
 * />
 * ```
 */
export function Snackbar({
  isOpen,
  onClose,
  message,
  action,
  duration = 4000,
  position = 'bottom',
  variant = 'default',
}: SnackbarProps) {
  // Auto-dismiss
  useEffect(() => {
    if (!isOpen || duration === 0) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const snackbar = (
    <div
      className={bdsClass('bds-snackbar')}
      role="status"
      aria-live="polite"
      style={{
        ...snackbarStyles,
        ...variantStyles[variant],
        ...positionStyles[position],
      }}
    >
      <span style={messageStyles}>{message}</span>
      {action}
      <button
        type="button"
        onClick={onClose}
        style={closeButtonStyles}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );

  return createPortal(snackbar, document.body);
}

export default Snackbar;
