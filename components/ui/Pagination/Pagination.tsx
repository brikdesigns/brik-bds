import { type HTMLAttributes, type CSSProperties, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { bdsClass } from '../../utils';

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
 * Container styles
 */
const containerStyles: CSSProperties = {
  display: 'flex',
  width: '100%',
  padding: 'var(--padding-lg) 0',
  boxSizing: 'border-box',
};

/**
 * Position-based alignment
 */
const positionMap: Record<PaginationPosition, CSSProperties['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

/**
 * Pagination wrapper (items row)
 *
 * Token reference:
 * - --gap-lg = 16px (gap between items)
 */
const wrapperStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--gap-lg)',
};

/**
 * Arrow button styles
 *
 * Token reference:
 * - --background-brand-primary (brand blue)
 * - --text-on-color-dark (white icon on brand bg)
 */
const arrowStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '9999px',
  backgroundColor: 'var(--background-brand-primary)',
  color: 'var(--text-on-color-dark)',
  border: 'none',
  cursor: 'pointer',
  fontSize: 'var(--icon-lg)',
  flexShrink: 0,
};

/**
 * Disabled arrow styles
 */
const arrowDisabledStyles: CSSProperties = {
  ...arrowStyles,
  opacity: 0.4,
  cursor: 'not-allowed',
};

/**
 * Page number styles (inactive)
 *
 * Token reference:
 * - --font-family-label (label font)
 * - --label-sm = 14px
 * - --font-weight-semi-bold = 600
 * - --font-line-height-tight
 * - --text-muted (inactive gray)
 * - --padding-sm = 12px (horizontal padding)
 */
const pageStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-sm)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  color: 'var(--text-muted)',
  padding: 'var(--padding-sm)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  minWidth: '24px',
  textAlign: 'center',
};

/**
 * Active page number styles
 *
 * Token reference:
 * - --text-brand-primary (brand blue for active page)
 */
const activePageStyles: CSSProperties = {
  ...pageStyles,
  color: 'var(--text-brand-primary)',
  cursor: 'default',
};

/**
 * Ellipsis styles
 */
const ellipsisStyles: CSSProperties = {
  ...pageStyles,
  cursor: 'default',
  color: 'var(--text-muted)',
};

/**
 * Generate page numbers with ellipsis
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  const totalSlots = siblingCount * 2 + 5; // first + last + current + 2 siblings + 2 ellipsis

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
 */
export function Pagination({
  currentPage,
  totalPages,
  position = 'center',
  onChange,
  siblingCount = 1,
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

  const pages = getPageNumbers(currentPage, totalPages, siblingCount);

  const combinedStyles: CSSProperties = {
    ...containerStyles,
    justifyContent: positionMap[position],
    ...style,
  };

  return (
    <nav
      aria-label="Pagination"
      className={bdsClass('bds-pagination', className)}
      style={combinedStyles}
      {...props}
    >
      <div style={wrapperStyles}>
        <button
          type="button"
          className="bds-pagination-prev"
          aria-label="Previous page"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          style={currentPage <= 1 ? arrowDisabledStyles : arrowStyles}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {pages.map((item) => {
          if (typeof item === 'string') {
            return (
              <span key={item} style={ellipsisStyles} aria-hidden>
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
              style={isActive ? activePageStyles : pageStyles}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          className="bds-pagination-next"
          aria-label="Next page"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          style={currentPage >= totalPages ? arrowDisabledStyles : arrowStyles}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
