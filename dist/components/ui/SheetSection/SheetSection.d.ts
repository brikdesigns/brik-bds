import { type HTMLAttributes, type ReactNode } from 'react';
import './SheetSection.css';
export type SheetSectionSpacing = 'md' | 'lg';
export interface SheetSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    /** Uppercase section label. Omit for intro / description-only sections. */
    heading?: string;
    /** Optional lead paragraph rendered under the heading. */
    description?: ReactNode;
    /** Section content — Field, FieldGrid, Card, CardList, Table, TagList, BulletList, etc. */
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
 */
export declare function SheetSection({ heading, description, children, spacing, className, style, ...props }: SheetSectionProps): import("react/jsx-runtime").JSX.Element;
export default SheetSection;
