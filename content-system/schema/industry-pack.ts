import type {
  IndustrySlug,
  ParentIndustrySlug,
  Personality,
  Voice,
  VisualStyle,
  NavArchetype,
  ScrollBehavior,
  DrawerPattern,
  FooterArchetype,
} from '../vocabularies';

/**
 * IndustryPack — the structured data half of an industry reference.
 *
 * Each industry in BCS has two files:
 *   - `{slug}.ts`  — this shape, imported by automations and the portal resolver
 *   - `{slug}.mdx` — the human-readable narrative (Overview, Pain Points, etc.)
 *
 * The narrative explains the industry; the pack lets automations act on it.
 * Keep them in sync — changes to `.ts` values should be reflected in the
 * `.mdx` body and vice versa.
 *
 * Review cadence is quarterly. Bump `version` on content changes; update
 * `lastReviewed` on confirmed-still-accurate passes.
 */
export interface IndustryPack {
  /** Canonical slug — must appear in INDUSTRY_SLUGS registry. */
  slug: IndustrySlug;
  /**
   * Parent industry bucket this pack belongs to — mirrors the portal's
   * `companies.industry` top-level taxonomy so portal dropdowns can filter
   * sub-industries by parent. Must be one of PARENT_INDUSTRY_SLUGS.
   */
  parentIndustry: ParentIndustrySlug;
  /** Human-readable name used in portal UI and generated briefs. */
  displayName: string;
  /** Semver. Bump on material content change; minor for additions, major for schema breaks. */
  version: string;
  reviewCadence: 'quarterly' | 'biannual' | 'annual';
  /** ISO date YYYY-MM-DD. */
  lastReviewed: string;

  /**
   * Affinity defaults — used by the resolver when a client hasn't picked
   * traits in the portal, or when the pack wants to nudge a balanced default.
   * Not prescriptive: clients always override. Order matters — first entry
   * is the strongest affinity.
   */
  affinities: {
    personality: readonly Personality[];
    voice: readonly Voice[];
    visualStyle: readonly VisualStyle[];
  };

  /** Industry-specific information architecture. */
  pageArchetypes: readonly PageArchetype[];

  /** Canonical service taxonomy used to seed the portal services picker and copy. */
  servicesCatalog: readonly ServiceEntry[];

  /**
   * Patient-facing conditions treated — structured symptom/diagnosis vocabulary
   * for healthcare verticals. Drives symptom-aware SEO, content generation,
   * and the Intel tab's Conditions Treated combobox. Omit for non-healthcare
   * industries.
   */
  conditionsCatalog?: readonly ServiceEntry[];

  /**
   * Procedure vocabulary — structured procedure-level taxonomy (as distinct
   * from bundled services). Drives service-detail pages, CMS procedure
   * entries, and the Intel tab's Procedures Performed combobox. Omit for
   * industries where procedure-level granularity is not applicable.
   */
  proceduresCatalog?: readonly ServiceEntry[];

  /**
   * Amenities / features catalog — structured facility-feature taxonomy for
   * hospitality, real-estate, and venue industries. Drives the Intel tab's
   * Amenities combobox, feature-list page sections, and local-SEO schema.
   * Omit for industries where amenities are not applicable.
   */
  amenitiesCatalog?: readonly ServiceEntry[];

  /** Preferred terminology and terms to avoid (regulatory, positioning, or style). */
  vocabulary: {
    preferred: readonly string[];
    avoid: readonly VocabularyAvoid[];
  };

  /** Default CTA phrasing — seeds company_profile.cta_language when empty. */
  ctaDefaults: {
    approved: readonly string[];
    rejected: readonly string[];
  };

  /** Quarterly seasonality for campaign timing and copy calendar. */
  seasonality: Record<Quarter, SeasonalWindow>;

  /** SEO + copy keyword banks. */
  keywordBank: {
    primary: readonly string[];
    serviceLevel: readonly string[];
  };

  /** Directories and listings required for local SEO and citations. */
  directories: {
    required: readonly string[];
    optional?: readonly string[];
    /** Industry-specific conditional directories (e.g. dental insurance directories). */
    conditional?: Record<string, readonly string[]>;
  };

  /** Regulatory notes that shape copy and design decisions. */
  regulatory: readonly RegulatoryNote[];

