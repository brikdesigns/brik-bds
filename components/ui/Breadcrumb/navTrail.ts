/**
 * navTrail — declare a nav ONCE, derive both the rail and the breadcrumb.
 *
 * Pure and framework-free: no hooks, no router, no React runtime import, so it
 * runs unchanged from a React Server Component, a Client Component, or a
 * build script. The module is on the server-safe allowlist
 * (scripts/server-safe-modules.mjs) so it ships WITHOUT the `'use client'`
 * banner — a server component reads the function as a real value.
 *
 * Pass the current pathname in (`usePathname()`, `headers()`, `Astro.url`).
 */
import type { BreadcrumbItem } from './Breadcrumb';
import type { SubNavItem } from '../SubNavigation/SubNavigation';

/** One rail entry. Everything on {@link SubNavItem} except `active`, which is derived. */
export interface NavTreeItem extends Omit<SubNavItem, 'active'> {
  /**
   * Path prefix that makes this item current. Defaults to `href`. Set it when
   * the item's pages live under a different root than its link target (an
   * "Invoices" item linking `/billing/invoices` that also owns `/billing/*`).
   * Matches on segment boundaries: `/a` matches `/a` and `/a/b`, never `/ab`.
   */
  match?: string;
}

/** A nav section: the rail's title plus its items. Becomes the first crumb. */
export interface NavSection {
  /** Section label — the first crumb (`Settings`, `Contacts`). */
  label: string;
  /** Section root. Linked from the first crumb when the trail continues past it. */
  href?: string;
  items: readonly NavTreeItem[];
}

/** Several sections resolved together (longest prefix wins across all of them). */
export type NavTree = readonly NavSection[];

export interface BreadcrumbTrailOptions {
  /**
   * Crumbs appended after the matched item — a record name on a detail page.
   * The matched item then renders as a link back to its list. The last crumb
   * in the result never carries an `href` (it is the current page).
   */
  trailing?: readonly BreadcrumbItem[];
}

/** Drop query string + hash and the trailing slash (but keep a bare `/`). */
function normalize(path: string): string {
  const bare = path.split(/[?#]/, 1)[0] || '/';
  return bare.length > 1 ? bare.replace(/\/+$/, '') || '/' : bare;
}

/** Segment-boundary prefix test; `/` only matches itself. */
function matchesPrefix(path: string, prefix: string): boolean {
  const p = normalize(prefix);
  if (p === '/') return path === '/';
  return path === p || path.startsWith(`${p}/`);
}

interface Hit {
  section: NavSection;
  item: NavTreeItem;
  length: number;
}

/** The single longest-prefix item across all sections; first declared wins a tie. */
function resolve(path: string, sections: readonly NavSection[]): Hit | undefined {
  let best: Hit | undefined;
  for (const section of sections) {
    for (const item of section.items) {
      const prefix = normalize(item.match ?? item.href);
      if (!matchesPrefix(path, prefix)) continue;
      if (!best || prefix.length > best.length) best = { section, item, length: prefix.length };
    }
  }
  return best;
}

const asSections = (tree: NavSection | NavTree): readonly NavSection[] =>
  'items' in tree ? [tree] : tree;

/**
 * Build the `Section / Item [/ …trailing]` crumb trail for `pathname` from the
 * same declaration that feeds the rail. Returns `[]` when nothing matches, so a
 * caller can fall back to its own trail.
 *
 * - Longest matching prefix wins; ties go to the first declared item.
 * - A pathname equal to a section's `href` (and no item match) yields just
 *   `[Section]`; deeper unmatched paths yield `[]`.
 * - The result is fresh — the tree and `trailing` are never mutated.
 */
export function breadcrumbTrailFromNav(
  pathname: string,
  tree: NavSection | NavTree,
  options: BreadcrumbTrailOptions = {},
): BreadcrumbItem[] {
  const path = normalize(pathname);
  const sections = asSections(tree);
  const hit = resolve(path, sections);

  let trail: BreadcrumbItem[];
  if (hit) {
    const trailing = options.trailing ?? [];
    trail = [
      hit.section.href ? { label: hit.section.label, href: hit.section.href } : { label: hit.section.label },
      trailing.length > 0
        ? { label: hit.item.label, href: hit.item.href }
        : { label: hit.item.label },
      ...trailing.map((crumb) => ({ ...crumb })),
    ];
  } else {
    const root = sections.find((s) => s.href !== undefined && normalize(s.href) === path);
    if (!root) return [];
    trail = [{ label: root.label }];
  }

  const { href: _current, ...last } = trail[trail.length - 1];
  trail[trail.length - 1] = last;
  return trail;
}

/**
 * Derive {@link SubNavItem}s (with `active` set) from the same declaration, so
 * the rail highlights exactly the item the breadcrumb names. `match` is dropped.
 * Pass the whole tree as `scope` when several sections share a prefix space so
 * a deeper item in a sibling section wins; omit it to resolve within `section`.
 */
export function subNavItemsFromNav(
  pathname: string,
  section: NavSection,
  scope?: NavSection | NavTree,
): SubNavItem[] {
  const path = normalize(pathname);
  const winner = resolve(path, asSections(scope ?? section))?.item;
  return section.items.map((source) => {
    const { match: _match, ...item } = source;
    return { ...item, active: source === winner };
  });
}
