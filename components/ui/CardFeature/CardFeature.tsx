import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './CardFeature.css';

export type CardFeatureAlignment = 'left' | 'center';

export interface CardFeatureProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: CardFeatureAlignment;
}

/**
 * CardFeature — feature showcase card with icon, title, description, and action.
 */
export function CardFeature({
  icon,
  title,
  description,
  action,
  align = 'left',
  className,
  style,
  ...props
}: CardFeatureProps) {
  return (
    <div
      className={bdsClass('bds-card-feature', `bds-card-feature--${align}`, className)}
      style={style}
      {...props}
    >
      {icon && <div className="bds-card-feature__icon">{icon}</div>}
      <div className="bds-card-feature__text">
        <h3 className="bds-card-feature__title">{title}</h3>
        {description && <p className="bds-card-feature__description">{description}</p>}
      </div>
      {action && <div className="bds-card-feature__action">{action}</div>}
    </div>
  );
}

export default CardFeature;