  /**
   * Compliance profile — applicable regulatory regimes + required legal
   * pages + visible-surface requirements for this vertical.
   *
   * Sibling to `regulatory` with a different job: `regulatory` shapes
   * copy and collateral ("you can't say 'specialist' unless board-certified");
   * `compliance` gates which legal pages, footer links, and audit cadence
   * a client site in this industry must ship.
   *
   * Consumers:
   *   - Content generation (generate-content-page-worker): refuses to
   *     complete a build if `requiredLegalPages` are absent from the
   *     scaffolded site structure.
   *   - Preflight (`design_preflight`): surfaces missing compliance pages
   *     as fail-loud errors before any mockup work begins.
   *   - Site generators (Astro blueprints): wire `requiredFooterLinks`
   *     into the footer archetype automatically.
   *
   * Per-client refinement lives in `company_profiles.compliance_profile`
   * (JSONB) — a client that *doesn't* receive federal funds drops
   * `section_1557` from the inherited pack defaults. The pack's
   * `regimes` are the ceiling of what's possible for the vertical, not
   * a floor — and `ada_title_iii` is always included for anything
   * serving the public.
   *
   * Canonical rules for healthcare clients live in
   * `content-system/compliance/healthcare-ada.md` — this field is the
   * machine-readable shape of what that doc mandates.
   *
   * Omit for industries without structured compliance requirements
   * (small-business, hospitality outside of healthcare-adjacent).
   */
  compliance?: IndustryCompliance;

  /** Pain points of the end customer/patient/tenant — informs empathy in copy. */
  customerPainPoints: readonly CustomerPainPoint[];

  /** Competitor archetypes — shape positioning and differentiation. */
  competitiveLandscape: readonly CompetitorArchetype[];

  /**
   * Optional industry-specific strategic considerations that go beyond
   * generic reference material (e.g. dental's retention economics,
   * independent-vs-DSO positioning, FFS transition). Populated only when
   * Brik has a defensible POV that should surface in briefs.
   */
  strategicConsiderations?: readonly StrategicConsideration[];

  /**
   * Billing / intake vocabularies — feed the portal's Intel tab Billing sheet.
   *
   * The two shapes split along validation posture:
   *
   * - `services` and `paymentTypes` remain **suggestion seeds** — flat string
   *   arrays rendered in AddableComboList comboboxes, free-text-extendable.
   * - `insuranceProviders`, `insurancePlans`, and `financing` are **locked
   *   vocabularies** — rendered in MultiSelect dropdowns with zero free-text.
   *   The portal filters any legacy non-matching values on first read
   *   (soft-migration pattern, same as brand taxonomy rollout).
   *
   * Fields:
   *
   * - `services`           Suggestion seeds — common service/offering names
   *                        for this vertical (free-text-extendable).
   * - `paymentTypes`       Suggestion seeds — industry-specific payment +
   *                        financing mechanisms (free-text-extendable).
   *                        NOTE: for the global, locked 14 payment methods
   *                        shared across all industries, import
   *                        PAYMENT_METHOD_VALUES from vocabularies/.
   * - `insuranceProviders` Locked carrier vocabulary — insurance companies
   *                        (e.g. Aetna, Cigna) this industry meaningfully
   *                        interacts with. Empty array for verticals where
   *                        insurance is not a factor.
   * - `insurancePlans`     Locked plan/program vocabulary — insurance
   *                        modalities and government programs distinct from
   *                        carriers (e.g. Medicaid, Out-of-Network PPO,
   *                        Fee-for-Service Only). Populated when the industry
   *                        has meaningful plan-type granularity beyond carrier.
   * - `financing`          Locked financing-product vocabulary — structured
   *                        financing products the business offers to
   *                        patients/residents (e.g. CareCredit plan, Sunbit,
   *                        Owner Financing). Distinct from point-of-sale
   *                        payment methods; populated per vertical.
   */
  services: readonly string[];
  paymentTypes: readonly string[];
  insuranceProviders: readonly string[];
  insurancePlans?: readonly string[];
  financing?: readonly string[];

