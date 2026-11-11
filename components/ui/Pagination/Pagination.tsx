import { type HTMLAttributes, useCallback } from 'react';
import { Icon } from '../Icon';
import { Select } from '../Select';
import { CaretLeft, CaretRight } from '../../icons';
import { bdsClass } from '../../utils';
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
  /** Rows per page. With `totalItems`, renders a "Showing X–Y of N" count. */
  pageSize?: number;
  /** Total rows across all pages. Needs `pageSize` to render the count. */
  totalItems?: number;
  /** Row-count choices for the selector. Default `[25, 50, 100]`. */
  pageSizeOptions?: number[];
  /**
   * Renders the rows-per-page selector when provided (needs `pageSize`).
   * The consumer owns resetting `currentPage` to 1 when the size changes.
   */
  onPageSizeChange?: (pageSize: number) => void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100];

/**
 * Generate page numbers with ellipsis
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

  items.push(1);

  if (showLeftEllipsis) {
    items.push('ellipsis-start');
  } else {
    for (let i = 2; i < leftSiblingIndex; i++) {
      items.push(i);
    }
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      items.push(i);
    }
  }

  if (showRightEllipsis) {
    items.push('ellipsis-end');
  } else {
    for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
      items.push(i);
    }
  }

  items.push(totalPages);

  return items;
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
 *
 * @summary Page-navigation controls with page numbers
 */
export function Pagination({
  currentPage,
  totalPages,
  position = 'center',
  onChange,
  siblingCount = 1,
  pageSize,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  className = '',
  style,
  ...props
}: PaginationProps) {
  const handlePrev = useCallback(() => {
    if (currentPage > 1) onChange(currentPage - 1);
  }, [currentPage, onChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) onChange(currentPage + 1);
  }, [currentPage, totalPages, onChange]);

  const pages = getPageNumbers(currentPage, Math.max(totalPages, 1), siblingCount);

  const showSizeSelect = pageSize !== undefined && onPageSizeChange !== undefined;
  const showCount = pageSize !== undefined && totalItems !== undefined;
  const hasMeta = showSizeSelect || showCount;
  const rangeStart = totalItems === 0 || !showCount ? 0 : (currentPage - 1) * (pageSize ?? 0) + 1;
  const rangeEnd = showCount ? Math.min(currentPage * (pageSize ?? 0), totalItems ?? 0) : 0;
  const sizeOptions = pageSize !== undefined && !pageSizeOptions.includes(pageSize)
    ? [...pageSizeOptions, pageSize].sort((a, b) => a - b)
    : pageSizeOptions;

  return (
    <nav
      aria-label="Pagination"
      className={bdsClass('bds-pagination', `bds-pagination--${position}`, hasMeta && 'bds-pagination--with-meta', className)}
      style={style}
      {...props}
    >
      {hasMeta && (
        <div className="bds-pagination__meta">
          {showSizeSelect && (
            <Select
              aria-label="Rows per page"
              size="sm"
              fullWidth={false}
              value={String(pageSize)}
              options={sizeOptions.map((n) => ({ value: String(n), label: `${n} rows` }))}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            />
          )}
          {showCount && (
            <span className="bds-pagination__count" aria-live="polite">
              {`Showing ${rangeStart}–${rangeEnd} of ${totalItems}`}
            </span>
          )}
        </div>
      )}
      <div className="bds-pagination__items">
        <button
          type="button"
          className={bdsClass('bds-pagination__arrow', currentPage <= 1 && 'bds-pagination__arrow--disabled')}
          aria-label="Previous page"
          onClick={handlePrev}
          disabled={currentPage <= 1}
        >
          <Icon icon={CaretLeft} />
        </button>

        {pages.map((item) => {
          if (typeof item === 'string') {
            return (
              <span key={item} className="bds-pagination__ellipsis" aria-hidden>
                &hellip;
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange(item)}
              className={bdsClass('bds-pagination__page', isActive && 'bds-pagination__page--active')}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          className={bdsClass('bds-pagination__arrow', currentPage >= totalPages && 'bds-pagination__arrow--disabled')}
          aria-label="Next page"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
        >
          <Icon icon={CaretRight} />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
