import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './SheetSection.css';

export type SheetSectionSpacing = 'md' | 'lg';

export interface SheetSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Uppercase section label. Omit for intro / description-only sections. */
  heading?: string;
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
 * Pairs an uppercase section heading with its content and locks the
 * vertical rhythm between sections. Replaces ad-hoc flex-column +
 * raw `<h3>` + `detail.sectionHeading` patterns.
 *
 * Composes inside `<Sheet>` — one section per logical grouping of fields.
 *
 * @summary Named block wrapper for content inside a Sheet body
 */
export function SheetSection({
  heading,
  description,
  children,
  spacing = 'lg',
  className,
  style,
  ...props
}: SheetSectionProps) {
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
      {heading && <h3 className="bds-sheet-section__heading">{heading}</h3>}
      {description && <p className="bds-sheet-section__description">{description}</p>}
      {children && <div className="bds-sheet-section__content">{children}</div>}
    </section>
  );
}

export default SheetSection;
