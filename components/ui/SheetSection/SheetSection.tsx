import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './SheetSection.css';

export type SheetSectionSpacing = 'md' | 'lg';
export type SheetSectionHeadingLevel = 'h2' | 'h3' | 'h4';

export interface SheetSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section heading text. Omit for intro / description-only sections. */
  heading?: string;
  /**
   * Render level for the heading element. Defaults to `h3` so the Sheet's
   * own `<h2>` title keeps outline hierarchy intact.
   */
  headingLevel?: SheetSectionHeadingLevel;
  /** Optional lead paragraph rendered under the heading. */
  description?: ReactNode;
  /** Section content — Field, FieldGrid, Card, CardList, Table, TagGroup, BulletList, etc. */
  children?: ReactNode;
  /** Vertical rhythm between this section and the next. Default `lg`. */
  spacing?: SheetSectionSpacing;
}

/**
 * SheetSection — the named wrapper for a block inside a Sheet body.
 *
 * Pairs a section heading with its content and locks the vertical rhythm
 * between sections. The heading uses the `--heading-sm` semibold tier —
 * always larger than Field labels so the label-above-heading inversion
 * cannot recur (supersedes the legacy uppercase `--label-sm` treatment).
 *
 * Composes inside `<Sheet>` — one section per logical grouping of fields.
 *
 * @summary Named block wrapper for content inside a Sheet body
 */
export function SheetSection({
  heading,
  headingLevel = 'h3',
  description,
  children,
  spacing = 'lg',
  className,
  style,
  ...props
}: SheetSectionProps) {
  const HeadingTag = headingLevel;
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
      {heading && <HeadingTag className="bds-sheet-section__heading">{heading}</HeadingTag>}
      {description && <p className="bds-sheet-section__description">{description}</p>}
      {children && <div className="bds-sheet-section__content">{children}</div>}
    </section>
  );
}

export default SheetSection;
