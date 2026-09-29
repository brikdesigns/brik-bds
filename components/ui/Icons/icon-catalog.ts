/**
 * Derived data for the `Assets/icon-catalog` story (#2628).
 *
 * The catalog used to hand-list glyph names in six `render` functions, so a
 * constant added to `components/icons.ts` never appeared until someone edited
 * the story — 8 of 75 had drifted out by the time this was written. Here the
 * glyph list is *derived* from the module's own exports, and the only thing
 * authored by hand is {@link ICON_SECTIONS}, which says where each name is
 * filed. A name with no entry there is not dropped: it lands in
 * {@link UNGROUPED}, which the catalog renders under its own heading and
 * `icon-catalog.test.ts` holds at zero.
 *
 * This module lives beside the story rather than inside it so the grouping is
 * testable. `components/ui/Icons/index.ts` is `export {}`, so nothing here
 * reaches the published package.
 */
import * as Icons from '../../icons';
import phSubset from '../../icons.generated.json';
import { applyWeight } from '../Icon/Icon';
import { DEFAULT_ICON_WEIGHT } from '../Icon/icon-weight';

/** Top-level catalog groups, in sidebar order. One story export each. */
export const CATALOG_GROUPS = ['System', 'Navigation', 'Actions', 'Objects', 'Domain'] as const;
export type CatalogGroup = (typeof CATALOG_GROUPS)[number];

/** Bucket for a constant {@link ICON_SECTIONS} does not file. */
export const UNGROUPED = 'Ungrouped';

/**
 * Where each `icons.ts` constant is filed: constant name → `[group, section]`.
 *
 * Keyed by constant name rather than listing names per section, so this map
 * cannot be the thing that decides *whether* a glyph is shown — only where.
 * Section order within a group follows first appearance here (JS preserves
 * string-key insertion order), so the authoring order below is the section
 * render order. Glyph order *inside* a section is alphabetical — see
 * {@link iconConstants}.
 *
 * A constant has exactly one home. `Check` and `X` appeared under both System
 * and Actions before derivation; they are filed under System, where they read
 * as status marks.
 */
export const ICON_SECTIONS: Record<string, readonly [CatalogGroup, string]> = {
  // ── System ──────────────────────────────────────────────────────────────
  CheckCircle: ['System', 'Feedback & status'],
  WarningCircle: ['System', 'Feedback & status'],
  Warning: ['System', 'Feedback & status'],
  Info: ['System', 'Feedback & status'],
  CircleX: ['System', 'Feedback & status'],
  Circle: ['System', 'Feedback & status'],
  Check: ['System', 'Feedback & status'],
  X: ['System', 'Feedback & status'],
  Spinner: ['System', 'Loading & progress'],
  Rotate: ['System', 'Loading & progress'],
  XBold: ['System', 'Explicit-weight twins'],

  // ── Navigation ──────────────────────────────────────────────────────────
  CaretLeft: ['Navigation', 'Carets'],
  CaretRight: ['Navigation', 'Carets'],
  CaretDown: ['Navigation', 'Carets'],
  CaretUp: ['Navigation', 'Carets'],
  ArrowLeft: ['Navigation', 'Arrows'],
  ArrowRight: ['Navigation', 'Arrows'],
  ArrowUp: ['Navigation', 'Arrows'],
  ArrowDown: ['Navigation', 'Arrows'],
  ArrowSquareOut: ['Navigation', 'Arrows'],
  Bars: ['Navigation', 'Menus'],
  Ellipsis: ['Navigation', 'Menus'],
  EllipsisVertical: ['Navigation', 'Menus'],
  CaretDownBold: ['Navigation', 'Explicit-weight twins'],
  CaretUpBold: ['Navigation', 'Explicit-weight twins'],
  ArrowLeftBold: ['Navigation', 'Explicit-weight twins'],

  // ── Actions ─────────────────────────────────────────────────────────────
  Plus: ['Actions', 'Core actions'],
  Minus: ['Actions', 'Core actions'],
  Pen: ['Actions', 'Core actions'],
  Trash: ['Actions', 'Core actions'],
  Copy: ['Actions', 'Core actions'],
  Download: ['Actions', 'File operations'],
  Upload: ['Actions', 'File operations'],
  ShareNodes: ['Actions', 'File operations'],
  CloudArrowUp: ['Actions', 'File operations'],
  MagnifyingGlass: ['Actions', 'Search & filter'],
  Filter: ['Actions', 'Search & filter'],
  Sort: ['Actions', 'Search & filter'],
  // Connect / disconnect glyphs (#1127) — the semantic set that consumes them
  // is `ACTION_ICONS`, rendered from the module in its own section.
  PlugsConnected: ['Actions', 'Integration lifecycle'],
  LinkBreak: ['Actions', 'Integration lifecycle'],

  // ── Objects ─────────────────────────────────────────────────────────────
  User: ['Objects', 'People & communication'],
  Users: ['Objects', 'People & communication'],
  Envelope: ['Objects', 'People & communication'],
  Phone: ['Objects', 'People & communication'],
  Comment: ['Objects', 'People & communication'],
  Bell: ['Objects', 'People & communication'],
  MapPin: ['Objects', 'Location & time'],
  Building: ['Objects', 'Location & time'],
  House: ['Objects', 'Location & time'],
  Calendar: ['Objects', 'Location & time'],
  Clock: ['Objects', 'Location & time'],
  File: ['Objects', 'Content & media'],
  Folder: ['Objects', 'Content & media'],
  Image: ['Objects', 'Content & media'],
  Link: ['Objects', 'Content & media'],
  Paperclip: ['Objects', 'Content & media'],
  Gear: ['Objects', 'UI elements'],
  Tag: ['Objects', 'UI elements'],
  Star: ['Objects', 'UI elements'],
  Heart: ['Objects', 'UI elements'],
  Bookmark: ['Objects', 'UI elements'],
  Lock: ['Objects', 'UI elements'],
  Unlock: ['Objects', 'UI elements'],
  Eye: ['Objects', 'UI elements'],
  EyeSlash: ['Objects', 'UI elements'],

  // ── Domain ──────────────────────────────────────────────────────────────
  Rocket: ['Domain', 'Feature / marketing'],
  Palette: ['Domain', 'Feature / marketing'],
  Shield: ['Domain', 'Feature / marketing'],
  Gears: ['Domain', 'Feature / marketing'],
  ChartLine: ['Domain', 'Data & analytics'],
  ChartPie: ['Domain', 'Data & analytics'],
  ChartBar: ['Domain', 'Data & analytics'],
  Briefcase: ['Domain', 'Industry'],
  GraduationCap: ['Domain', 'Industry'],
  Stethoscope: ['Domain', 'Industry'],
};

