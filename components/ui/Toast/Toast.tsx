import { type ReactNode, type HTMLAttributes } from 'react';
import { Icon } from '../Icon';
import { CheckCircle, WarningCircle, Warning, Info } from '../../icons';
import { bdsClass } from '../../utils';
import { Badge } from '../Badge';
import { CloseButton } from '../CloseButton';
import './Toast.css';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type ToastUrgency = 'polite' | 'assertive';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text below the title */
  description?: ReactNode;
  /** Visual variant — renders a colored Badge icon; surface stays neutral */
  variant?: ToastVariant;
  /**
   * How insistently a screen reader announces the toast.
   *
   * `polite` (default) waits for a pause in speech — correct for the
   * confirmations and status updates most toasts carry. `assertive`
   * interrupts whatever is being spoken, so reserve it for messages the
   * user must act on immediately (data loss, session expiry).
   *
   * Note this is independent of `variant`: an `error` toast reporting a
   * failed autosave retry is still `polite`.
   */
  urgency?: ToastUrgency;
  /** Called when the close button is clicked */
  onDismiss?: () => void;
}

const variantBadge: Record<Exclude<ToastVariant, 'default'>, { status: 'positive' | 'error' | 'warning' | 'info'; icon: string }> = {
  success: { status: 'positive', icon: CheckCircle },
  error: { status: 'error', icon: WarningCircle },
  warning: { status: 'warning', icon: Warning },
  info: { status: 'info', icon: Info },
};

/**
 * Toast — white surface notification with optional colored Badge
 *
 * The surface NEVER changes color — only the badge communicates
 * success, error, warning, or info status.
 *
 * Announces politely by default. Pass `urgency="assertive"` to interrupt.
 *
 * @summary White-surface notification with optional Badge
 */
export function Toast({
  title,
  description,
  variant = 'default',
  urgency = 'polite',
  onDismiss,
  className,
  style,
  ...props
}: ToastProps) {
  const badge = variant !== 'default' ? variantBadge[variant] : null;
  // `role="alert"` carries an implicit `aria-live="assertive"`, so pairing
  // role with the matching live value keeps the two from disagreeing in
  // browsers that read one and not the other.
  const assertive = urgency === 'assertive';

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      className={bdsClass('bds-toast', className)}
      style={style}
      {...props}
    >
      <div className="bds-toast__content">
        {badge && (
          <Badge
            status={badge.status}
            size="xs"
            icon={<Icon icon={badge.icon} />}
          />
        )}
        <div className="bds-toast__text">
          <span className="bds-toast__title">{title}</span>
          {description && <span className="bds-toast__description">{description}</span>}
        </div>
      </div>
      {onDismiss && (
        <CloseButton label="Dismiss notification" onClick={onDismiss} />
      )}
    </div>
  );
}

export default Toast;
