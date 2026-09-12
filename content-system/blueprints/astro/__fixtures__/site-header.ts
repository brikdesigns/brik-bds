/**
 * SiteHeader prop fixtures for the pre-rendered Astro Nav Archetypes stories
 * (ADR-039, #2431). One fixture per `NAV_ARCHETYPE_VALUES` entry so the whole
 * vocabulary is browsable as the real `<SiteHeader>` output rather than the
 * retired `NavigationIASpec` mock.
 *
 * The values mirror the canonical per-archetype props the render gate already
 * exercises (`scripts/verify-blueprints-astro-exports.mjs` — the index page,
 * the interior page, and `ARCHETYPE_FIXTURES`), so the browsable coverage and
 * the build+a11y gate render the same shapes. Divergence here would hide
 * divergence in the rail — the same discipline `__fixtures__/sections.ts`
 * keeps for the blocks.
 *
 * Consumed by `scripts/render-astro-blueprints.mjs` in Node, never by a story
 * directly — `astro/container` cannot run in the browser bundle.
 *
 * Keep this file fixture-only: no rendering, no framework imports.
 */
import type { ResolvedNavArchetype } from '../types';
import type { ScrollBehavior, DrawerPattern } from '../../../vocabularies';
import type { ServicesMegaMenu } from '../../../schema/industry-pack';

interface NavItem {
  label: string;
  href: string;
}

export interface SiteHeaderFixtureProps {
  archetype: ResolvedNavArchetype;
  brandName: string;
  phone?: string | null;
  navItems: readonly NavItem[];
  primaryCta?: { label: string; href: string } | null;
  currentPath?: string | null;
  servicesMegaMenu?: ServicesMegaMenu | null;
  scrollBehavior?: ScrollBehavior | null;
  mobileDrawer?: DrawerPattern | null;
}

/** One fixture per archetype, in `NAV_ARCHETYPE_VALUES` order. */
export const SITE_HEADER_FIXTURES: readonly SiteHeaderFixtureProps[] = [
  {
    // Overlays the hero: transparent at top → frosted past the threshold,
    // hide-on-scroll-down / reveal-on-scroll-up. Services mega-menu.
    archetype: 'editorial-transparent',
    brandName: 'Northlight Dental',
    phone: '+1 (615) 555-0100',
    navItems: [
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    primaryCta: { label: 'Book a call', href: '/contact' },
    currentPath: '/services',
    scrollBehavior: 'transparent-top-frosted-past-80',
    mobileDrawer: 'fullscreen-overlay',
    servicesMegaMenu: {
      triggerLabel: 'Services',
      columns: 4,
      categories: [
        {
          heading: 'Cosmetic',
          items: [
            { label: 'Veneers', href: '/services/veneers', note: 'Custom-crafted' },
            { label: 'Whitening', href: '/services/whitening', note: 'In-office + take-home' },
          ],
        },
        {
          heading: 'Restorative',
          items: [{ label: 'Crowns', href: '/services/crowns', note: 'Full-mouth rehab' }],
        },
      ],
    },
  },
  {
    // Task surface: always-solid, never hides, slide-left drawer. 5 links +
    // mega-menu. Real-estate / directory / multi-practice packs.
    archetype: 'utility-first',
    brandName: 'Harbor Communities',
    phone: '+1 (615) 555-0100',
    navItems: [
      { label: 'Communities', href: '/communities' },
      { label: 'Amenities', href: '/amenities' },
      { label: 'Rates', href: '/rates' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    primaryCta: { label: 'Find a Site', href: '/find-a-site' },
    currentPath: '/communities',
    scrollBehavior: 'sticky-solid',
    mobileDrawer: 'slide-left-panel',
    servicesMegaMenu: {
      triggerLabel: 'Communities',
      columns: 3,
      categories: [
        {
          heading: 'RV Parks',
          items: [{ label: 'All RV parks', href: '/rv-parks' }],
        },
        {
          heading: 'Mobile Home',
          items: [{ label: 'All communities', href: '/communities/mhc' }],
        },
      ],
    },
  },
  {
    // The mega-menu is the product — 2-column flyout + featured card,
    // always-solid surface. Multi-practice legal / specialty medical.
    archetype: 'service-centric',
    brandName: 'Whitfield & Cole',
    phone: '+1 (615) 555-0100',
    navItems: [
      { label: 'Practice Areas', href: '/practice-areas' },
      { label: 'Attorneys', href: '/attorneys' },
      { label: 'Results', href: '/results' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    primaryCta: { label: 'Free Consultation', href: '/contact' },
    currentPath: '/practice-areas',
    scrollBehavior: 'sticky-solid',
    mobileDrawer: 'fullscreen-overlay',
    servicesMegaMenu: {
      triggerLabel: 'Practice Areas',
      columns: 2,
      categories: [
        {
          heading: 'Litigation',
          items: [
            { label: 'Personal Injury', href: '/practice-areas/personal-injury' },
            { label: 'Medical Malpractice', href: '/practice-areas/med-mal', note: 'Trial-ready' },
          ],
        },
        {
          heading: 'Advisory',
          items: [
            { label: 'Estate Planning', href: '/practice-areas/estate' },
            { label: 'Business Law', href: '/practice-areas/business' },
          ],
        },
      ],
      featured: {
        eyebrow: 'Meet the team',
        heading: 'Speak with a partner today',
        body: 'Every matter is led by a named attorney.',
        ctaLabel: 'Our attorneys',
        ctaHref: '/attorneys',
      },
    },
  },
  {
    // Text-only, chrome-out-of-the-way: no dropdowns, wide tracking,
    // transparent at top, reveal-on-scroll. MUA / creative / wedding packs.
    archetype: 'portfolio-minimal',
    brandName: 'Marlow Studio',
    navItems: [
      { label: 'Work', href: '/work' },
      { label: 'About', href: '/about' },
      { label: 'Journal', href: '/journal' },
      { label: 'Contact', href: '/contact' },
    ],
    primaryCta: { label: 'Inquire', href: '/contact' },
    currentPath: '/work',
    scrollBehavior: 'reveal-on-scroll',
    mobileDrawer: 'fullscreen-overlay',
  },
  {
    // Low-stimulation: no dropdowns, low-contrast muted surface, always
    // solid, single warm CTA. Wellness / mental-health / recovery packs.
    archetype: 'calm-flat',
    brandName: 'Still Water Counseling',
    navItems: [
      { label: 'Services', href: '/services' },
      { label: 'Approach', href: '/approach' },
      { label: 'Contact', href: '/contact' },
    ],
    primaryCta: { label: 'Book Session', href: '/book' },
    currentPath: '/services',
    scrollBehavior: 'sticky-solid',
    mobileDrawer: 'fullscreen-overlay',
  },
];
