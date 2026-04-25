'use client';

import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
} from 'react';
import { bdsClass } from '../../utils';
import './Table.css';

// ─── Table (wrapper) ───────────────────────────────────────────

export type TableSize = 'default' | 'comfortable';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Apply alternating row backgrounds for readability on dense tables. Default `false`. */
  striped?: boolean;
  /** Row density. `default` is the standard scale; `comfortable` adds extra cell padding for dense data tables. */
  size?: TableSize;
  /** Remove left padding on first cell, right padding on last cell */
  flush?: boolean;
  /** Table content — typically `TableHead` and `TableBody` from this same module. */
  children: ReactNode;
}

/**
 * Table — themed data table with striped and size variants.
 *
 * Size is propagated via `data-size` attribute on the table element.
 * CSS uses `[data-size]` selectors for cell padding, eliminating the
 * need for React context.
 *
 * @summary Themed data table with striped + size variants
 */
export function Table({
  striped = false,
  size = 'default',
  flush = false,
  children,
  className,
  style,
  ...props
}: TableProps) {
  return (
    <table
      className={bdsClass('bds-table', className)}
      style={style}
      data-striped={striped || undefined}
      data-size={size}
      data-flush={flush || undefined}
      {...props}
    >
      {children}
    </table>
  );
}

// ─── TableHeader (<thead>) ─────────────────────────────────────

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHeader({
  children,
  className,
  style,
  ...props
}: TableHeaderProps) {
  return (
    <thead className={bdsClass('bds-table-header', className)} style={style} {...props}>
      {children}
    </thead>
  );
}

// ─── TableBody (<tbody>) ───────────────────────────────────────

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableBody({
  children,
  className,
  style,
  ...props
}: TableBodyProps) {
  return (
    <tbody className={bdsClass('bds-table-body', className)} style={style} {...props}>
      {children}
    </tbody>
  );
}

// ─── TableRow (<tr>) ───────────────────────────────────────────

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  children: ReactNode;
}

export function TableRow({
  selected = false,
  children,
  className,
  style,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={bdsClass('bds-table-row', selected && 'bds-table-row--selected', className)}
      style={style}
      {...props}
    >
      {children}
    </tr>
  );
}

// ─── TableHead (<th>) ──────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | 'none';

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
  children: ReactNode;
}

const sortArrows: Record<SortDirection, string> = {
  asc: ' ↑',
  desc: ' ↓',
  none: ' ↕',
};

export function TableHead({
  sortable = false,
  sortDirection = 'none',
  onSort,
  children,
  className,
  style,
  ...props
}: TableHeadProps) {
  return (
    <th
      className={bdsClass('bds-table-head', sortable && 'bds-table-head--sortable', className)}
      style={style}
      onClick={sortable ? onSort : undefined}
      aria-sort={
        sortable
          ? sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : 'none'
          : undefined
      }
      {...props}
    >
      {children}
      {sortable && <span aria-hidden="true">{sortArrows[sortDirection]}</span>}
    </th>
  );
}

// ─── TableSubheader (<tr> section divider) ────────────────────

export interface TableSubheaderProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Section label — rendered all-caps in subtitle-sm font */
  label: string;
  /** Spans this many columns. Default: 100 (spans full width of any table) */
  colSpan?: number;
}

/**
 * TableSubheader — thin section-divider row for grouping table rows by phase or category.
 *
 * Renders a full-width `<tr>` with a surface-secondary background and an
 * all-caps subtitle label. Use it inside `<TableBody>` between row groups.
 *
 * @example
 * ```tsx
 * <TableBody>
 *   <TableSubheader label="Phase 1 — Discovery" />
 *   <TableRow>...</TableRow>
 *   <TableSubheader label="Phase 2 — Design" />
 *   <TableRow>...</TableRow>
 * </TableBody>
 * ```
 */
export function TableSubheader({
  label,
  colSpan = 100,
  className,
  style,
  ...props
}: TableSubheaderProps) {
  return (
    <tr className={bdsClass('bds-table-subheader-row', className)} style={style} {...props}>
      <td className="bds-table-subheader" colSpan={colSpan}>
        {label}
      </td>
    </tr>
  );
}

// ─── TableCell (<td>) ──────────────────────────────────────────

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableCell({
  children,
  className,
  style,
  ...props
}: TableCellProps) {
  return (
    <td className={bdsClass('bds-table-cell', className)} style={style} {...props}>
      {children}
    </td>
  );
}

export default Table;