  /**
   * Navigation IA defaults — the site-header archetype this industry ships.
   *
   * The BDS `<SiteHeader>` component (in `@brikdesigns/bds/blueprints-astro`)
   * reads this to render the correct shape at build time. Clients can
   * override any field per-engagement via the portal Intel tab, but the
   * pack's defaults represent Brik's curated recommendation for the
   * vertical's audience.
   *
   * Leave unset to get the `small-business` fallback (editorial-transparent,
   * 4 links, no mega-menu).
   */
  navigationIA?: NavigationIA;

  /**
   * Footer archetype — the canonical footer shape this industry ships.
   *
   * Parallel to `navigationIA` — a locked-vocabulary decision that tells
   * the BDS `<SiteFooter>` component (shipping in v0.2 of
   * `@brikdesigns/bds/blueprints-astro`) which footer pattern to render.
   * Clients override per-engagement via `company_profiles.footer_archetype`
   * once that column lands with the render surface.
   *
   * Leave unset to get `DEFAULT_FOOTER_ARCHETYPE` (`four_col_directory`).
   * See `content-system/vocabularies/footer-archetype.ts` for the locked
   * values and when to pick each.
   */
  footerArchetype?: FooterArchetype;

  /**
   * Page compositions — how each page-type this industry ships is
   * assembled from section blueprints. Keyed by a page-type slug that
   * matches an entry in `pageArchetypes`.
   *
   * **Source-of-truth discipline** (see docs/BLUEPRINTS-ASTRO-PACKAGE.md
   * §4.1): the pack owns composition. Content generation fills slots
   * inside the declared sequence; it does not choose blueprints. The
   * `visualNotes.blueprintKey` emitted by content workers is retained
   * as a drift-detection hint — if content gen disagrees with the
   * pack, the scaffold task logs a `source='composition_drift'` row on
   * `enrichment_log` but the pack's decision wins at render time.
   *
   * A client may override composition per-page via
   * `company_profiles.page_compositions` (JSONB). Override precedence:
   *   1. `company_profiles.page_compositions[pageType]` (client override)
   *   2. `pack.pageCompositions[pageType]`              (pack default)
   *   3. Fallback: the dispatcher renders whatever sections content
   *      provides, picking components by `visualNotes.blueprintKey`
   *      (or `<BlueprintFallback>` for unknown keys).
   *
   * Leave unset for industries whose pages are fully client-driven.
   * Dental, real-estate, and small-business packs all declare
   * compositions for the page types they enumerate in `pageArchetypes`.
   */
  pageCompositions?: Record<string, PageComposition>;

  /**
   * Industry-specific site audit — URL patterns + structured-fact extractors
   * that turn a crawl of the client's existing website into fields downstream
   * consumers can reason about programmatically (rather than LLM-paraphrasing
   * free-text scrape results every time).
   *
   * The portal runs universal extractors (services_offered, key_messages,
   * proof_points, social_links, tagline, value_proposition, target_audience)
   * on every audit regardless of industry. When a client's `industry_slug`
   * resolves to a pack with `siteAudit` defined, the pack's extractors run
   * in addition and land structured facts on industry-specific columns on
   * `company_profiles`.
   *
   * Example (dental): membership-plan tier extraction — turn
   * `/membership-plan-1` into structured
   * `{ tier, monthly_price, inclusions[], enrollment_cta }` records the
   * `/membership` page generator can render verbatim instead of
   * paraphrasing.
   *
   * Leave unset for industries without pack-specific audit logic —
   * universal extractors still run.
   */
  siteAudit?: IndustryPackSiteAudit;
}

// ─── Site audit contract ────────────────────────────────────────────────
//
// The industry pack declares which URL patterns it cares about and a set of
// named structured-fact extractors. The portal's website-audits worker
// resolves the pack by the client's industry_slug, routes matching scraped
// pages through the named extractors, and lands the result on
// company_profiles columns that downstream consumers (generate-content,
// preflight, decision-log) can read as canonical facts.
//
// Execution model:
//   1. Universal extractors run first (tagline, services, messaging, proofs).
//   2. For each page in the crawl:
//        - test `pagePatterns` against the URL/path/title
//        - for matches, invoke the corresponding extractor
//   3. Extractor output is validated (the pack declares target field shapes)
//      and merged into the profile via enrichProfile(source: 'website_audit').
//
// Extractor implementations live in the same pack file (dental.ts, etc.) —
// kept close to the industry narrative so reviewers see both the logic and
// the rationale in one place.

