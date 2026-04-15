import { type HTMLAttributes, type ReactNode } from 'react';
import './ButtonGroup.css';
export type ButtonGroupOrientation = 'horizontal' | 'vertical';
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
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
export declare function ButtonGroup({ children, orientation, fullWidth, className, ...props }: ButtonGroupProps): import("react/jsx-runtime").JSX.Element;
export default ButtonGroup;
