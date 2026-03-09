import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  orientation?: ButtonGroupOrientation;
  /** When true, buttons stretch to fill the container equally */
  fullWidth?: boolean;
}

const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--gap-lg)',
  flexWrap: 'wrap',
  boxSizing: 'border-box',
};

/**
 * ButtonGroup — groups related Button components together.
 *
 * Figma: bds-button-group (node 26567:7542)
 * - Horizontal flex with gap-lg (16px)
 * - Renders Button children side-by-side
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  fullWidth = false,
  className = '',
  style,
  ...props
}: ButtonGroupProps) {
  const combinedStyles: CSSProperties = {
    ...baseStyles,
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    ...(orientation === 'vertical' ? { alignItems: 'stretch' } : {}),
    ...(fullWidth ? { width: '100%' } : {}),
    ...style,
  };

  return (
    <div
      className={bdsClass('bds-button-group', className)}
      role="group"
      style={combinedStyles}
      {...props}
    >
      {children}
    </div>
  );
}

export default ButtonGroup;
