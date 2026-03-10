import { type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';

export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipVariant = 'primary' | 'secondary';
export type ChipAppearance = 'dark' | 'light';

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
 * Size styles from Figma spec (bds-chip):
 *
 * sm: paddingX=padding-sm(12), paddingY=space-150(6), font=body-tiny, gap=gap-xs(4)
 * md: paddingX=padding-md(16), paddingY=padding-sm(12), font=label-sm, gap=gap-sm(6)
 * lg: paddingX=padding-md(16), paddingY=padding-sm(12), font=label-md, gap=gap-md(8)
 */
const sizeStyles: Record<ChipSize, CSSProperties> = {
  sm: {
    padding: 'var(--space-150) var(--padding-sm)',
    fontSize: 'var(--body-tiny)',
    gap: 'var(--gap-xs)',
  },
  md: {
    padding: 'var(--padding-sm) var(--padding-md)',
    fontSize: 'var(--label-sm)',
    gap: 'var(--gap-sm)',
  },
  lg: {
    padding: 'var(--padding-sm) var(--padding-md)',
    fontSize: 'var(--label-md)',
    gap: 'var(--gap-md)',
  },
};

/**
 * Variant + appearance colors from Figma:
 *
 * primary/dark: brand bg, white text
 * primary/light: lightest blue bg, brand border, brand text
 * secondary/dark: secondary bg, dark text
 * secondary/light: white bg, gray border, primary text
 */
const variantStyles: Record<`${ChipVariant}-${ChipAppearance}`, CSSProperties> = {
  'primary-dark': {
    backgroundColor: 'var(--background-brand-primary)',
    color: 'var(--text-on-color-dark)',
  },
  'primary-light': {
    backgroundColor: 'transparent',
    color: 'var(--text-brand-primary)',
    border: 'var(--border-width-md) solid var(--border-brand-primary)',
  },
  'secondary-dark': {
    backgroundColor: 'var(--background-secondary)',
    color: 'var(--text-primary)',
  },
  'secondary-light': {
    backgroundColor: 'var(--background-primary)',
    color: 'var(--text-primary)',
    border: 'var(--border-width-md) solid var(--border-secondary)',
  },
};

// bds-lint-ignore — Figma-driven icon dimensions, numeric for use in width/height/fontSize
const iconSizeMap: Record<ChipSize, number> = {
  sm: 10,
  md: 16,
  lg: 20,
};

const baseStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--border-radius-pill)',
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  cursor: 'pointer',
  userSelect: 'none',
  border: 'none',
  overflow: 'clip',
  transition: 'filter 0.15s ease',
  boxSizing: 'border-box',
};

const disabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none',
};

/**
 * Chip — compact interactive element for filtering, selection, or input.
 *
 * Figma: bds-chip (node 27105:1774)
 * - Pill-shaped with two variants (primary/secondary) and two appearances (dark/light)
 * - Three sizes (sm/md/lg) with optional icon, avatar, dropdown, and remove
 */
export function Chip({
  label,
  size = 'md',
  variant = 'secondary',
  appearance = 'dark',
  icon,
  avatar,
  showDropdown = false,
  onRemove,
  onChipClick,
  disabled = false,
  className = '',
  style,
  ...props
}: ChipProps) {
  const key = `${variant}-${appearance}` as const;
  const combinedStyles: CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[key],
    ...(disabled ? disabledStyles : {}),
    ...style,
  };

  const iconSize = iconSizeMap[size];

  const iconWrapperStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: iconSize,
    height: iconSize,
    fontSize: iconSize,
  };

  const handleClick = () => {
    if (!disabled && onChipClick) onChipClick();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onRemove) onRemove();
  };

  return (
    <div
      className={bdsClass('bds-chip', className)}
      style={combinedStyles}
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
      {avatar && (
        <span style={{ ...iconWrapperStyles, borderRadius: 'var(--border-radius-pill)', overflow: 'hidden' }}>
          {avatar}
        </span>
      )}
      {icon && <span style={iconWrapperStyles}>{icon}</span>}
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'inherit',
            fontSize: iconSize,
            lineHeight: 'inherit',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
      {showDropdown && (
        <span style={{ ...iconWrapperStyles, fontSize: iconSize }}>
          <FontAwesomeIcon icon={faCaretDown} />
        </span>
      )}
    </div>
  );
}

export default Chip;
