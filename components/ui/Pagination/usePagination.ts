'use client';

import { useCallback, useMemo, useState } from 'react';
import type { PaginationProps } from './Pagination';

export interface UsePaginationOptions {
  /** Total rows across all pages (the full result count, not the visible slice). */
  totalItems: number;
  /** Starting rows per page. Default `25`. */
  initialPageSize?: number;
  /** Starting page (1-indexed). Default `1`. */
  initialPage?: number;
  /** Row-count choices for the selector. Default `[25, 50, 100]`. */
  pageSizeOptions?: number[];
}

export interface UsePaginationReturn {
  /** Current page (1-indexed), clamped to the last page when `totalItems` shrinks. */
  page: number;
  /** Current rows per page. */
  pageSize: number;
  /** Total pages — never below 1. */
  totalPages: number;
  /** Zero-based index of the first row on this page — `Array.slice` start / Supabase `range` start. */
  offset: number;
  /** Rows on a full page — `Array.slice` end is `offset + limit`. */
  limit: number;
  setPage: (page: number) => void;
  /** Changes rows per page and returns to page 1. */
  setPageSize: (pageSize: number) => void;
  /** Spread onto `<Pagination {...paginationProps} />`. */
  paginationProps: Pick<
    PaginationProps,
    'currentPage' | 'totalPages' | 'onChange' | 'pageSize' | 'totalItems' | 'pageSizeOptions' | 'onPageSizeChange'
  >;
}

/** Page count for `totalItems` at `pageSize` — never below 1, so an empty set still has a page 1. */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(Math.max(totalItems, 0) / Math.max(pageSize, 1)));
}

/** Clamp `page` into `[1, totalPages]`, treating non-finite input as page 1. */
export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), totalPages);
}

/**
 * usePagination — page + page-size state for a paged table or list.
 *
 * Owns the bookkeeping `<Pagination>` leaves to the consumer: the page resets
 * to 1 when the size changes, and the page clamps when `totalItems` shrinks
 * (a filter, a deleted last row).
 *
 * @example
 * ```tsx
 * const { offset, limit, paginationProps } = usePagination({ totalItems: rows.length });
 * const visible = rows.slice(offset, offset + limit);
 * // …render <Table> of `visible`…
 * <Pagination {...paginationProps} position="right" />
 * ```
 */
export function usePagination({
  totalItems,
  initialPageSize = 25,
  initialPage = 1,
  pageSizeOptions,
}: UsePaginationOptions): UsePaginationReturn {
  const [rawPage, setRawPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = getTotalPages(totalItems, pageSize);
  const page = clampPage(rawPage, totalPages);

  const setPage = useCallback((next: number) => setRawPage(next), []);
  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setRawPage(1);
  }, []);

  const paginationProps = useMemo(
    () => ({
      currentPage: page,
      totalPages,
      onChange: setPage,
      pageSize,
      totalItems,
      pageSizeOptions,
      onPageSizeChange: setPageSize,
    }),
    [page, totalPages, setPage, pageSize, totalItems, pageSizeOptions, setPageSize],
  );

  return {
    page,
    pageSize,
    totalPages,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    setPage,
    setPageSize,
    paginationProps,
  };
}
