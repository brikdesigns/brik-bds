import { Children, type HTMLAttributes, type ReactNode, isValidElement } from 'react';
import { bdsClass } from '../../utils';
import './CardList.css';

export type CardListOrientation = 'vertical' | 'horizontal';
export type CardListGap = 'sm' | 'md' | 'lg' | 'xl';

export interface CardListProps extends HTMLAttributes<HTMLUListElement> {
  /** Stacking direction. `vertical` (default) for column lists, `horizontal` for rows. */
  orientation?: CardListOrientation;
  /** Spacing between items. Default `md`. */
  gap?: CardListGap;
  /** Horizontal only — when true, items size to their content instead of filling equal columns */
  fitContent?: boolean;
  /** Child cards. Each is wrapped in an `<li>` automatically. */
  children: ReactNode;
}

/**
 * CardList — layout wrapper that stacks card components vertically or horizontally.
 */
export function CardList({
  orientation = 'vertical',
  gap = 'md',
  fitContent = false,
  children,
  className,
  style,
  ...props
}: CardListProps) {
  const classes = bdsClass(
    'bds-card-list',
    `bds-card-list--${orientation}`,
    `bds-card-list--gap-${gap}`,
    orientation === 'horizontal' && fitContent && 'bds-card-list--fit',
    className,
  );

  return (
    <ul className={classes} style={style} {...props}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return null;
        const key = (child as { key?: string | number }).key ?? index;
        return (
          <li key={key} className="bds-card-list__item">
            {child}
          </li>
        );
      })}
    </ul>
  );
}

export default CardList;
