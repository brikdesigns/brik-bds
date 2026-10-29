'use client';

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { useSelectionGroup } from '../shared/useSelectionGroup';
import { bdsClass } from '../../utils';
import './InteractiveListItem.css';

export type InteractiveListItemSize = 'sm' | 'md';

/**
 * The element the root renders as: `<button>` standalone, `<label>` inside a
 * `RadioGroup` / `CheckboxGroup` (ADR-045).
 */
export type InteractiveListItemElement = HTMLButtonElement | HTMLLabelElement;

export interface InteractiveListItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'value'> {
  /**
   * This row's value inside a `RadioGroup` / `CheckboxGroup`. Required there —
   * the group matches it against its own `value` to decide `selected`. Without
   * a surrounding group (or without a `value`) the row stays a standalone
   * `aria-pressed` toggle button.
   */
  value?: string;
  /**
   * Leading slot — typically a `UserAvatar`, an icon inside a colored
   * circle, or a status indicator. Fixed width; doesn't shrink.
   */
  leading?: ReactNode;
  /** Primary title text. Required. */
  title: string;
  /**
   * Optional secondary content. `ReactNode` so callers can compose
   * multi-line metadata, embedded badges, timestamp + author, etc.
   * Single-line strings are also valid.
   */
  subtitle?: ReactNode;
  /**
   * Optional trailing slot — typically a `Tag`, `Badge`, progress
   * block, or caret indicator. Fixed width; doesn't shrink.
   */
  trailing?: ReactNode;
  /**
   * Row size. Default `md` — full sheets and panels. Use `sm` for
   * narrow contexts like DevBar slot panels, popovers, or any
   * container narrower than ~360px where the default padding crowds
   * the text column. Both variants step through the BDS semantic
   * spacing scale, so they compose with the global Base/Spacious
   * spacing modes.
   */
  size?: InteractiveListItemSize;
  /** Disable the row. Applies muted styling and blocks click. */
  disabled?: boolean;
  /**
   * Persistent selected state — a modifier layered on top of the row,
   * mirroring the `selected` prop on `Button` / `SegmentedControl`. Use
   * for a row that toggles on/off (a picker option, a multi-select list).
   * When provided, the row also exposes `aria-pressed`, giving it toggle
   * semantics; leave it `undefined` for a plain drill-in row.
   *
   * For a pick-one / pick-many list, put the rows inside a `RadioGroup` /
   * `CheckboxGroup` instead and give each a `value` — selection then comes from
   * the group and `selected` is ignored (ADR-045).
   *
   * Interactive rows only — ignored when `interactive={false}`.
   */
  selected?: boolean;
  /**
   * Whether the row is a click target. Default `true` — renders a
   * `<button>` with the full interactive contract (hover, active, focus
   * ring, `onClick`, `disabled`, `selected`).
   *
   * Set `false` for a **read-only / display row** — a status list, a
   * per-page composition list, any row that shows data without drilling
   * in. It renders a non-interactive `<div>` with the same
   * leading/title/subtitle/trailing slots, and drops every interactive
   * affordance (no cursor, hover, active, focus ring, or click). The
   * button-only props (`onClick`, `disabled`, `selected`) are ignored.
   */
  interactive?: boolean;
}

