import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes, type ReactNode } from 'react';
import './Table.css';
export type TableSize = 'default' | 'comfortable';
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
    striped?: boolean;
    size?: TableSize;
    /** Remove left padding on first cell, right padding on last cell */
    flush?: boolean;
    children: ReactNode;
}
/**
 * Table — themed data table with striped and size variants.
 *
 * Size is propagated via `data-size` attribute on the table element.
 * CSS uses `[data-size]` selectors for cell padding, eliminating the
 * need for React context.
 */
export declare function Table({ striped, size, flush, children, className, style, ...props }: TableProps): import("react/jsx-runtime").JSX.Element;
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
    children: ReactNode;
}
export declare function TableHeader({ children, className, style, ...props }: TableHeaderProps): import("react/jsx-runtime").JSX.Element;
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
    children: ReactNode;
}
export declare function TableBody({ children, className, style, ...props }: TableBodyProps): import("react/jsx-runtime").JSX.Element;
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
    selected?: boolean;
    children: ReactNode;
}
export declare function TableRow({ selected, children, className, style, ...props }: TableRowProps): import("react/jsx-runtime").JSX.Element;
export type SortDirection = 'asc' | 'desc' | 'none';
export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
    sortable?: boolean;
    sortDirection?: SortDirection;
    onSort?: () => void;
    children: ReactNode;
}
export declare function TableHead({ sortable, sortDirection, onSort, children, className, style, ...props }: TableHeadProps): import("react/jsx-runtime").JSX.Element;
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
export declare function TableSubheader({ label, colSpan, className, style, ...props }: TableSubheaderProps): import("react/jsx-runtime").JSX.Element;
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    children?: ReactNode;
}
export declare function TableCell({ children, className, style, ...props }: TableCellProps): import("react/jsx-runtime").JSX.Element;
export default Table;
