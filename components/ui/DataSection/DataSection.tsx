import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './DataSection.css';

export type DataSectionSpacing = 'md' | 'lg';
export type DataSectionTitleAs = 'h2' | 'h3';

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
  className,
  style,
  ...props
}: DataSectionProps) {
  const TitleTag = titleAs;
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <section
      className={bdsClass(
        'bds-data-section',
        `bds-data-section--spacing-${spacing}`,
        className,
      )}
      style={style}
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
          {actions && <div className="bds-data-section__actions">{actions}</div>}
        </header>
      )}
      {children && <div className="bds-data-section__content">{children}</div>}
    </section>
  );
}

export default DataSection;
