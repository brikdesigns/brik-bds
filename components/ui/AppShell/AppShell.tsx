'use client';

import { type HTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { bdsClass } from '../../utils';
import { mediaQueries } from '../../../tokens';
import { AppShellContext } from './AppShellContext';
import './AppShell.css';

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Shell top bar — a header the shell pins to the top of the window. Setting it
   * also points `--bds-subnav-top` and `--bds-pageheader-top` at the bar's height
   * so a sticky `SubNavigation` or `PageHeader` pins below it, not under it.
   */
  topBar?: ReactNode;
  /**
   * Primary navigation column — a `SidebarNavigation` with `position="sticky"`.
   * Below the tablet breakpoint the shell collapses it to icon-only on its own.
   */
  nav?: ReactNode;
  /** Section rail column beside `main` — a `SubNavigation`. Never put it inside `PageContent`. */
  rail?: ReactNode;
  /** The page — rendered inside `<main>`, a flex column so `Page` can fill it. */
  main?: ReactNode;
}

/** A slot renders only when it holds something: not nullish, a boolean or an empty string. */
const hasSlot = (slot: ReactNode) => slot != null && typeof slot !== 'boolean' && slot !== '';

/** Below-tablet flag, corrected in an effect so server and first client render agree. */
function useBelowTablet(): boolean {
  const [below, setBelow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia(mediaQueries.down.tablet);
    setBelow(query.matches);
    const onChange = (event: MediaQueryListEvent) => setBelow(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return below;
}

/**
 * AppShell — the product layout frame: `topBar`, `nav`, `rail` and `main` slots.
 *
 * **The window owns vertical scroll.** No shell element is a scroll container, so
 * every sticky descendant (`PageHeader`, `SubNavigation`, a table header) pins
 * against the viewport. Horizontal overflow is `overflow-x: clip`, never
 * `hidden` — `hidden` would turn the shell into the scroll container and capture
 * every sticky child.
 *
 * An absent slot renders nothing: no empty wrapper, no empty landmark.
 *
 * @example
 * ```tsx
 * <AppShell
 *   topBar={<header>…</header>}
 *   nav={<SidebarNavigation logo={logo} navItems={items} position="sticky" />}
 *   rail={<SubNavigation items={sections} />}
 *   main={<Page><PageHeader title="Services" sticky /><PageContent>…</PageContent></Page>}
 * />
 * ```
 *
 * @summary Product layout frame — top bar, nav, rail, main
 */
export function AppShell({ topBar, nav, rail, main, className, ...props }: AppShellProps) {
  const collapsed = useBelowTablet();
  const hasTopBar = hasSlot(topBar);
  const hasNav = hasSlot(nav);
  const hasRail = hasSlot(rail);
  const hasMain = hasSlot(main);

  return (
    <AppShellContext.Provider value={{ collapsed }}>
      <div
        className={bdsClass('bds-app-shell', hasTopBar && 'bds-app-shell--top-bar', className)}
        {...props}
      >
        {hasTopBar && <div className="bds-app-shell__top-bar">{topBar}</div>}
        {(hasNav || hasRail || hasMain) && (
          <div className="bds-app-shell__body">
            {hasNav && <div className="bds-app-shell__nav">{nav}</div>}
            {hasRail && <div className="bds-app-shell__rail">{rail}</div>}
            {hasMain && <main className="bds-app-shell__main">{main}</main>}
          </div>
        )}
      </div>
    </AppShellContext.Provider>
  );
}

export default AppShell;
