import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './ButtonGroup.css';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `Button` (or `IconButton`) elements to group. */
  children: ReactNode;
  /** Stack direction. Default `horizontal`. */
  orientation?: ButtonGroupOrientation;
  /** When true, buttons stretch to fill the container equally */
  fullWidth?: boolean;
}

/**
 * ButtonGroup — groups related Button components together.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="primary">Save</Button>
 *   <Button variant="ghost">Cancel</Button>
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  fullWidth = false,
  className,
  ...props
}: ButtonGroupProps) {
  const classes = bdsClass(
    'bds-button-group',
    orientation === 'vertical' && 'bds-button-group--vertical',
    fullWidth && 'bds-button-group--full-width',
    className
  );

  return (
    <div className={classes} role="group" {...props}>
      {children}
    </div>
  );
}

export default ButtonGroup;
