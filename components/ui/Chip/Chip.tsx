import { type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CaretDownBold, X } from '../../icons';
import { bdsClass } from '../../utils';
import './Chip.css';

export type ChipSize = 'sm' | 'md' | 'lg';

/** Chip hierarchy variant — how much attention the chip commands in a cluster. */
export type ChipVariant = 'primary' | 'secondary';

export interface ChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Chip label text */
  label: string;
  /** Size variant */
  size?: ChipSize;
  /** Hierarchy variant — primary (emphasized) or secondary (neutral). */
  variant?: ChipVariant;
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
 * Pill-shaped with a single hierarchy axis (`primary` / `secondary`).
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
 * <Chip label="Selected" variant="primary" onChipClick={toggle} />
 * ```
 *
 * @summary Compact interactive pill for filtering or selection
 */
export function Chip({
  label,
  size = 'md',
  variant = 'secondary',
  icon,
  avatar,
  showDropdown = false,
  onRemove,
  onChipClick,
  disabled = false,
  className,
  style,
  ...props
}: ChipProps) {
  const classes = bdsClass(
    'bds-chip',
    `bds-chip--${variant}`,
    `bds-chip--${size}`,
    disabled && 'bds-chip--disabled',
    className
  );

  const handleClick = () => {
    if (!disabled && onChipClick) onChipClick();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onRemove) onRemove();
  };

  return (
    <div
      className={classes}
      style={style}
      role={onChipClick ? 'button' : undefined}
      tabIndex={onChipClick && !disabled ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      {...props}
    >
      {avatar && <span className="bds-chip__avatar bds-chip__icon">{avatar}</span>}
      {icon && <span className="bds-chip__icon">{icon}</span>}
      <span className="bds-chip__label">{label}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className="bds-chip__remove bds-chip__icon"
          aria-label="Remove"
        >
          <Icon icon={X} />
        </button>
      )}
      {showDropdown && (
        <span className="bds-chip__icon">
          <Icon icon={CaretDownBold} />
        </span>
      )}
    </div>
  );
}

export default Chip;
