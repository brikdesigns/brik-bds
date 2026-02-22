import { forwardRef, type InputHTMLAttributes, type CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';
import './SearchInput.css';

/**
 * SearchInput size variants
 */
export type SearchInputSize = 'sm' | 'md';

/**
 * SearchInput component props
 */
export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Size variant */
  size?: SearchInputSize;
  /** Optional label text */
  label?: string;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Wrapper styles — vertical stack with gap between label and field
 *
 * Token reference:
 * - --_space---gap--md = 8px (gap between label and field)
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--_space---gap--md)',
};

/**
 * Label styles
 *
 * Token reference:
 * - --_typography---font-family--label
 * - --font-weight--semi-bold = 600
 * - --font-line-height--100
 * - --_color---text--primary
 */
const labelStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  color: 'var(--_color---text--primary)',
  textTransform: 'capitalize' as const,
};

/**
 * Label size variants
 */
const labelSizeStyles: Record<SearchInputSize, CSSProperties> = {
  sm: { fontSize: 'var(--_typography---label--sm)' },
  md: { fontSize: 'var(--_typography---label--md-base)' },
};

/**
 * Field wrapper — positions search icon relative to input
 */
const fieldWrapperStyles: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

/**
 * Search icon positioning
 *
 * Token reference:
 * - --_space---input = 8px (icon inset)
 * - --_color---text--muted (icon color)
 */
const iconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--_space---input)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--_color---text--muted)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Input base styles
 *
 * Token reference:
 * - --_color---background--input (white)
 * - --_color---border--input (border)
 * - --_border-width---sm (border thickness)
 * - --_border-radius---input = 2px (corners)
 * - --_space---input = 8px (padding)
 * - --_typography---font-family--body
 * - --_typography---body--md-base = 16px
 * - --font-weight--regular = 400
 * - --font-line-height--150
 */
const inputBaseStyles: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--_typography---font-family--body)',
  fontSize: 'var(--_typography---body--md-base)',
  fontWeight: 'var(--font-weight--regular)' as unknown as number,
  lineHeight: 'var(--font-line-height--150)',
  color: 'var(--_color---text--primary)',
  backgroundColor: 'var(--_color---background--input)',
  border: 'var(--_border-width---sm) solid var(--_color---border--input)',
  borderRadius: 'var(--_border-radius---input)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  paddingLeft: 'calc(var(--_space---input) * 4)',
};

/**
 * Size-specific padding
 *
 * Figma specs:
 * - md: padding 8px all around (--_space---input), with left increased for icon
 * - sm: same horizontal padding, reduced vertical
 */
const inputSizeStyles: Record<SearchInputSize, CSSProperties> = {
  md: {
    padding: 'var(--_space---input)',
    paddingLeft: 'calc(var(--_space---input) * 4)',
  },
  sm: {
    padding: 'var(--_space---tiny) var(--_space---input)',
    paddingLeft: 'calc(var(--_space---input) * 4)',
  },
};

/**
 * SearchInput - BDS search input component
 *
 * A text input with a built-in magnifying glass search icon.
 * Supports sm and md sizes per Figma bds-search-input spec.
 *
 * @example
 * ```tsx
 * <SearchInput placeholder="Search..." />
 * <SearchInput size="sm" placeholder="Quick search..." />
 * <SearchInput label="Search" placeholder="Search products..." fullWidth />
 * ```
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      size = 'md',
      label,
      fullWidth = false,
      className = '',
      id,
      style,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `search-${Math.random().toString(36).substring(2, 11)}` : undefined);

    const inputStyles: CSSProperties = {
      ...inputBaseStyles,
      ...inputSizeStyles[size],
    };

    return (
      <div
        className={bdsClass('bds-search-input', className)}
        style={{
          ...wrapperStyles,
          width: fullWidth ? '100%' : 'auto',
          ...style,
        }}
      >
        {label && (
          <label
            htmlFor={inputId}
            style={{ ...labelStyles, ...labelSizeStyles[size] }}
          >
            {label}
          </label>
        )}
        <div style={fieldWrapperStyles}>
          <span style={iconStyles}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            ref={ref}
            id={inputId}
            type="search"
            className="bds-search-input-field"
            style={inputStyles}
            {...props}
          />
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