/**
 * InteractiveListItem — clickable horizontal row with leading + title +
 * optional subtitle + optional trailing slot. The whole row is the
 * click target.
 *
 * Use for "row that drills into something" — clicking a member opens
 * their profile sheet, clicking an activity item opens the related
 * task, clicking a persona switches the dev session. Distinct from
 * `CardControl` (which is a settings card with a switch / button as
 * its trailing action — the card itself is *not* the click target).
 *
 * Renders as `<button type="button">` for proper a11y — native focus
 * ring, native `Space` / `Enter` activation, native `disabled`. Don't
 * nest interactive elements inside the slots; if the trailing slot
 * needs to be its own click target, use `CardControl` instead.
 *
 * Inside a `RadioGroup` (pick one) or `CheckboxGroup` (pick many), give the
 * row a `value`: it renders as a `<label>` wrapping a visually hidden native
 * radio / checkbox, so the group — not a row of `aria-pressed` toggles — is what
 * assistive tech reads. Selection, `name`, `disabled` and change handling come
 * from the group; `onClick` and `selected` are ignored there (ADR-045).
 *
 * For a **display-only row** (status list, per-page composition list —
 * anything that shows data without drilling in), pass `interactive={false}`:
 * same slot API, rendered as a non-interactive `<div>` with no click
 * target and no hover / active / focus affordances.
 *
 * @example
 * ```tsx
 * <InteractiveListItem
 *   leading={<UserAvatar name="Emily Rivera" size="md" />}
 *   title="Emily Rivera"
 *   subtitle="Hygienist · 2 years"
 *   trailing={<Badge status="info">New hire</Badge>}
 *   onClick={() => openProfile(member.id)}
 * />
 * ```
 *
 * @summary Clickable horizontal row — leading + title + subtitle + trailing
 */
export const InteractiveListItem = forwardRef<InteractiveListItemElement, InteractiveListItemProps>(
  (
    {
      leading,
      title,
      subtitle,
      trailing,
      size = 'md',
      disabled = false,
      selected,
      interactive = true,
      className,
      onClick,
      value,
      ...props
    },
    ref,
  ) => {
    const group = useSelectionGroup();

    const slots = (
      <>
        {leading !== undefined && (
          <span className="bds-interactive-list-item__leading">{leading}</span>
        )}
        <span className="bds-interactive-list-item__text">
          <span className="bds-interactive-list-item__title">{title}</span>
          {subtitle !== undefined && subtitle !== null && (
            <span className="bds-interactive-list-item__subtitle">{subtitle}</span>
          )}
        </span>
        {trailing !== undefined && (
          <span className="bds-interactive-list-item__trailing">{trailing}</span>
        )}
      </>
    );

    // Read-only row — non-interactive <div>, display only. Drops every
    // button-only concern (onClick / disabled / selected). The forwardRef is
    // typed to the interactive <button> / <label>, so the div branch casts ref + the
    // remaining props (which may carry button-only attrs) to div shapes.
    if (!interactive) {
      return (
        <div
          ref={ref as unknown as ForwardedRef<HTMLDivElement>}
          className={bdsClass(
            'bds-interactive-list-item',
            'bds-interactive-list-item--readonly',
            `bds-interactive-list-item--${size}`,
            className,
          )}
          {...(props as unknown as HTMLAttributes<HTMLDivElement>)}
        >
          {slots}
        </div>
      );
    }

    // Inside a RadioGroup / CheckboxGroup — a <label> wrapping a visually hidden
    // native input (the ServiceTagSelect rendering, ADR-045 § 2). The group owns
    // name, checked, disabled and change; the browser owns the keyboard model.
    if (group && value !== undefined) {
      const isDisabled = disabled || group.disabled;
      const isSelected = group.isSelected(value);
      return (
        <label
          ref={ref as Ref<HTMLLabelElement>}
          className={bdsClass(
            'bds-interactive-list-item',
            `bds-interactive-list-item--${size}`,
            isSelected && 'bds-interactive-list-item--selected',
            isDisabled && 'bds-interactive-list-item--disabled',
            className,
          )}
          {...(props as unknown as HTMLAttributes<HTMLLabelElement>)}
        >
          <input
            type={group.kind}
            name={group.name}
            value={value}
            checked={isSelected}
            disabled={isDisabled}
            onChange={() => group.onChange(value)}
            className="bds-interactive-list-item__input"
          />
          {slots}
        </label>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={bdsClass(
          'bds-interactive-list-item',
          `bds-interactive-list-item--${size}`,
          selected && 'bds-interactive-list-item--selected',
          disabled && 'bds-interactive-list-item--disabled',
          className,
        )}
        disabled={disabled}
        value={value}
        aria-pressed={selected}
        onClick={onClick}
        {...props}
      >
        {slots}
      </button>
    );
  },
);

InteractiveListItem.displayName = 'InteractiveListItem';

export default InteractiveListItem;
