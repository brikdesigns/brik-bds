import { type ReactNode, type HTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faTriangleExclamation, faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
import { Badge } from '../Badge';
import './Toast.css';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

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

const variantBadge: Record<Exclude<ToastVariant, 'default'>, { status: 'positive' | 'error' | 'warning' | 'info'; icon: typeof faCircleCheck }> = {
  success: { status: 'positive', icon: faCircleCheck },
  error: { status: 'error', icon: faCircleExclamation },
  warning: { status: 'warning', icon: faTriangleExclamation },
  info: { status: 'info', icon: faCircleInfo },
};

/**
 * Toast — white surface notification with optional colored Badge
 *
 * The surface NEVER changes color — only the badge communicates
 * success, error, warning, or info status.
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
    <div role="alert" className={bdsClass('bds-toast', className)} style={style} {...props}>
      <div className="bds-toast__content">
        {badge && (
          <Badge
            status={badge.status}
            size="xs"
            icon={<FontAwesomeIcon icon={badge.icon} />}
          />
        )}
        <div className="bds-toast__text">
          <span className="bds-toast__title">{title}</span>
          {description && <span className="bds-toast__description">{description}</span>}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="bds-toast__close"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
}

export default Toast;
