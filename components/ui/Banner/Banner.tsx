import { type ReactNode, type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Banner.css';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Bold title text */
  title: ReactNode;
  /** Description text beside the title */
  description?: ReactNode;
  /** Action element (e.g. Button) aligned to the right */
  action?: ReactNode;
  /** Dismissible — shows close button and calls onDismiss */
  onDismiss?: () => void;
}

/**
 * Banner — full-width branded banner for announcements
 *
 * Uses brand-primary surface with inverse text. Ideal for
 * announcements, promotions, or site-wide notices.
 */
export function Banner({
  title,
  description,
  action,
  onDismiss,
  className,
  style,
  ...props
}: BannerProps) {
  return (
    <div role="banner" className={bdsClass('bds-banner', className)} style={style} {...props}>
      <div className="bds-banner__content">
        <span className="bds-banner__title">{title}</span>
        {description && <span className="bds-banner__description">{description}</span>}
      </div>
      {(action || onDismiss) && (
        <div className="bds-banner__actions">
          {action}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss banner"
              className="bds-banner__close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Banner;
