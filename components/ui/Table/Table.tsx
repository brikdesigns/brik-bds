'use client';

import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  createContext,
  useContext,
} from 'react';
import { bdsClass } from '../../utils';

// ─── Table Context ─────────────────────────────────────────────

/**
 * Table size variants
 */
export type TableSize = 'default' | 'comfortable';

/**
 * Context for passing table size to cells
 */
const TableContext = createContext<TableSize>('default');

/**
 * Hook to access table size from context
 */
const useTableSize = () => useContext(TableContext);

// ─── Table (wrapper) ───────────────────────────────────────────

/**
 * Table component props
 */
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Alternating row backgrounds */
  striped?: boolean;
  /** Cell size variant */
  size?: TableSize;
  children: ReactNode;
}

/**
 * Base table styles using BDS tokens
 *
 * Token reference:
 * - --font-family-body (table font)
 * - --text-primary (text color)
 */
const tableStyles: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--font-family-body)',
  color: 'var(--text-primary)',
};

/**
 * Table - BDS themed table wrapper
 *
 * Composite component with sub-components: TableHeader, TableBody,
 * TableRow, TableHead, TableCell. Supports striped rows via the
 * `striped` prop (applied as data attribute for row styling).
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Status</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Item</TableCell>
 *       <TableCell><Badge status="positive">Active</Badge></TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export function Table({
  striped = false,
  size = 'default',
  children,
  className = '',
  style,
  ...props
}: TableProps) {
  const combinedStyles: CSSProperties = {
    ...tableStyles,
    ...style,
  };

  return (
    <TableContext.Provider value={size}>
      <table
        className={bdsClass('bds-table', className)}
        style={combinedStyles}
        data-striped={striped || undefined}
        data-size={size}
        {...props}
      >
        {children}
      </table>
    </TableContext.Provider>
  );
}

// ─── TableHeader (<thead>) ─────────────────────────────────────

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHeader({
  children,
  className = '',
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
  className = '',
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
  /** Highlight this row */
  selected?: boolean;
  children: ReactNode;
}

/**
 * Row styles
 *
 * Token reference:
 * - --background-secondary (hover + striped background)
 * - --border-muted (subtle bottom border)
 */
const rowBaseStyles: CSSProperties = {
  borderBottom: 'var(--border-width-sm) solid var(--border-muted)',
};

const rowSelectedStyles: CSSProperties = {
  backgroundColor: 'var(--background-secondary)',
};

export function TableRow({
  selected = false,
  children,
  className = '',
  style,
  ...props
}: TableRowProps) {
  const combinedStyles: CSSProperties = {
    ...rowBaseStyles,
    ...(selected ? rowSelectedStyles : {}),
    ...style,
  };

  return (
    <tr className={bdsClass('bds-table-row', className)} style={combinedStyles} {...props}>
      {children}
    </tr>
  );
}

// ─── TableHead (<th>) ──────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | 'none';

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Enable sort indicator */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort click handler */
  onSort?: () => void;
  children: ReactNode;
}

/**
 * Header cell styles using BDS tokens
 *
 * Token reference:
 * - --padding-sm (default vertical padding: 6px)
 * - --padding-xl (comfortable vertical padding: 24px)
 * - --padding-md (horizontal padding: 8px)
 * - --font-family-label (label font)
 * - --label-sm (label size)
 * - --text-muted (muted text)
 * - --border-muted (subtle bottom border)
 * - --background-secondary (header background)
 */
const getHeadStyles = (size: TableSize): CSSProperties => ({
  padding: size === 'comfortable'
    ? 'var(--padding-xl) var(--padding-md)'
    : 'var(--padding-sm) var(--padding-md)',
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-sm)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-muted)',
  textAlign: 'left',
  borderBottom: 'var(--border-width-md) solid var(--border-muted)',
  backgroundColor: 'var(--background-secondary)',
  whiteSpace: 'nowrap',
});

const sortableStyles: CSSProperties = {
  cursor: 'pointer',
  userSelect: 'none',
};

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
  className = '',
  style,
  ...props
}: TableHeadProps) {
  const size = useTableSize();
  const combinedStyles: CSSProperties = {
    ...getHeadStyles(size),
    ...(sortable ? sortableStyles : {}),
    ...style,
  };

  return (
    <th
      className={bdsClass('bds-table-head', className)}
      style={combinedStyles}
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
      {sortable && (
        <span aria-hidden="true">{sortArrows[sortDirection]}</span>
      )}
    </th>
  );
}

// ─── TableCell (<td>) ──────────────────────────────────────────

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

/**
 * Body cell styles using BDS tokens
 *
 * Token reference:
 * - --padding-sm (default vertical padding: 6px)
 * - --padding-xl (comfortable vertical padding: 24px)
 * - --padding-md (horizontal padding: 8px)
 * - --body-md (body text size)
 * - --text-primary (text color)
 */
const getCellStyles = (size: TableSize): CSSProperties => ({
  padding: size === 'comfortable'
    ? 'var(--padding-xl) var(--padding-md)'
    : 'var(--padding-sm) var(--padding-md)',
  fontSize: 'var(--body-md)',
  color: 'var(--text-primary)',
  verticalAlign: 'middle',
});

export function TableCell({
  children,
  className = '',
  style,
  ...props
}: TableCellProps) {
  const size = useTableSize();
  const combinedStyles: CSSProperties = {
    ...getCellStyles(size),
    ...style,
  };

  return (
    <td className={bdsClass('bds-table-cell', className)} style={combinedStyles} {...props}>
      {children}
    </td>
  );
}

export default Table;
