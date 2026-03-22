import { type HTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { Button } from '../Button';
import type { ButtonProps } from '../Button';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Heading text */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional button props — renders a primary Button when provided */
  buttonProps?: Pick<ButtonProps, 'children' | 'onClick' | 'href' | 'asLink' | 'iconBefore' | 'iconAfter'>;
  /** Optional custom content below the text (replaces button) */
  children?: ReactNode;
}

const containerStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--gap-xl)',
  padding: 'var(--padding-xl)',
  backgroundColor: 'var(--surface-secondary)',
  border: 'var(--border-width-sm) solid var(--border-secondary)',
  borderRadius: 'var(--border-radius-lg)',
  overflow: 'hidden',
  width: '100%',
  boxSizing: 'border-box' as const,
  minHeight: '240px',
};

const textWrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--gap-sm)',
  width: '100%',
};

const titleStyles: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-md)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-primary)',
  margin: 0,
  textAlign: 'center',
};

const descriptionStyles: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  margin: 0,
  textAlign: 'center',
};

/**
 * EmptyState — Feedback component for empty content areas
 *
 * Displays a centered title, optional description, and optional
 * action button within a bordered surface container. Used when
 * a section or page has no content to display yet.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   buttonProps={{ children: 'Create Project', onClick: () => {} }}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  buttonProps,
  children,
  className = '',
  style,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={bdsClass('bds-empty-state', className)}
      style={{ ...containerStyles, ...style }}
      {...props}
    >
      <div style={textWrapperStyles}>
        <h2 style={titleStyles}>{title}</h2>
        {description && <p style={descriptionStyles}>{description}</p>}
      </div>
      {buttonProps && !children && (
        <Button variant="primary" size="sm" {...buttonProps} />
      )}
      {children}
    </div>
  );
}

export default EmptyState;
