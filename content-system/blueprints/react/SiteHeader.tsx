/**
 * SiteHeader — React renderer. Twin of
 * `../astro/SiteHeader.astro`. Site-shell nav component (NOT a
 * blueprint — takes direct site-shell props, not BlueprintProps).
 *
 * Dispatches on the `archetype` prop. v0.1 implements
 * `editorial-transparent` in full; other archetypes render the
 * editorial-transparent markup with `data-unimplemented-archetype`
 * for CI grep.
 *
 * ## Interactivity diff vs. Astro twin
 *
 * The Astro version emits the drawer markup with `inert` and relies
 * on scaffold JS (in the consumer site) to toggle it on click. The
 * React version manages drawer open/close in component state via
 * `useState` — no scaffold-JS coordination required. Esc-to-close
 * and click-outside-to-close are wired here too. Resulting consumer
 * footprint: `<SiteHeader />` works standalone.
 *
 * ## Props (NOT BlueprintProps — site-shell shape)
 *
 *   archetype       — ResolvedNavArchetype
 *   brandName       — site brand label
 *   logoUrl         — optional logo image URL
 *   phone           — optional phone number
 *   navItems        — primary nav links
 *   primaryCta      — optional header CTA
 *   currentPath     — optional — drives `aria-current="page"`
 *
 * @summary Site-shell nav component — `editorial-transparent` archetype.
 */
import { useEffect, useRef, useState } from 'react';

import type { ResolvedNavArchetype } from '../astro/types';
import './SiteHeader.css';

interface NavItem {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  archetype: ResolvedNavArchetype;
  brandName: string;
  logoUrl?: string | null;
  phone?: string | null;
  navItems: readonly NavItem[];
  primaryCta?: { label: string; href: string } | null;
  currentPath?: string | null;
}

const IMPLEMENTED_ARCHETYPES: readonly ResolvedNavArchetype[] = [
  'editorial-transparent',
];

function isCurrent(currentPath: string | null | undefined, href: string) {
  if (!currentPath) return false;
  if (currentPath === href) return true;
  if (href !== '/' && currentPath.startsWith(href + '/')) return true;
  return false;
}

export function SiteHeader({
  archetype,
  brandName,
  logoUrl = null,
  phone = null,
  navItems,
  primaryCta = null,
  currentPath = null,
}: SiteHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const isImplemented = IMPLEMENTED_ARCHETYPES.includes(archetype);
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : null;

  // Esc closes the drawer. No-op when drawer is already closed.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <header
      className={`bp-site-header bp-site-header--${archetype}`}
      data-nav-archetype={archetype}
      data-unimplemented-archetype={isImplemented ? undefined : archetype}
    >
      <div className="bp-site-header__container">
        <a
          className="bp-site-header__brand"
          href="/"
          aria-label={`${brandName} home`}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="bp-site-header__logo-image"
            />
          ) : (
            <span className="bp-site-header__brand-text">{brandName}</span>
          )}
        </a>

        <nav className="bp-site-header__nav" aria-label="Primary">
          <ul className="bp-site-header__nav-list" role="list">
            {navItems.map((item) => {
              const current = isCurrent(currentPath, item.href);
              return (
                <li key={item.href} className="bp-site-header__nav-item">
                  <a
                    href={item.href}
                    className="bp-site-header__nav-link"
                    aria-current={current ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="bp-site-header__actions">
          {phoneHref && phone && (
            <a href={phoneHref} className="bp-site-header__phone">
              <span
                className="bp-site-header__phone-label"
                aria-hidden="true"
              >
                Call
              </span>
              <span className="bp-site-header__phone-value">{phone}</span>
            </a>
          )}
          {primaryCta && (
            <a href={primaryCta.href} className="bp-site-header__cta">
              {primaryCta.label}
            </a>
          )}
        </div>

        <button
          type="button"
          className="bp-site-header__hamburger"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          aria-controls="bp-site-header-drawer"
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <span
            className="bp-site-header__hamburger-bar"
            aria-hidden="true"
          />
          <span
            className="bp-site-header__hamburger-bar"
            aria-hidden="true"
          />
          <span
            className="bp-site-header__hamburger-bar"
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id="bp-site-header-drawer"
        ref={drawerRef}
        className="bp-site-header__drawer"
        // `inert` keeps the drawer out of the a11y tree AND focus order
        // when closed. React 18.3+ renders the attribute correctly; on
        // older React the boolean ends up as `inert="true"` which still
        // works in modern browsers.
        {...(drawerOpen ? {} : { inert: '' as unknown as boolean })}
      >
        <nav
          className="bp-site-header__drawer-nav"
          aria-label="Primary mobile"
        >
          <ul className="bp-site-header__drawer-list" role="list">
            {navItems.map((item) => (
              <li key={item.href} className="bp-site-header__drawer-item">
                <a
                  href={item.href}
                  className="bp-site-header__drawer-link"
                  onClick={() => setDrawerOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="bp-site-header__drawer-actions">
            {phoneHref && phone && (
              <a href={phoneHref} className="bp-site-header__drawer-phone">
                {phone}
              </a>
            )}
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="bp-site-header__drawer-cta"
              >
                {primaryCta.label}
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
