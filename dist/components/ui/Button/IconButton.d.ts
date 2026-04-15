import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';
/** IconButton props — label is required for accessibility */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /** Visual style variant */
    variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'inverse' | 'danger' | 'danger-outline' | 'danger-ghost' | 'destructive' | 'positive' | 'selected';
    /** Size of the button */
    size?: 'tiny' | 'sm' | 'md' | 'lg' | 'xl';
    /** The icon to render (ReactNode — SVG, FontAwesome, Lucide, etc.) */
    icon: ReactNode;
    /** Accessible label — required, announced by screen readers */
    label: string;
    /** Loading state — shows spinner and disables interaction */
    loading?: boolean;
}
/**
 * IconButton — icon-only button with required accessible label
 *
 * Use this for actions represented by an icon alone (close, edit, delete, etc.).
 * The `label` prop is required and maps to `aria-label`.
 *
 * @example
 * ```tsx
 * <IconButton icon={<CloseIcon />} label="Close dialog" variant="ghost" />
 * <IconButton icon={<TrashIcon />} label="Delete item" variant="danger-ghost" />
 * <IconButton icon={<EditIcon />} label="Edit" variant="secondary" size="sm" />
 * ```
 */
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export default IconButton;
