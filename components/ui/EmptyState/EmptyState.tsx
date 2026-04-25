import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { Button } from '../Button';
import type { ButtonProps } from '../Button';
import './EmptyState.css';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Heading text */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional button props — renders a primary Button when provided */
  buttonProps?: Pick<ButtonProps, 'children' | 'onClick' | 'iconBefore' | 'iconAfter'>;
  /** Optional custom content below the text (replaces button) */
  children?: ReactNode;
}

/**
 * EmptyState — feedback component for empty content areas
 *
 * Displays a centered title, optional description, and optional
 * action button within a bordered surface container.
 *
 * @summary Empty/zero-state messaging with optional action
 */
export function EmptyState({
  title,
  description,
  buttonProps,
  children,
  className,
  style,
  ...props
}: EmptyStateProps) {
  return (
    <div className={bdsClass('bds-empty-state', className)} style={style} {...props}>
      <div className="bds-empty-state__text">
        <h2 className="bds-empty-state__title">{title}</h2>
        {description && <p className="bds-empty-state__description">{description}</p>}
      </div>
      {buttonProps && !children && (
        <Button variant="primary" size="sm" {...buttonProps} />
      )}
      {children}
    </div>
  );
}

export default EmptyState;
