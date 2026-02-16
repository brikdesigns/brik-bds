import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  createContext,
  useContext,
} from 'react';

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
 * - --_typography---font-family--body (table font)
 * - --_color---text--primary (text color)
 */
const tableStyles: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--_typography---font-family--body)',
  color: 'var(--_color---text--primary)',
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
        className={className || undefined}
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
    <thead className={className || undefined} style={style} {...props}>
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
    <tbody className={className || undefined} style={style} {...props}>
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
 * - --_color---background--secondary (hover + striped background)
 * - --_color---border--muted (subtle bottom border)
 */
const rowBaseStyles: CSSProperties = {
  borderBottom: 'var(--_border-width---sm) solid var(--_color---border--muted)',
};

const rowSelectedStyles: CSSProperties = {
  backgroundColor: 'var(--_color---background--secondary)',
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
    <tr className={className || undefined} style={combinedStyles} {...props}>
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
 * - --_space---sm (default vertical padding: 6px)
 * - --_space---xl (comfortable vertical padding: 24px)
 * - --_space---md (horizontal padding: 8px)
 * - --_typography---font-family--label (label font)
 * - --_typography---label--sm (label size)
 * - --_color---text--muted (muted text)
 * - --_color---border--muted (subtle bottom border)
 * - --_color---background--secondary (header background)
 */
const getHeadStyles = (size: TableSize): CSSProperties => ({
  padding: size === 'comfortable'
    ? 'var(--_space---xl) var(--_space---md)'
    : 'var(--_space---sm) var(--_space---md)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--sm)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  color: 'var(--_color---text--muted)',
  textAlign: 'left',
  borderBottom: 'var(--_border-width---md) solid var(--_color---border--muted)',
  backgroundColor: 'var(--_color---background--secondary)',
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
      className={className || undefined}
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
 * - --_space---sm (default vertical padding: 6px)
 * - --_space---xl (comfortable vertical padding: 24px)
 * - --_space---md (horizontal padding: 8px)
 * - --_typography---body--md-base (body text size)
 * - --_color---text--primary (text color)
 */
const getCellStyles = (size: TableSize): CSSProperties => ({
  padding: size === 'comfortable'
    ? 'var(--_space---xl) var(--_space---md)'
    : 'var(--_space---sm) var(--_space---md)',
  fontSize: 'var(--_typography---body--md-base)',
  color: 'var(--_color---text--primary)',
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
    <td className={className || undefined} style={combinedStyles} {...props}>
      {children}
    </td>
  );
}

export default Table;
