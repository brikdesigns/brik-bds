import type { IndustrySlug, ParentIndustrySlug, Personality, Voice, VisualStyle } from '../vocabularies';
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
     * Billing / intake vocabularies — feed suggestion-driven comboboxes in
     * the portal's Intel tab (Billing sheet, PR B1).
     *
     * These are flat string arrays intentionally — they are suggestion seeds,
     * not locked enums. Clients can enter free-text values that don't appear here.
     *
     * - `services`           Common service/offering names for this vertical.
     * - `paymentTypes`       Accepted payment methods and financing mechanisms.
     * - `insuranceProviders` Relevant insurance carriers. Empty array for industries
     *                        where insurance is not a factor.
     */
    services: readonly string[];
    paymentTypes: readonly string[];
    insuranceProviders: readonly string[];
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
//# sourceMappingURL=industry-pack.d.ts.map