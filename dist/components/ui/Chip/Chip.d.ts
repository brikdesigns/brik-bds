import { type HTMLAttributes, type ReactNode } from 'react';
import './Chip.css';
export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipVariant = 'primary' | 'secondary';
export type ChipAppearance = 'dark' | 'light' | 'solid';
export interface ChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Chip label text */
    label: string;
    /** Size variant */
    size?: ChipSize;
    /** Color variant */
    variant?: ChipVariant;
    /** Filled (dark) or outlined (light) appearance */
    appearance?: ChipAppearance;
    /** Optional leading icon */
    icon?: ReactNode;
    /** Optional avatar element (rendered before label) */
    avatar?: ReactNode;
    /** Show dropdown caret */
    showDropdown?: boolean;
    /** Removable chip — shows X button */
    onRemove?: () => void;
    /** Click handler for the chip body */
    onChipClick?: () => void;
    /** Disabled state */
    disabled?: boolean;
}
/**
 * Chip — compact interactive element for filtering, selection, or input
 *
 * Pill-shaped with two variants (primary/secondary) and two appearances (dark/light).
 *
 * @example
 * ```tsx
 * <Chip label="Category" />
 * <Chip label="Selected" variant="primary" appearance="dark" />
 * <Chip label="Removable" onRemove={() => {}} />
 * ```
 */
export declare function Chip({ label, size, variant, appearance, icon, avatar, showDropdown, onRemove, onChipClick, disabled, className, style, ...props }: ChipProps): import("react/jsx-runtime").JSX.Element;
export default Chip;
