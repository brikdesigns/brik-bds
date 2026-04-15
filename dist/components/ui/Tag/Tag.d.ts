import { type HTMLAttributes, type ReactNode } from 'react';
import './Tag.css';
/** Tag size variants — shared scale with Badge */
export type TagSize = 'xs' | 'sm' | 'md' | 'lg';
/** Tag component props */
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
    /** Tag label content (optional for xs/icon-only size) */
    children?: ReactNode;
    /** Size variant — xs is icon-only (no text) */
    size?: TagSize;
    /** Optional leading icon (left) — required for xs size */
    icon?: ReactNode;
    /** Optional trailing icon (right) */
    trailingIcon?: ReactNode;
    /** Show dismiss button and callback */
    onRemove?: () => void;
    /** Disabled state */
    disabled?: boolean;
}
/**
 * Tag — categorization label with optional icons and dismiss
 *
 * Sizing scale is shared with Badge for side-by-side alignment.
 *
 * @example
 * ```tsx
 * <Tag>Category</Tag>
 * <Tag size="xs" icon={<Icon />} />
 * <Tag size="lg" icon={<Icon />}>With Icon</Tag>
 * <Tag onRemove={() => handleRemove()}>Removable</Tag>
 * ```
 */
export declare function Tag({ children, size, icon, trailingIcon, onRemove, disabled, className, style, ...props }: TagProps): import("react/jsx-runtime").JSX.Element;
export default Tag;