/** One glyph as the catalog shows it. */
export interface CatalogEntry {
  /** The `icons.ts` constant name — what BDS source imports. */
  name: string;
  /** The raw Iconify name the constant holds, e.g. `ph:house`. */
  icon: string;
  /**
   * Whether the glyph the catalog actually paints — the name after the atom's
   * default weight rewrite — is in the bundled offline subset. False means it
   * would reach for the Iconify CDN at runtime, which is the state
   * `npm run gen:icons` exists to clear.
   */
  offline: boolean;
}

/** A labelled run of glyphs inside a group. */
export interface CatalogSection {
  section: string;
  entries: CatalogEntry[];
}

const BUNDLED = new Set(Object.keys((phSubset as { icons: Record<string, unknown> }).icons));

/**
 * Whether `icon` resolves with no network at the weight the catalog renders it.
 * Reuses the atom's own {@link applyWeight} rather than restating the suffix
 * rule, so a change to the rewrite cannot leave this indicator lying.
 */
export function isOffline(icon: string): boolean {
  const resolved = applyWeight(icon, DEFAULT_ICON_WEIGHT);
  return typeof resolved === 'string' && BUNDLED.has(resolved.replace(/^ph:/, ''));
}

/**
 * Every `ph:*` string constant exported by `components/icons.ts`, sorted by
 * constant name — a catalog is looked up by name, not read in authoring order.
 * `ACTION_ICONS` (an object) and the type-only exports fall out by shape, so
 * adding one needs no edit here.
 *
 * The sort is explicit rather than inherited: a module namespace object already
 * has spec-sorted own keys, which is true but invisible at the call site.
 */
export function iconConstants(): CatalogEntry[] {
  return Object.entries(Icons)
    .flatMap(([name, value]) =>
      typeof value === 'string' && value.startsWith('ph:')
        ? [{ name, icon: value, offline: isOffline(value) }]
        : [])
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The sections of one group, in {@link ICON_SECTIONS} authoring order. */
export function catalogGroup(group: CatalogGroup): CatalogSection[] {
  const order = [...new Set(
    Object.values(ICON_SECTIONS).filter(([g]) => g === group).map(([, s]) => s),
  )];
  const bySection = new Map(order.map((s) => [s, [] as CatalogEntry[]]));
  for (const entry of iconConstants()) {
    const filed = ICON_SECTIONS[entry.name];
    if (filed?.[0] === group) bySection.get(filed[1])?.push(entry);
  }
  return order.map((section) => ({ section, entries: bySection.get(section) ?? [] }));
}

/** Constants `ICON_SECTIONS` does not file — rendered, never dropped. */
export function ungrouped(): CatalogEntry[] {
  return iconConstants().filter((entry) => !ICON_SECTIONS[entry.name]);
}
