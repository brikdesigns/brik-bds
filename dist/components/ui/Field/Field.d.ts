import { type HTMLAttributes, type ReactNode } from 'react';
import './Field.css';
export type FieldLayout = 'stacked' | 'inline';
export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Field label — rendered above (stacked) or beside (inline) the value. */
    label: string;
    /** Value content — text, <TagList>, <BulletList>, <a>, or any ReactNode. */
    children?: ReactNode;
    /** Stacked = label above value (default). Inline = label / value on one row. */
    layout?: FieldLayout;
    /**
     * Rendered when `children` is null / undefined / empty string.
     * Defaults to the inline muted string "Not set".
     * Pass `<EmptyState />` when a whole section is empty and a larger
     * treatment is warranted — prefer inline text for per-row empties.
     */
    empty?: ReactNode;
}
/**
 * Field — label + value pair for read-mode display inside a Sheet.
 *
 * The single biggest win over ad-hoc markup: one API covers text,
 * tags, URLs, bullet lists, and empty states. Locks label typography,
 * value spacing, and the "Not set" empty treatment.
 */
export declare function Field({ label, children, layout, empty, className, style, ...props }: FieldProps): import("react/jsx-runtime").JSX.Element;
export default Field;
