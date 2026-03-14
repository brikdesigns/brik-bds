import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './CardControl.css';

export interface CardControlProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: ReactNode;
  action?: ReactNode;
}

/**
 * CardControl — settings control card with badge, title, description, and action.
 */
export function CardControl({
  title,
  description,
  badge,
  action,
  className,
  style,
  ...props
}: CardControlProps) {
  return (
    <div className={bdsClass('bds-card-control', className)} style={style} {...props}>
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
