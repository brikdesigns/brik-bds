import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './ButtonGroup.css';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';
export type ButtonGroupVariant = 'spaced' | 'segmented';
export type ButtonGroupAlign = 'start' | 'center' | 'end' | 'between';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `Button` (or `IconButton`) elements to group. */
  children: ReactNode;
  /**
   * Layout treatment.
   * - `spaced` (default) — buttons separated by a gap; standard action-set look
   * - `segmented` — buttons share borders into a single toolbar unit (no gap, rounded ends only)
   */
  variant?: ButtonGroupVariant;
  /** Stack direction. Default `horizontal`. */
  orientation?: ButtonGroupOrientation;
  /**
   * Horizontal alignment of the group's children when not `fullWidth`.
   * Replaces the prior `ActionBar` pattern's manual `justify-content`.
   * - `start` (default) — left-aligned
   * - `center` — centered
   * - `end` — right-aligned
   * - `between` — first child left, last child right (`justify-content: space-between`)
   */
  align?: ButtonGroupAlign;
  /** When true, buttons stretch to fill the container equally */
  fullWidth?: boolean;
}

/**
 * ButtonGroup — groups related Button components together.
 *
 * Two layout treatments via `variant`: `spaced` (default — gap between
 * buttons) and `segmented` (shared borders, toolbar look). Use `align`
 * to place the group at start / center / end / between within its
 * container — this replaces the prior manual `ActionBar` flex pattern.
 *
 * @example
 * ```tsx
 * // Default form-footer action set
 * <ButtonGroup>
 *   <Button variant="primary">Save</Button>
 *   <Button variant="ghost">Cancel</Button>
 * </ButtonGroup>
 *
 * // Segmented toolbar
 * <ButtonGroup variant="segmented">
 *   <Button variant="secondary">Day</Button>
 *   <Button variant="secondary">Week</Button>
 *   <Button variant="secondary">Month</Button>
 * </ButtonGroup>
 *
 * // ActionBar replacement (discard left, primary right)
 * <ButtonGroup align="between">
 *   <Button variant="destructive">Discard</Button>
 *   <Button variant="primary">Continue</Button>
 * </ButtonGroup>
 * ```
 *
 * @summary Group related Buttons (variant + orientation + align)
 */
export function ButtonGroup({
  children,
  variant = 'spaced',
  orientation = 'horizontal',
  align = 'start',
  fullWidth = false,
  className,
  ...props
}: ButtonGroupProps) {
  const classes = bdsClass(
    'bds-button-group',
    `bds-button-group--${variant}`,
    orientation === 'vertical' && 'bds-button-group--vertical',
    `bds-button-group--align-${align}`,
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
