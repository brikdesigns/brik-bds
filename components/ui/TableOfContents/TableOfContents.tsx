'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { NavItem, type BdsLinkComponent } from '../NavItem';
import { bdsClass } from '../../utils';
import './TableOfContents.css';

export interface TocItem {
  /** Target element id — the anchor is `#{id}` and the scroll-spy observes `document.getElementById(id)`. */
  id: string;
  /** Visible label. */
  label: string;
}

export interface TableOfContentsProps {
  /** Ordered sections. Each renders a `NavItem` linking to `#{id}`. */
  items: TocItem[];
  /**
   * Controlled active id. When provided, the component renders that item active
   * and does NOT run its own scroll-spy — the consumer owns the active state.
   * Omit to let the component track the section in view via IntersectionObserver.
   */
  activeId?: string;
  /** Optional header above the list (e.g. "On this page"). */
  title?: ReactNode;
  /** Accessible label for the nav landmark. Required when multiple navs share a page. */
  ariaLabel?: string;
  /**
   * Pixels to offset the scroll target, for a sticky page header that would
   * otherwise cover the section top. Default 0.
   */
  scrollOffset?: number;
  /** Optional className passthrough for layout-slot integration. */
  className?: string;
  /**
   * Render each link with a router-aware component (Next.js `Link`, Remix
   * `Link`). Rarely needed for in-page anchors; forwarded to every `NavItem`.
   * See ADR-012.
   */
  linkComponent?: BdsLinkComponent;
  /** Fired after a section is activated by click, with its id. */
  onItemClick?: (id: string) => void;
}

/**
 * TableOfContents — sticky in-page section nav with scroll-spy.
 *
 * A Navigation-family component (sibling to `SubNavigation`): it composes
 * `NavItem` per entry, so it inherits the nav item's hover / active / focus
 * styling for free. Unlike `SubNavigation` — a route-nav shell column — this
 * links to in-page `#{id}` anchors, tracks the section in view with an
 * `IntersectionObserver`, and sticks within its column.
 *
 * Uncontrolled by default (self-managed scroll-spy); pass `activeId` to control
 * the active section yourself. Smooth scroll on click yields to
 * `prefers-reduced-motion`.
 *
 * @summary Sticky in-page table of contents with scroll-spy
 */
export function TableOfContents({
  items,
  activeId,
  title,
  ariaLabel = 'Table of contents',
  scrollOffset = 0,
  className,
  linkComponent,
  onItemClick,
}: TableOfContentsProps) {
  const isControlled = activeId !== undefined;
  const [spyActive, setSpyActive] = useState<string | undefined>(() => items[0]?.id);
  const activeResolved = isControlled ? activeId : spyActive;

  // Track the section closest to the top of the viewport. rootMargin biases the
  // active zone to the upper region so a section counts as "current" once its
  // heading nears the top, not only when it fills the screen.
  useEffect(() => {
    if (isControlled) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const tops = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) tops.set(entry.target.id, entry.boundingClientRect.top);
          else tops.delete(entry.target.id);
        }
        let best: string | undefined;
        let bestTop = Infinity;
        for (const [id, top] of tops) {
          if (top < bestTop) {
            bestTop = top;
            best = id;
          }
        }
        if (best) setSpyActive(best);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, isControlled]);

  const reduceMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reduceMotionRef.current = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  function handleClick(e: MouseEvent<HTMLAnchorElement>, id: string) {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    if (el) {
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top, behavior: reduceMotionRef.current ? 'auto' : 'smooth' });
      // Move focus for keyboard + screen-reader users without a second jump.
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      if (!isControlled) setSpyActive(id);
    }
    onItemClick?.(id);
  }

  return (
    <nav className={bdsClass('bds-toc', className)} aria-label={ariaLabel}>
      {title && <div className="bds-toc__title">{title}</div>}
      <ul className="bds-toc__list">
        {items.map((item) => (
          <li key={item.id} className="bds-toc__item">
            <NavItem
              label={item.label}
              href={`#${item.id}`}
              active={item.id === activeResolved}
              onClick={(e) => handleClick(e, item.id)}
              linkComponent={linkComponent}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
