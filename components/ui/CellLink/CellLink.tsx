import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { bdsClass } from '../../utils';
import './CellLink.css';

interface CellLinkBaseProps {
  /** Cell text — the row identifier. */
  children: ReactNode;
  /** Leading slot — company mark, avatar. */
  iconBefore?: ReactNode;
  /** Trailing slot — a `Tag`, an external-link glyph. */
  iconAfter?: ReactNode;
}

export type CellLinkAnchorProps = CellLinkBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    href: string;
    /**
     * Opt-in plain-click hijack for an anchor that keeps a real route — e.g. open a
     * sheet over the list. Runs only on an unmodified primary-button click, after
     * `onClick` (which may veto it with `preventDefault()`); the browser's default
     * navigation is prevented first. Cmd/Ctrl/Shift/Alt-click and middle-click skip
     * it, so "open in new tab/window" still follows `href`.
     */
    onActivate?: (event: MouseEvent<HTMLAnchorElement>) => void;
  };

export type CellLinkButtonProps = CellLinkBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> & { href?: undefined; onActivate?: never };

export type CellLinkProps = CellLinkAnchorProps | CellLinkButtonProps;

/**
 * CellLink — the row-identifier link inside a table or sheet cell.
 *
 * Neutral text at rest, brand on hover — color is the only affordance, never an
 * underline. It tracks the cell's own font size and weight (no `size` or
 * `weight` prop) so a linked cell and a plain-text cell in one column can
 * never drift apart.
 *
 * Pass `href` to navigate (renders `<a>`). Omit it and pass `onClick` for a
 * row that opens a sheet or runs a callback (renders `<button type="button">`).
 * On the anchor form, add `onActivate` for a cell with a real route that should
 * open a sheet over the list on a plain left-click (e.g. with `useSheetStack`):
 * `href` stays rendered, and modified or middle clicks still open the route in
 * a new tab.
 * Reserve `TextLink` (brand blue) for a real call-to-action.
 *
 * @summary Neutral row-identifier link or button for table cells
 */
export const CellLink = forwardRef<HTMLAnchorElement | HTMLButtonElement, CellLinkProps>(
  ({ iconBefore, iconAfter, className, children, ...props }, ref) => {
    const classes = bdsClass('bds-cell-link', className);
    const content = (
      <>
        {iconBefore && <span className="bds-cell-link__icon">{iconBefore}</span>}
        {children}
        {iconAfter && <span className="bds-cell-link__icon">{iconAfter}</span>}
      </>
    );

    if (props.href !== undefined) {
      const { onActivate, onClick, ...anchorProps } = props as CellLinkAnchorProps;
      const handleClick = onActivate
        ? (event: MouseEvent<HTMLAnchorElement>) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            onActivate(event);
          }
        : onClick;
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={classes}
          {...anchorProps}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);

CellLink.displayName = 'CellLink';

export default CellLink;
