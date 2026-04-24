import { type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { CaretDown, X } from '../../icons';
import { bdsClass } from '../../utils';
import './Chip.css';

export type ChipSize = 'sm' | 'md' | 'lg';

/** Chip hierarchy variant — how much attention the chip commands in a cluster. */
export type ChipVariant = 'primary' | 'secondary';

/**
 * Chip fill appearance — shared axis with Badge (`solid | subtle`) and
 * Tag (`solid | subtle`). Chip supports the two filled-vs-outlined values.
 * - `solid`   — filled background, no border.
 * - `outline` — transparent background with a border in the variant color.
 */
export type ChipAppearance = 'solid' | 'outline';

export interface ChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Chip label text */
  label: string;
  /** Size variant */
  size?: ChipSize;
  /** Hierarchy variant — primary (emphasized) or secondary (neutral). */
  variant?: ChipVariant;
  /** Fill appearance — solid (filled) or outline (transparent + border). */
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
 * (solid/outline).
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
 * <Chip label="Selected" variant="primary" appearance="solid" onChipClick={toggle} />
 * ```
 */
export function Chip({
  label,
  size = 'md',
  variant = 'secondary',
  appearance = 'solid',
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
    `bds-chip--${variant}-${appearance}`,
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
          <Icon icon={CaretDown} />
        </span>
      )}
    </div>
  );
}

export default Chip;
