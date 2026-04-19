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
 * Chip — compact interactive pill for filtering, selection, or input.
 *
 * Pill-shaped with two variants (primary/secondary) and two appearances
 * (dark/light).
 *
 * **Action, not indicator.** Chip always represents user-initiated
 * state: filter toggles, selection chips, removable tokens, dropdown
 * triggers. Render a Chip only when `onChipClick`, `onRemove`, or
 * `showDropdown` is wired up. For static status / metadata labels use
 * `Badge` (semantic status) or `Tag` (categorization). See the
 * "Indicators vs Actions" section of Chip.mdx for the full decision
 * tree.
 *
 * @example
 * ```tsx
 * <Chip label="All statuses" showDropdown onChipClick={openMenu} />
 * <Chip label="Status: Active" onRemove={() => removeFilter('status')} />
 * <Chip label="Selected" variant="primary" appearance="dark" onChipClick={toggle} />
 * ```
 */
export declare function Chip({ label, size, variant, appearance, icon, avatar, showDropdown, onRemove, onChipClick, disabled, className, style, ...props }: ChipProps): import("react/jsx-runtime").JSX.Element;
export default Chip;
