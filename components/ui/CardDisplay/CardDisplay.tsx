import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './CardDisplay.css';

export interface CardDisplayProps extends HTMLAttributes<HTMLDivElement> {
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  action?: ReactNode;
  href?: string;
}

/**
 * CardDisplay — content display card with image, badge, title, description, and action.
 */
export function CardDisplay({
  imageSrc,
  imageAlt = '',
  title,
  description,
  badge,
  action,
  href,
  className,
  style,
  ...props
}: CardDisplayProps) {
  const classes = bdsClass('bds-card-display', href && 'bds-card-display--link', className);

  const content = (
    <>
      {imageSrc && (
        <div className="bds-card-display__image-container">
          <img src={imageSrc} alt={imageAlt} className="bds-card-display__image" />
        </div>
      )}
      <div className="bds-card-display__content">
        {badge && <div>{badge}</div>}
        <h3 className="bds-card-display__title">{title}</h3>
        {description && <p className="bds-card-display__description">{description}</p>}
        {action && <div className="bds-card-display__action">{action}</div>}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} style={style} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  return (
    <div className={classes} style={style} {...props}>
      {content}
    </div>
  );
}

export default CardDisplay;
