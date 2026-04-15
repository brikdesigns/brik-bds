import { forwardRef, type InputHTMLAttributes, type CSSProperties } from 'react';
import { Icon } from '@iconify/react';
import { MagnifyingGlass } from '../../icons';
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
 * - --gap-md = 8px
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-md)',
};

/**
 * Label styles
 *
 * Token reference:
 * - --font-family-label
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight
 * - --text-primary
 */
const labelStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-primary)',
  textTransform: 'capitalize' as const,
};

/**
 * Label size variants
 */
const labelSizeStyles: Record<SearchInputSize, CSSProperties> = {
  sm: { fontSize: 'var(--label-sm)' },
  md: { fontSize: 'var(--label-md)' },
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
 * - --padding-sm = 12px (icon inset)
 * - --text-muted (icon color)
 */
const iconStyles: CSSProperties = {
  position: 'absolute',
  left: 'var(--padding-sm)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  pointerEvents: 'none',
  zIndex: 1,
};

/**
 * Input base styles — matches TextInput and AddressInput
 *
 * Token reference:
 * - --background-input (white)
 * - --border-input (border)
 * - --border-width-md = 1px (border thickness)
 * - --border-radius-md = 4px (corners)
 * - --font-family-body
 * - --body-md = 16px
 * - --font-weight-regular = 400
 * - --font-line-height-normal
 */
const inputBaseStyles: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-family-body)',
  fontWeight: 'var(--font-weight-regular)' as unknown as number,
  lineHeight: 'var(--font-line-height-normal)',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--background-input)',
  border: 'var(--border-width-md) solid var(--border-input)',
  borderRadius: 'var(--border-radius-md)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

/**
 * Size-specific styles
 *
 * Heights match Button scale (8px steps, 4px grid):
 *   sm=32  md=40
 */
const inputSizeStyles: Record<SearchInputSize, CSSProperties> = {
  md: {
    fontSize: 'var(--body-md)',
    height: '40px',
    paddingRight: 'var(--padding-xs)',
    paddingLeft: 'calc(var(--padding-sm) + 16px + var(--gap-sm))',
  },
  sm: {
    fontSize: 'var(--body-sm)',
    height: '32px',
    paddingRight: 'var(--padding-xs)',
    paddingLeft: 'calc(var(--padding-sm) + 16px + var(--gap-sm))',
  },
};

/**
 * SearchInput - BDS search input component
 *
 * A text input with a built-in magnifying glass search icon.
 * Uses identical border, radius, and background tokens as TextInput and AddressInput.
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
            <Icon icon={MagnifyingGlass} />
          </span>
          <input
            data-1p-ignore=""
            data-lpignore="true"
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