/** Rule for matching a scraped page to an extractor. */
export interface PagePattern {
  /** Stable identifier used in `siteAudit.extractors[].handles`. */
  key: string;
  /**
   * Match rules. All array entries are OR'd; an object with multiple keys
   * AND's the keys. At least one of (urlContains | pathMatches | titleMatches)
   * must match for the page to route to the handler. Patterns are
   * case-insensitive.
   */
  urlContains?: readonly string[];
  pathMatches?: readonly string[];
  titleMatches?: readonly string[];
  /** Human-readable description of what this pattern targets. */
  description: string;
}

/**
 * A named extractor that pulls structured facts out of one or more scraped
 * pages. The pack declares the output shape inline; the portal validates
 * the extractor's return value against `outputFields` before persisting.
 */
export interface SiteAuditExtractor {
  /** Stable identifier used in decision-log entries. */
  key: string;
  /** Human-readable label used in admin UI + docs. */
  label: string;
  /** Short description of what the extractor lands on the profile. */
  description: string;
  /** Page-pattern keys whose matched pages feed this extractor. */
  handles: readonly string[];
  /**
   * The `company_profiles` columns this extractor writes to, keyed by
   * field name. Values describe the expected shape. The portal's
   * enrichProfile allowlist must permit `source: 'website_audit'` to
   * write each field listed here.
   */
  outputFields: readonly string[];
}

export interface IndustryPackSiteAudit {
  /** URL / path / title patterns used to route pages to extractors. */
  pagePatterns: readonly PagePattern[];
  /** Industry-specific extractors that run in addition to universal ones. */
  extractors: readonly SiteAuditExtractor[];
  /**
   * Pack-declared schemas for structured fields. Keys match
   * `company_profiles` columns; values document the expected shape.
   * The portal uses these to validate extractor output before persisting.
   */
  fieldSchemas: Record<string, string>;
}

