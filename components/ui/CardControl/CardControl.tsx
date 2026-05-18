import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './CardControl.css';

/** @deprecated Use `Card preset="control"` instead — see #657. */
export type CardControlActionAlign = 'center' | 'top';

/** @deprecated Use `Card preset="control"` instead — see #657. */
export interface CardControlProps extends HTMLAttributes<HTMLDivElement> {
  /** Setting / control name shown as the primary text. */
  title: string;
  /** Optional supporting copy displayed below the title. */
  description?: string;
  /** Optional leading element (typically a `Badge` or icon) rendered before the text block. */
  badge?: ReactNode;
  /** Trailing action element (typically a `Switch`, `Button`, or link). */
  action?: ReactNode;
  /** Vertical alignment of the action slot. `top` anchors the CTA to the upper-right corner. */
  actionAlign?: CardControlActionAlign;
}

/**
 * @deprecated Use `<Card preset="control">` instead. `CardControl` is kept
 * during the migration window and will be removed in a future major version
 * once the one consumer (brik-client-portal) migrates (see #657).
 *
 * @summary Settings card — title, description, badge, action
 */
export function CardControl({
  title,
  description,
  badge,
  action,
  actionAlign = 'center',
  className,
  style,
  ...props
}: CardControlProps) {
  return (
    <div
      className={bdsClass(
        'bds-card-control',
        `bds-card-control--action-${actionAlign}`,
        className,
      )}
      style={style}
      {...props}
    >
      <div className="bds-card-control__content">
        {badge}
        <div className="bds-card-control__text">
          <p className="bds-card-control__title">{title}</p>
          {description && <p className="bds-card-control__description">{description}</p>}
        </div>
      </div>
      {action && <div className="bds-card-control__action">{action}</div>}
    </div>
  );
}

export default CardControl;
