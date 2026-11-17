import { Children, Fragment, cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

type SizedProps = { size?: string; children?: ReactNode };

/**
 * Give every component child (descending through fragments) that has no `size`
 * of its own the bar's `size`. FilterBar and CalendarToolbar use it so
 * FilterButton / FilterToggle / Select (default `md`) match the bar's `sm`
 * buttons and search field — one control height per bar. Host elements
 * (`<div>`, `<span>`) are left alone so no stray `size` attribute reaches the DOM.
 */
export function withBarSize<S extends string>(node: ReactNode, size: S): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement<SizedProps>(child)) return child;
    if (child.type === Fragment) {
      return <Fragment>{withBarSize(child.props.children, size)}</Fragment>;
    }
    return typeof child.type !== 'string' && child.props.size === undefined
      ? cloneElement(child as ReactElement<SizedProps>, { size })
      : child;
  });
}
