import { type HTMLAttributes } from 'react';
import './Pagination.css';
/**
 * Pagination alignment
 */
export type PaginationPosition = 'left' | 'center' | 'right';
/**
 * Pagination component props
 */
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
    /** Current active page (1-indexed) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Alignment of the pagination controls */
    position?: PaginationPosition;
    /** Callback when page changes */
    onChange: (page: number) => void;
    /** Number of sibling pages to show around current page */
    siblingCount?: number;
}
/**
 * Pagination - BDS page navigation component
 *
 * Displays page numbers with previous/next arrow buttons and ellipsis
 * for large page counts. Supports left, center, and right alignment.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={page}
 *   totalPages={80}
 *   onChange={setPage}
 *   position="center"
 * />
 * ```
 */
export declare function Pagination({ currentPage, totalPages, position, onChange, siblingCount, className, style, ...props }: PaginationProps): import("react/jsx-runtime").JSX.Element;
export default Pagination;
