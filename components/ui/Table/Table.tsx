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

export type TableHeaderBackground = 'primary' | 'secondary';

export type TableHeaderBorderWeight = 'sm' | 'md';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Apply alternating row backgrounds for readability on dense tables. Default `false`. */
  striped?: boolean;
  /** Row density. `default` is the standard scale; `comfortable` adds extra cell padding for dense data tables. */
  size?: TableSize;
  /** Remove left padding on first cell, right padding on last cell */
  flush?: boolean;
  /** Show a bottom border under the header row. Default `false`. */
  headerBorder?: boolean;
  /** Weight of the header bottom border when `headerBorder` is on — `md` (default) or `sm` to match the data-row divider weight. No effect when `headerBorder` is off. */
  headerBorderWeight?: TableHeaderBorderWeight;
  /** Round the top-left / top-right outer corners (and draw a subtle outer border). Default `true`. */
  roundedTop?: boolean;
  /** Round the bottom-left / bottom-right outer corners (and draw a subtle outer border). Default `true`. */
  roundedBottom?: boolean;
  /** Header row background fill. Default `secondary`. */
  headerBackground?: TableHeaderBackground;
  /** Table content — typically `TableHead` and `TableBody` from this same module. */
  children: ReactNode;
}

/**
 * Table — themed data table with striped and size variants.
 *
 * Layout config is propagated via `data-*` attributes on the table element
 * (`data-size`, `data-striped`, `data-flush`, `data-header-border`,
 * `data-header-border-weight`, `data-rounded-top`, `data-rounded-bottom`,
 * `data-header-bg`). CSS reads those selectors, eliminating the need for
 * React context.
 *
 * @summary Themed data table with striped + size variants
 */
export function Table({
  striped = false,
  size = 'default',
  flush = false,
  headerBorder = false,
  headerBorderWeight = 'md',
  roundedTop = true,
  roundedBottom = true,
  headerBackground = 'secondary',
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
      data-header-border={headerBorder || undefined}
      data-header-border-weight={headerBorder ? headerBorderWeight : undefined}
      data-rounded-top={roundedTop || undefined}
      data-rounded-bottom={roundedBottom || undefined}
      data-header-bg={headerBackground}
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

// ─── TableActionsCell (<td> for [View][Edit][⋯] action clusters) ──

export type TableActionsCellAlign = 'right' | 'center';

export interface TableActionsCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Action buttons — typically `IconButton` (or `Button icon={...}`) in `size="sm"`. */
  children: ReactNode;
  /**
   * Horizontal alignment of the action cluster. Default `right` (canonical
   * trailing-actions column). Use `center` for symmetric-action tables.
   */
  align?: TableActionsCellAlign;
}

/**
 * TableActionsCell — right-aligned `<td>` hosting the `[View][Edit][⋯]`
 * action cluster on a table row.
 *
 * Owns three things only — and nothing else:
 * 1. Horizontal alignment (canonical `right`, or `center` for symmetric
 *    tables) — applied via class, never inline style.
 * 2. Width that shrinks to its content (`width: 1%`) so content columns
 *    keep their natural sizing.
 * 3. Consistent `--gap-sm` between buttons via an inner flex row.
 *
 * Carries `aria-label="Actions"` for screen-reader context. Pair with
 * an `<TableHead>` carrying the same `align` so column headers line up
 * with the cluster.
 *
 * **Don't bind click to `<TableRow>`** — see the no-row-click rule in
 * the [Read and edit conventions](https://github.com/brikdesigns/brik-client-portal/blob/staging/.claude/references/settings-ia.md#read-and-edit-conventions)
 * locked in portal#837. Cell-level affordances (`TextLink` for Name and
 * FK cells, `TableActionsCell` for the right-aligned cluster) are the
 * canonical click targets.
 *
 * @example
 * ```tsx
 * <TableRow>
 *   <TableCell><TextLink size="small" onClick={openSheet}>{service.name}</TextLink></TableCell>
 *   <TableCell><TextLink size="small" onClick={openFkSheet}>{service.serviceLine}</TextLink></TableCell>
 *   <TableCell><Badge status="positive" size="sm">Active</Badge></TableCell>
 *   <TableActionsCell>
 *     <Button variant="primary" size="sm" icon={<Eye />} label="View" onClick={openSheet} />
 *     <Button variant="primary" size="sm" icon={<Pen />} label="Edit" onClick={navigateEdit} />
 *   </TableActionsCell>
 * </TableRow>
 * ```
 *
 * @summary Right-aligned actions column hosting `[View][Edit][⋯]`
 */
export function TableActionsCell({
  children,
  align = 'right',
  className,
  style,
  'aria-label': ariaLabel,
  ...props
}: TableActionsCellProps) {
  return (
    <td
      className={bdsClass(
        'bds-table-actions-cell',
        `bds-table-actions-cell--${align}`,
        className,
      )}
      style={style}
      aria-label={ariaLabel ?? 'Actions'}
      {...props}
    >
      <div className="bds-table-actions-cell__group">{children}</div>
    </td>
  );
}

export default Table;
