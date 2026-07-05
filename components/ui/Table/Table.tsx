'use client';

import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ReactNode,
} from 'react';
import { bdsClass } from '../../utils';
import { Avatar, type AvatarStatus } from '../Avatar';
import { Image } from '../Image';
import { Logo, type LogoProps } from '../Logo';
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

// ─── Shared media-cell size (avatar + image thumbnails) ────────

export type TableMediaCellSize = 'sm' | 'md';

// ─── TableAvatarCell (<td> for avatar + identity) ──────────────

export interface TableAvatarCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Avatar image URL. Falls back to initials from `name` when absent. */
  src?: string;
  /** Accessible alt text for the avatar image. */
  alt?: string;
  /** Name used for the initials fallback and, unless `primary` is set, the primary line. */
  name?: string;
  /** Avatar size within the row — `sm` (32px) for dense tables, `md` (40px) for standard. Default `sm`. */
  size?: TableMediaCellSize;
  /** Presence indicator on the avatar. */
  status?: AvatarStatus;
  /** Primary line — usually the name (may be a `TextLink`). Defaults to `name`. */
  primary?: ReactNode;
  /** Secondary line — email, role, or other metadata. */
  secondary?: ReactNode;
}

/**
 * TableAvatarCell — identity cell pairing an `Avatar` with a name and an
 * optional secondary line (email / role), vertically centered.
 *
 * Composes the `Avatar` primitive; owns only the media-left / text-stack
 * layout and its gap. Pass `primary` as a `TextLink` when the name should
 * navigate (per the table name-column convention).
 *
 * @example
 * ```tsx
 * <TableAvatarCell src={u.avatar} name={u.name} secondary={u.email} />
 * ```
 *
 * @summary Avatar + identity (name / email) table cell
 */
export function TableAvatarCell({
  src,
  alt,
  name,
  size = 'sm',
  status,
  primary,
  secondary,
  className,
  style,
  ...props
}: TableAvatarCellProps) {
  return (
    <td className={bdsClass('bds-table-avatar-cell', className)} style={style} {...props}>
      <div className="bds-table-avatar-cell__group">
        <Avatar src={src} alt={alt} name={name} size={size} status={status} />
        <div className="bds-table-avatar-cell__content">
          <span className="bds-table-avatar-cell__name">{primary ?? name}</span>
          {secondary != null && (
            <span className="bds-table-avatar-cell__subtitle">{secondary}</span>
          )}
        </div>
      </div>
    </td>
  );
}

// ─── TableImageCell (<td> for a square 1:1 logo / product image) ──

export type TableImageFit = 'contain' | 'cover';

export interface TableImageCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Image URL. */
  src: string;
  /** Accessible alt text — required. */
  alt: string;
  /** Thumbnail size — `sm` (32px) or `md` (40px) square. Default `sm`. */
  size?: TableMediaCellSize;
  /** Fit inside the square — `contain` for logos (no crop), `cover` for product photos. Default `contain`. */
  fit?: TableImageFit;
}

/**
 * TableImageCell — fixed square (1:1) thumbnail for a logo or product image,
 * shrink-to-content width so it never competes with content columns.
 *
 * Composes the `Image` primitive at `ratio="1-1"`. Use `fit="contain"` for
 * logos (no crop) and `fit="cover"` for product photos. Upload / edit wiring
 * is consumer-side — this cell renders only.
 *
 * @example
 * ```tsx
 * <TableImageCell src={org.logo} alt={`${org.name} logo`} fit="contain" />
 * ```
 *
 * @summary Square 1:1 logo / product thumbnail table cell
 */
export function TableImageCell({
  src,
  alt,
  size = 'sm',
  fit = 'contain',
  className,
  style,
  ...props
}: TableImageCellProps) {
  return (
    <td
      className={bdsClass('bds-table-image-cell', `bds-table-image-cell--${size}`, className)}
      style={style}
      {...props}
    >
      <div className="bds-table-image-cell__media">
        <Image src={src} alt={alt} ratio="1-1" fit={fit} />
      </div>
    </td>
  );
}

// ─── TableLogoCell (<td> for a bundled brand logo) ─────────────

export interface TableLogoCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Bundled brand mark to render — referenced by set + name (a credit-card /
   * integration / client logo). `set` constrains the allowed `name`. For a
   * per-tenant uploaded client logo, use `TableImageCell` with a `src` instead.
   */
  logo: Pick<LogoProps, 'set' | 'name'>;
  /** Thumbnail size — `sm` (32px) or `md` (40px) square. Default `sm`. */
  size?: TableMediaCellSize;
  /** Accessible name override — defaults to the brand name. */
  label?: string;
  /** Render decoratively (`aria-hidden`) when an adjacent cell already names the brand. */
  decorative?: boolean;
}

/**
 * TableLogoCell — fixed square (1:1) cell for a bundled brand `Logo`, the
 * name-referenced counterpart to `TableImageCell` (which takes a `src` URL).
 *
 * Composes the `Logo` primitive and reuses the square-media-cell chrome
 * (`bds-table-image-cell` — padding, flush, rounded-corner handling) since a
 * logo occupies the same 1:1 thumbnail footprint. Full-color, never recolored.
 *
 * @example
 * ```tsx
 * <TableLogoCell logo={{ set: 'integration', name: 'notion' }} />
 * <TableLogoCell logo={{ set: 'credit-card', name: 'visa' }} size="md" />
 * ```
 *
 * @summary Square 1:1 brand-logo table cell (bundled registry)
 */
export function TableLogoCell({
  logo,
  size = 'sm',
  label,
  decorative,
  className,
  style,
  ...props
}: TableLogoCellProps) {
  return (
    <td
      className={bdsClass('bds-table-image-cell', `bds-table-image-cell--${size}`, className)}
      style={style}
      {...props}
    >
      <div className="bds-table-image-cell__media">
        {/* Cast the correlated `set`/`name` union to LogoProps — a spread
            decorrelates it. Sound: the `logo` prop constrains valid pairs. */}
        <Logo {...(logo as LogoProps)} size={size} label={label} decorative={decorative} />
      </div>
    </td>
  );
}

// ─── TableServiceTagCell (<td> for one or more ServiceTags) ────

export interface TableServiceTagCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** One or more `ServiceTag` elements — any variant (`icon`, `icon-text`, `text`). */
  children: ReactNode;
}

/**
 * TableServiceTagCell — hosts one or more `ServiceTag`s on a row, wrapping
 * with a consistent gap and vertical centering.
 *
 * Composes `ServiceTag` (supply `variant="icon"` for icon-only or
 * `variant="icon-text"` for labeled). Owns only alignment / wrap / gap.
 *
 * @example
 * ```tsx
 * <TableServiceTagCell>
 *   <ServiceTag category="brand" variant="icon" serviceName="brand-strategy" />
 *   <ServiceTag category="marketing" variant="icon-text" serviceName="seo" />
 * </TableServiceTagCell>
 * ```
 *
 * @summary Table cell hosting one or more ServiceTags
 */
export function TableServiceTagCell({
  children,
  className,
  style,
  ...props
}: TableServiceTagCellProps) {
  return (
    <td className={bdsClass('bds-table-service-tag-cell', className)} style={style} {...props}>
      <div className="bds-table-service-tag-cell__group">{children}</div>
    </td>
  );
}

export default Table;
