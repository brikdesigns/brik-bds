import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { bdsClass } from '../../utils';
import './InteractiveListItem.css';

export type InteractiveListItemSize = 'sm' | 'md';

export interface InteractiveListItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
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
export const InteractiveListItem = forwardRef<HTMLButtonElement, InteractiveListItemProps>(
  (
    {
      leading,
      title,
      subtitle,
      trailing,
      size = 'md',
      disabled = false,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={bdsClass(
          'bds-interactive-list-item',
          `bds-interactive-list-item--${size}`,
          disabled && 'bds-interactive-list-item--disabled',
          className,
        )}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
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
      </button>
    );
  },
);

InteractiveListItem.displayName = 'InteractiveListItem';

export default InteractiveListItem;