export interface NavigationIA {
  /** Overall archetype — see NAV_ARCHETYPE_VALUES for semantics. */
  archetype: NavArchetype;
  /**
   * Number of primary links the header surfaces (excluding the logo and
   * the utility cluster). Research target: 3-5. Higher counts produce
   * "bloated" feeling at the top of the page.
   */
  primaryLinkCount: number;
  /** Default primary link slots — clients override per-engagement. */
  primaryLinks: readonly NavigationLink[];
  /** Optional Services / Practice Areas / Specialties mega-menu spec. */
  servicesMegaMenu?: ServicesMegaMenu;
  /** Utility cluster spec — phone + primary CTA + optional secondary login. */
  utility: NavigationUtility;
  /** How the header responds to scroll. */
  scrollBehavior: ScrollBehavior;
  /** Mobile drawer shape. */
  mobileDrawer: DrawerPattern;
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface ServicesMegaMenu {
  /** The trigger label shown in the primary nav row. */
  triggerLabel: string;
  /** Number of columns in the mega-menu grid. Typically 3-4. */
  columns: number;
  /** Grouped categories — each category renders one column. */
  categories: readonly ServicesMegaMenuCategory[];
  /** Optional featured card anchored to the rightmost column. */
  featured?: ServicesMegaMenuFeature;
}

export interface ServicesMegaMenuCategory {
  /**
   * Optional audience scope ID — when present, components should bind
   * this value to a `[data-audience=X]` (or equivalent) attribute on
   * the rendered column so the client theme can re-bind canonical
   * brand tokens (`--background-brand-primary`, `--text-brand-primary`,
   * `--border-brand-primary`) per audience.
   *
   * BCS packs only express the semantic ID; visual binding is a
   * client-theme concern. Sites without per-audience theming render
   * all columns in the same canonical brand color (no visual loss,
   * content structure preserved).
   *
   * Lowercase, hyphenated. Examples: 'healthcare', 'land', 'commercial'.
   */
  audienceId?: string;
  /** Column heading text. */
  heading: string;
  /**
   * Optional icon slug (Phosphor or other supported set) shown in the
   * column header. Format: `{set}:{name}` — e.g. `ph:stethoscope`.
   */
  icon?: string;
  items: readonly ServicesMegaMenuItem[];
}

export interface ServicesMegaMenuItem {
  label: string;
  href: string;
  /** One-line descriptor shown under the label on hover / focus. */
  note?: string;
}

export interface ServicesMegaMenuFeature {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface NavigationUtility {
  /** Render a click-to-call phone link in the utility cluster. */
  showPhone: boolean;
  /** Primary CTA — the conversion action the vertical is optimizing for. */
  primaryCTA: NavigationCTA;
  /** Optional secondary CTA (e.g. patient login, member portal). */
  secondaryCTA?: NavigationCTA;
}

export interface NavigationCTA {
  label: string;
  href: string;
  /** Visual treatment — drives the button variant in `<SiteHeader>`. */
  variant: 'solid' | 'ghost' | 'link';
}

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface PageArchetype {
  /** Canonical slug used across portal, CMS seeds, and generated sitemaps. */
  slug: string;
  displayName: string;
  /** True if every site in this industry should include this page. */
  required: boolean;
  /**
   * Preferred blueprint keys from the BDS blueprint library (tagged by
   * personality/voice/visualStyle). The resolver uses these as starting
   * picks before client traits refine the shortlist.
   */
  blueprintDefaults?: readonly string[];
  description?: string;
}

/**
 * PageComposition — the ordered sequence of section blueprints that
 * compose a page of a given type. Sibling to `PageArchetype`:
 * PageArchetype declares the page exists + is required; PageComposition
 * declares how it's built.
 *
 * See docs/BLUEPRINTS-ASTRO-PACKAGE.md §4 for the full contract,
 * including resolver precedence (client override > pack default >
 * dispatcher-reads-content-hints) and the drift-detection rule
 * against content-gen's `visualNotes.blueprintKey` hints.
 *
 * Every `sections` entry MUST be a valid `Blueprint.key` in
 * `blueprints/blueprint-library.json`. A typecheck-time constraint
 * would require importing BlueprintKey here and generating it from
 * the JSON — for now, consistency is enforced at validator time by
 * the scaffold task's preflight. Adding a typecheck lint is a
 * follow-up (see Appendix A of the spec).
 */
export interface PageComposition {
  /**
   * The page archetype this composition renders — must match a slug
   * present in `pageArchetypes` on the same pack. Scaffold task
   * validates this at generation time.
   */
  pageArchetype: string;
  /**
   * Ordered list of blueprint keys. Order determines render sequence.
   * Keys reference `Blueprint.key` entries in
   * `blueprints/blueprint-library.json`.
   */
  sections: readonly string[];
  /**
   * Optional per-page nav archetype override. Rare — a landing page
   * might use a stripped-down nav while the rest of the site uses
   * the pack default.
   */
  navArchetype?: NavArchetype;
  /**
   * Optional per-page footer archetype override. Same rationale as
   * navArchetype — only use when a page type genuinely requires a
   * different footer shape than the pack default.
   */
  footerArchetype?: FooterArchetype;
}

export interface ServiceEntry {
  slug: string;
  displayName: string;
  /** Synonyms used when matching free-text service lists from intake. */
  aliases: readonly string[];
  /** Optional grouping, e.g. "preventive", "cosmetic", "restorative". */
  category?: string;
  regulatoryNote?: string;
}

export interface VocabularyAvoid {
  term: string;
  reason: string;
}

export interface SeasonalWindow {
  intent: 'low' | 'medium' | 'high';
  /** Short keywords describing what the window is about. */
  focus: readonly string[];
  notes?: string;
}

export interface RegulatoryNote {
  topic: string;
  summary: string;
  /** How this regulation constrains copy, design, or collateral. */
  implication: string;
  scope?: 'federal' | 'state' | 'local' | 'industry';
}

/**
 * Regulatory regimes that can apply to a client site.
 *
 * The pack's defaults declare the *maximum* set for the industry; a
 * per-client `company_profiles.compliance_profile` refines down based
 * on the client's facts (e.g. accepts Medicare → `section_1557` kept;
 * private-pay only → dropped). `ada_title_iii` is always included for
 * any site that serves the public.
 */
export type ComplianceRegime =
  /** ADA Title III — public accommodations (nearly every in-person business). */
  | 'ada_title_iii'
  /** HIPAA Privacy + Security Rules — covered entities and business associates. */
  | 'hipaa'
  /** Section 1557 of ACA — recipients of federal financial assistance (Medicare, Medicaid, HHS grants). */
  | 'section_1557'
  /** Section 504 Rehabilitation Act — same federal-funds trigger as 1557. */
  | 'section_504'
  /** Fair Housing Act — housing providers, property managers, landlords. */
  | 'fha'
  /** State dental board advertising rules — dentistry-specific. */
  | 'state_dental_board'
  /** State medical board advertising rules — medical practices outside dentistry. */
  | 'state_medical_board';

/**
 * A legal page the industry requires on every client site.
 *
 * `slug` maps 1:1 to the client site's URL path (`/legal/{slug}`). The
 * content generation pipeline creates a page stub when the client's
 * engagement is scaffolded; the canonical doc at
 * `content-system/compliance/healthcare-ada.md` owns the copy templates.
 *
 * `regime` ties the page to the regulatory requirement that mandates it
 * — so per-client refinement (e.g. dropping `section_1557`) automatically
 * removes the pages that were only required by that regime.
 */
export interface RequiredLegalPage {
  /** URL slug — page renders at `/legal/{slug}`. */
  slug: string;
  /** Human-readable title used in footer links, page H1, and sitemap. */
  displayName: string;
  /** The regime that mandates this page — if the regime drops, the page drops. */
  regime: ComplianceRegime;
  /** Short description of what the page covers — surfaces in audit logs. */
  description: string;
  /** True if content generation must block completion when this page is absent. */
  blocksSiteCompletion: boolean;
}

/**
 * Structured compliance profile for an industry.
 *
 * This is the machine-readable shape of the rules documented in
 * `content-system/compliance/healthcare-ada.md`. Content generation,
 * preflight, and the Astro blueprint layer all consume this to keep
 * compliance cooked into the pipeline rather than relying on human
 * QA to catch missing pages.
 */
export interface IndustryCompliance {
  /**
   * Regulatory regimes that *may* apply to clients in this industry.
   * Includes the full maximum set; per-client refinement happens in
   * `company_profiles.compliance_profile`.
   */
  regimes: readonly ComplianceRegime[];
  /**
   * Legal pages the industry mandates on every client site (modulo
   * per-client regime refinement). Each entry maps to a route at
   * `/legal/{slug}` on the generated site.
   */
  requiredLegalPages: readonly RequiredLegalPage[];
  /**
   * Additional footer link slugs the site footer must include beyond
   * the industry's standard `footerArchetype`. Typical healthcare
   * values: `['accessibility', 'notice-of-privacy-practices',
   * 'notice-of-nondiscrimination']`. Slugs match `requiredLegalPages[].slug`.
   */
  requiredFooterLinks?: readonly string[];
  /**
   * Audit cadence override. Most industries default to quarterly per the
   * canonical doc; set this only if the vertical has a stricter or
   * looser requirement than the default.
   */
  auditCadence?: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  /**
   * Pointer to the canonical compliance reference for this industry.
   * Default for healthcare verticals:
   * `@brikdesigns/bds/content-system/compliance/healthcare-ada.md`.
   * Allows non-healthcare verticals (e.g. property management) to
   * point at their own canonical doc when one lands.
   */
  canonicalDocPath?: string;
  /**
   * Optional free-text notes that explain vertical-specific nuance
   * beyond what the canonical doc covers. Surfaces in decision-log
   * entries when a pack's compliance profile is consulted.
   */
  notes?: string;
}

export interface CustomerPainPoint {
  summary: string;
  /** Optional segment — e.g. "long-term residents" vs "transient guests" for MHC/RV. */
  segment?: string;
  detail?: string;
}

export interface CompetitorArchetype {
  name: string;
  examples?: readonly string[];
  moat?: string;
  weakness?: string;
}

export interface StrategicConsideration {
  /** Short identifier — e.g. "retention-economics", "ffs-transition". */
  slug: string;
  title: string;
  /** Short summary of the POV. The full narrative lives in the .mdx file. */
  summary: string;
  /** When generating briefs, these conditions trigger surfacing this consideration. */
  appliesWhen?: readonly string[];
}
