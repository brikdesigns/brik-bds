import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { CaretLeft, CaretRight } from '../../icons';
import { bdsClass } from '../../utils';
import './PeriodNav.css';

export interface PeriodNavProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current-period label rendered between the controls, e.g. `"August 2025"` */
  label: ReactNode;
  /** Callback when Previous is activated (button mode) */
  onPrev?: () => void;
  /** Callback when Next is activated (button mode) */
  onNext?: () => void;
  /** href for Previous (link mode — renders an anchor). Ignored when the control is disabled. */
  hrefPrev?: string;
  /** href for Next (link mode — renders an anchor). Ignored when the control is disabled. */
  hrefNext?: string;
  /** Force the Previous control disabled. Defaults to disabled when neither `onPrev` nor `hrefPrev` is set. */
  prevDisabled?: boolean;
  /** Force the Next control disabled. Defaults to disabled when neither `onNext` nor `hrefNext` is set. */
  nextDisabled?: boolean;
  /** Visible text + accessible name for the Previous control (default `"Previous"`) */
  prevLabel?: ReactNode;
  /** Visible text + accessible name for the Next control (default `"Next"`) */
  nextLabel?: ReactNode;
}

/**
 * PeriodNav — a minimal period-navigation bar in the FilterBar family.
 *
 * Where `FilterBar` is count-based (heading + result counter + filter
 * controls), `PeriodNav` is date/period-based: `[◂ Previous] [label] [Next ▸]`.
 * Use it for period-scoped surfaces — a monthly report, a billing cycle — where
 * the caller supplies the current-period label and steps to the adjacent period.
 *
 * Each control is a `secondary` Button. A control is disabled when its target is
 * absent (no `onPrev`/`hrefPrev`, or no `onNext`/`hrefNext`) or when you force it
 * with `prevDisabled` / `nextDisabled` — so the first/last period renders one
 * live control and one disabled one, never a missing button. Pass `hrefPrev` /
 * `hrefNext` for link-driven navigation (server-rendered period routes), or
 * `onPrev` / `onNext` for client-state navigation.
 *
 * The whole bar is a labelled `<nav>` (override via `aria-label`); each control's
 * visible text is its accessible name (WCAG 2.1 AA).
 *
 * Deliberately minimal — prev / label / next only. Future period affordances (a
 * date picker, a granularity toggle) can extend this without an API break.
 *
 * @example
 * ```tsx
 * <PeriodNav
 *   aria-label="Browse months"
 *   label="August 2025"
 *   hrefPrev="/reporting?month=2025-07"
 *   hrefNext="/reporting?month=2025-09"
 * />
 * ```
 *
 * @summary Previous / current-period label / Next navigation bar
 */
export function PeriodNav({
  label,
  onPrev,
  onNext,
  hrefPrev,
  hrefNext,
  prevDisabled,
  nextDisabled,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  className,
  style,
  'aria-label': ariaLabel = 'Period navigation',
  ...props
}: PeriodNavProps) {
  const prevOff = prevDisabled ?? (!onPrev && !hrefPrev);
  const nextOff = nextDisabled ?? (!onNext && !hrefNext);

  return (
    <nav
      className={bdsClass('bds-period-nav', className)}
      style={style}
      aria-label={ariaLabel}
      {...props}
    >
      {/* A disabled control renders as a button (no href) so it stays focusable-off
          and non-navigable — a disabled anchor would still follow its href. */}
      {!prevOff && hrefPrev ? (
        <Button variant="secondary" size="md" href={hrefPrev} iconBefore={<Icon icon={CaretLeft} />}>
          {prevLabel}
        </Button>
      ) : (
        <Button variant="secondary" size="md" disabled={prevOff} onClick={onPrev} iconBefore={<Icon icon={CaretLeft} />}>
          {prevLabel}
        </Button>
      )}

      <span className="bds-period-nav__label">{label}</span>

      {!nextOff && hrefNext ? (
        <Button variant="secondary" size="md" href={hrefNext} iconAfter={<Icon icon={CaretRight} />}>
          {nextLabel}
        </Button>
      ) : (
        <Button variant="secondary" size="md" disabled={nextOff} onClick={onNext} iconAfter={<Icon icon={CaretRight} />}>
          {nextLabel}
        </Button>
      )}
    </nav>
  );
}

export default PeriodNav;
