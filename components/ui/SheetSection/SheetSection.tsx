import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './SheetSection.css';

export type SheetSectionSpacing = 'md' | 'lg';
export type SheetSectionTitleAs = 'h2' | 'h3' | 'h4';
/** @deprecated Renamed `SheetSectionTitleAs`. */
export type SheetSectionHeadingLevel = SheetSectionTitleAs;

export interface SheetSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section title text. Omit for intro / description-only sections. */
  title?: string;
  /**
   * @deprecated Use `title` instead. Honoured for one minor version;
   * `title` wins when both are passed.
   */
  heading?: string;
  /**
   * HTML element for the title. Defaults to `h3` so the Sheet's own `<h2>`
   * title keeps outline hierarchy intact. Also drives the visual size —
   * `h2`/`h3`/`h4` → `--heading-md`/`--heading-sm`/`--heading-tiny`.
   */
  titleAs?: SheetSectionTitleAs;
  /**
   * @deprecated Use `titleAs` instead. Honoured for one minor version;
   * `titleAs` wins when both are passed.
   */
  headingLevel?: SheetSectionHeadingLevel;
  /** Optional lead paragraph rendered under the title. */
  description?: ReactNode;
  /** Section content — Field, FieldGrid, Card, CardList, Table, TagGroup, BulletList, etc. */
  children?: ReactNode;
  /** Vertical rhythm between this section and the next. Default `lg`. */
  spacing?: SheetSectionSpacing;
}

/**
 * SheetSection — the named wrapper for a block inside a Sheet body.
 *
 * Pairs a section title with its content and locks the vertical rhythm
 * between sections. The title's size follows `titleAs` on a
 * `h2`/`h3`/`h4` → `--heading-md`/`--heading-sm`/`--heading-tiny` ramp — every
 * tier stays larger than Field labels (`--label-sm` inside a Sheet body) so
 * the label-above-heading inversion cannot recur (supersedes the legacy
 * uppercase `--label-sm` treatment).
 *
 * Composes inside `<Sheet>` — one section per logical grouping of fields.
 *
 * @summary Named block wrapper for content inside a Sheet body
 */
export function SheetSection({
  title,
  heading,
  titleAs,
  headingLevel,
  description,
  children,
  spacing = 'lg',
  className,
  style,
  ...props
}: SheetSectionProps) {
  const resolvedTitle = title ?? heading;
  const resolvedTitleAs = titleAs ?? headingLevel ?? 'h3';
  const HeadingTag = resolvedTitleAs;
  return (
    <section
      className={bdsClass(
        'bds-sheet-section',
        `bds-sheet-section--spacing-${spacing}`,
        className,
      )}
      style={style}
      {...props}
    >
      {resolvedTitle && (
        <HeadingTag className="bds-sheet-section__heading" data-level={resolvedTitleAs}>
          {resolvedTitle}
        </HeadingTag>
      )}
      {description && <p className="bds-sheet-section__description">{description}</p>}
      {children && <div className="bds-sheet-section__content">{children}</div>}
    </section>
  );
}

export default SheetSection;
