import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
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
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { href: string };

export type CellLinkButtonProps = CellLinkBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> & { href?: undefined };

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
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={classes}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
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
