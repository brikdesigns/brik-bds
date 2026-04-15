import { type InputHTMLAttributes } from 'react';
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
export declare const SearchInput: import("react").ForwardRefExoticComponent<SearchInputProps & import("react").RefAttributes<HTMLInputElement>>;
export default SearchInput;
