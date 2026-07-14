import { Children, isValidElement, type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import { FieldGrid, type FieldGridColumns } from '../FieldGrid';
import { Skeleton } from '../Skeleton';
import './DataSection.css';

export type DataSectionSpacing = 'md' | 'lg';
export type DataSectionTitleAs = 'h2' | 'h3';

const DEFAULT_SKELETON_COLUMNS: FieldGridColumns = 2;
const DEFAULT_SKELETON_FIELD_COUNT = 4;

/**
 * Reads the shape (`columns` + field count) that the loading skeleton
 * should render from `children`. When `children` is a single `<FieldGrid>`
 * element, matches its `columns` and cell count; otherwise falls back to
 * a generic 2-column, 4-field shape.
 */
function resolveSkeletonShape(children: ReactNode): { columns: FieldGridColumns; count: number } {
  if (isValidElement(children) && children.type === FieldGrid) {
    const { columns = DEFAULT_SKELETON_COLUMNS, children: gridChildren } = children.props as {
      columns?: FieldGridColumns;
      children?: ReactNode;
    };
    return { columns, count: Children.count(gridChildren) || columns * 2 };
  }
  return { columns: DEFAULT_SKELETON_COLUMNS, count: DEFAULT_SKELETON_FIELD_COUNT };
}

export interface DataSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section title — renders as a heading element (default `<h2>`). */
  title?: string;
  /** Optional secondary line below the title. */
  subtitle?: ReactNode;
  /**
   * Action slot rendered flush-right of the title row.
   * Typically a `<ButtonGroup>` with `[View]` / `[Edit]` toggle, or a single `<Button>`.
   */
  actions?: ReactNode;
  /**
   * Section body — typically a `<FieldGrid>` of `<Field>`s, but any content works.
   */
  children?: ReactNode;
  /** Vertical rhythm between this section and the next. Default `lg`. */
  spacing?: DataSectionSpacing;
  /**
   * HTML element for the title.
   * Default `h2` — the common case is one DataSection sibling of the page's `<h1>`.
   * Use `h3` only when a DataSection is nested under an existing `<h2>`.
   */
  titleAs?: DataSectionTitleAs;
  /**
   * When `true`, renders the body as `Skeleton` field-row placeholders
   * instead of `children`, matching the column count `children` would have
   * produced (reads `columns` + cell count off a `<FieldGrid>` child,
   * falling back to a generic 2-column shape). Title renders unchanged;
   * `actions` is suppressed. Default `false`.
   */
  loading?: boolean;
}

/**
 * DataSection — page-side section wrapper for read-mode data.
 *
 * Groups a titled block of data (typically a `<FieldGrid>` of `<Field>`s) with
 * an optional actions slot. Page analog to `<SheetSection>`, which lives
 * inside a Sheet body and uses an uppercase `<h3>` label style.
 *
 * The title is a real heading node in the page outline — default `<h2>`,
 * rendered with heading-tier typography. It is NOT an uppercase label.
 * @summary Page-side wrapper for read-mode data sections
 *
 * @see Displays/Form/Read-Mode Page — composition with FieldGrid + Field + ButtonGroup.
 */
export function DataSection({
  title,
  subtitle,
  actions,
  children,
  spacing = 'lg',
  titleAs = 'h2',
  loading = false,
  className,
  style,
  ...props
}: DataSectionProps) {
  const TitleTag = titleAs;
  const hasHeader = Boolean(title || subtitle || (actions && !loading));
  const skeletonShape = loading ? resolveSkeletonShape(children) : null;

  return (
    <section
      className={bdsClass(
        'bds-data-section',
        `bds-data-section--spacing-${spacing}`,
        className,
      )}
      style={style}
      aria-busy={loading || undefined}
      {...props}
    >
      {hasHeader && (
        <header className="bds-data-section__header">
          {(title || subtitle) && (
            <div className="bds-data-section__titles">
              {title && <TitleTag className="bds-data-section__title">{title}</TitleTag>}
              {subtitle && <p className="bds-data-section__subtitle">{subtitle}</p>}
            </div>
          )}
          {actions && !loading && <div className="bds-data-section__actions">{actions}</div>}
        </header>
      )}
      {skeletonShape ? (
        <div className="bds-data-section__content" aria-hidden="true">
          <FieldGrid columns={skeletonShape.columns}>
            {Array.from({ length: skeletonShape.count }).map((_, i) => (
              <div key={i} className="bds-data-section__skeleton-field">
                <Skeleton variant="text" width="35%" height={12} />
                <Skeleton variant="text" width="70%" />
              </div>
            ))}
          </FieldGrid>
        </div>
      ) : (
        children && <div className="bds-data-section__content">{children}</div>
      )}
    </section>
  );
}

export default DataSection;
