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
  heading: string;
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
