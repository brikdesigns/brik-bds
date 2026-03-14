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
  striped?: boolean;
  size?: TableSize;
  children: ReactNode;
}

/**
 * Table — themed data table with striped and size variants.
 *
 * Size is propagated via `data-size` attribute on the table element.
 * CSS uses `[data-size]` selectors for cell padding, eliminating the
 * need for React context.
 */
export function Table({
  striped = false,
  size = 'default',
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
