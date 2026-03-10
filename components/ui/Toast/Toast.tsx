import { type ReactNode, type CSSProperties, type HTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faTriangleExclamation, faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
import { Badge } from '../Badge';

/**
 * Toast variant — controls the status badge, NOT the surface color
 */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

/**
 * Toast component props
 */
export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text below the title */
  description?: ReactNode;
  /** Visual variant — renders a colored Badge icon; surface stays neutral */
  variant?: ToastVariant;
  /** Called when the close button is clicked */
  onDismiss?: () => void;
}

/**
 * Badge mapping per variant
 *
 * Maps toast variants to Badge status + FA icon. The badge is a 24px
 * icon-only square (size="xs") that communicates status through color,
 * keeping the toast surface neutral white.
 */
const variantBadge: Record<Exclude<ToastVariant, 'default'>, { status: 'positive' | 'error' | 'warning' | 'info'; icon: typeof faCircleCheck }> = {
  success: { status: 'positive', icon: faCircleCheck },
  error: { status: 'error', icon: faCircleExclamation },
  warning: { status: 'warning', icon: faTriangleExclamation },
  info: { status: 'info', icon: faCircleInfo },
};

/**
 * Toast container — always white surface per Figma bds-toast
 *
 * Token reference:
 * - surface: --surface-primary (white, theme-aware)
 * - border: --border-width-lg (1px) solid --border-primary
 * - radius: --border-radius-lg = border-radius--200 = 8px
 * - shadow: Figma "shadow-subtle" = 0px 4px 12px 4px rgba(0,0,0,0.24)
 * - padding: --padding-lg (24px in Base mode)
 */
const toastStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  backgroundColor: 'var(--surface-primary)',
  border: 'var(--border-width-lg) solid var(--border-primary)',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: '0px 4px 12px 4px rgba(0, 0, 0, 0.24)', // bds-lint-ignore — Figma shadow-subtle
  padding: 'var(--padding-lg)',
  width: '100%',
  maxWidth: 600,
  boxSizing: 'border-box',
};

/**
 * Content wrapper — badge + text group
 *
 * Token reference:
 * - gap: --gap-md = space--200 = 8px
 */
const contentWrapperStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--gap-md)',
  flex: 1,
  minWidth: 0,
};

/**
 * Text wrapper — title + description stacked
 *
 * Token reference:
 * - gap: --gap-sm = space--150 = 6px
 */
const textWrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-sm)',
  alignItems: 'flex-start',
  justifyContent: 'center',
  minWidth: 0,
};

/**
 * Title text — label/md
 *
 * Token reference:
 * - fontSize: --label-md (16px)
 * - fontWeight: --font-weight-semi-bold (600)
 * - lineHeight: 1.1 (Figma label/md)
 * - color: --text-primary
 */
const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)', // Figma label/md = 1.1, closest token = 100%
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Description text — body/sm
 *
 * Token reference:
 * - fontSize: --body-sm (14px)
 * - fontWeight: --font-weight-regular (400)
 * - lineHeight: --font-line-height-normal (150%)
 * - color: --text-primary
 */
const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  margin: 0,
};

/**
 * Close button — matches Modal dismiss style
 *
 * Token reference:
 * - --icon-md = font-size-200 = 18px (icon size, matches Modal)
 * - --padding-md = 16px (inner padding)
 * - --text-primary (icon color)
 * - opacity 0.6 default, 1 on hover
 */
const closeButtonStyles: CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 'var(--icon-md)',
  lineHeight: 'var(--font-line-height--100)',
  cursor: 'pointer',
  padding: 'var(--padding-md)',
  color: 'var(--text-primary)',
  opacity: 0.6,
  flexShrink: 0,
};

/**
 * Toast - BDS notification component
 *
 * White surface toast with optional colored Badge icon indicating status.
 * The surface NEVER changes color — only the badge communicates success,
 * error, warning, or info status.
 *
 * @example
 * ```tsx
 * <Toast
 *   title="Changes saved"
 *   description="Your settings have been updated"
 *   variant="success"
 *   onDismiss={() => setShowToast(false)}
 * />
 * ```
 */
export function Toast({
  title,
  description,
  variant = 'default',
  onDismiss,
  className,
  style,
  ...props
}: ToastProps) {
  const badge = variant !== 'default' ? variantBadge[variant] : null;

  return (
    <div
      role="alert"
      className={bdsClass('bds-toast', className)}
      style={{ ...toastStyles, ...style }}
      {...props}
    >
      <div style={contentWrapperStyles}>
        {badge && (
          <Badge
            status={badge.status}
            size="xs"
            icon={<FontAwesomeIcon icon={badge.icon} />}
          />
        )}
        <div style={textWrapperStyles}>
          <span style={titleStyles}>{title}</span>
          {description && <span style={descriptionStyles}>{description}</span>}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          style={closeButtonStyles}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
}

export default Toast;
