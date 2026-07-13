import {
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { bdsClass } from '../../utils';
import { Button } from '../Button';
import './EmptyState.css';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Heading text */
  title: string;
  /** Optional description below the title */
  description?: string;
  /**
   * Optional illustration/media rendered above the text. Compose a BDS
   * primitive — canonically an `<Image ratio="…" src="…" />` (or, once the
   * illustration kit ships runtime assets, an illustration node). Omit to
   * hide; presence is the show/hide control.
   */
  media?: ReactNode;
  /** Optional button props — renders a primary `md` Button when provided */
  buttonProps?: {
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    iconBefore?: ReactNode;
    iconAfter?: ReactNode;
  };
  /** Optional custom content below the text (replaces button) */
  children?: ReactNode;
}

/**
 * EmptyState — feedback component for empty content areas
 *
 * Displays an optional centered illustration/media, a title, an optional
 * description, and an optional `md` action button within a bordered surface
 * container. The `media` slot is composed (canonically an `<Image>`); its
 * presence is the show/hide control.
 *
 * @summary Empty/zero-state messaging with optional media + action
 */
export function EmptyState({
  title,
  description,
  media,
  buttonProps,
  children,
  className,
  style,
  ...props
}: EmptyStateProps) {
  return (
    <div className={bdsClass('bds-empty-state', className)} style={style} {...props}>
      {media && <div className="bds-empty-state__media">{media}</div>}
      <div className="bds-empty-state__text">
        <h2 className="bds-empty-state__title">{title}</h2>
        {description && <p className="bds-empty-state__description">{description}</p>}
      </div>
      {buttonProps && !children && (
        <Button variant="primary" size="md" {...buttonProps} />
      )}
      {children}
    </div>
  );
}

export default EmptyState;
