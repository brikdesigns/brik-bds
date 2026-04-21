/**
 * Drawer Pattern — the mobile navigation drawer shape.
 *
 * Paired with NAV_ARCHETYPE_VALUES on the BCS industry pack and
 * consumed by the BDS `<SiteHeader>` component's mobile drawer render.
 *
 * Pattern semantics:
 *
 *   fullscreen-overlay
 *     Full-viewport dark panel over the content with backdrop-filter
 *     blur on the body beneath. Services mega-menu expands inline.
 *     Utility cluster (phone, book CTA) pinned to bottom. The premium
 *     default — reads as a room change, not a sidebar.
 *
 *   slide-left-panel
 *     Panel slides in from the left covering ~80% of viewport width.
 *     Content remains partially visible on the right with a dark
 *     backdrop. Categories + nested links list vertically; no inline
 *     mega-menu expansion (tap through to category pages).
 *     Fit: utility-first sites where users are already in task mode.
 *
 *   bottom-sheet
 *     Sheet rises from the bottom edge, covering ~70% of viewport.
 *     Primary navigation + filter/search controls share the space.
 *     Fit: directory or listing sites where the nav does double duty
 *     as a search surface.
 */
export const DRAWER_PATTERN_VALUES = [
  'fullscreen-overlay',
  'slide-left-panel',
  'bottom-sheet',
] as const;

export type DrawerPattern = (typeof DRAWER_PATTERN_VALUES)[number];

export const isDrawerPattern = (value: string): value is DrawerPattern =>
  (DRAWER_PATTERN_VALUES as readonly string[]).includes(value);
