import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './CardControl.css';

export type CardControlActionAlign = 'center' | 'top';

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
 * CardControl — settings control card with badge, title, description, and action.
 *
 * Equivalent to `<Card preset="control">` (added in v0.39.0). Both APIs are
 * supported and ship the same layout / visual treatment; pick whichever
 * fits the call site.
 *
 * The earlier deprecation marker (PR #244) was reversed by user decision
 * 2026-04-24 — CardControl stays as a first-class component. The
 * 2026-Q2 audit's recommendation to retire it is logged but not in
 * effect; see docs/audits/2026-Q2-component-bloat-audit.md.
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
