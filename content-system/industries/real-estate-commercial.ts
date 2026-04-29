import type { IndustryPack } from '../schema';

/**
 * Real Estate — Commercial (Boutique Brokerage).
 *
 * Graduated from `small-business` because boutique commercial real-estate
 * brokerages require a 3-column audience-pathway mega-menu (one column per
 * audience vertical: Healthcare / Land / Commercial) — a structural navigation
 * pattern the small-business pack explicitly flags as a graduation trigger.
 *
 * Primary reference client: Vale Partners (Middle Tennessee boutique CRE
 * brokerage). Intel seeded from `company_profiles` (value_proposition +
 * strategic_summary) for company_id = 2b7f5cdb-3ead-41d3-9bd4-e5f33b7ea106
 * (staging DB).
 *
 * Three co-equal service-line segments:
 *   1. Healthcare professionals (dental, veterinary, optometry) — primary revenue driver
 *   2. Commercial clients (retail, food service, professional services, fitness, banks, car washes) — co-equal revenue driver
 *   3. Land buyers (Middle Tennessee residential, agricultural, hunting) — secondary driver
 *
 * The `commercial` segment is the broader business-tenant audience: owners
 * looking for the right space, market, and lease terms to support how they
 * operate and grow. It is NOT a capital-allocator / investor audience —
 * MOB acquisition / 1031 / cap-rate framing is excluded by design. Where a
 * boutique broker handles owner-occupant purchases for any segment, those
 * are bundled into that segment's services (e.g. Practice Building Acquisition
 * under healthcare).
 *
 * Narrative body lives in ./real-estate-commercial.mdx.
 */
export const realEstateCommercial: IndustryPack = {
  slug: 'real-estate-commercial',
  parentIndustry: 'real-estate',
  displayName: 'Real Estate — Commercial Brokerage',
  version: '1.1.0',
  reviewCadence: 'quarterly',
  lastReviewed: '2026-04-29',

  affinities: {
    personality: ['Professional', 'Refined', 'Authoritative', 'Trustworthy', 'Bold'],
    voice: ['Expert', 'Direct', 'Authoritative'],
    visualStyle: ['Minimal', 'Modern', 'Classic'],
  },

  // ── Page archetypes ──────────────────────────────────────────────────
  pageArchetypes: [
    {
      slug: 'home',
      displayName: 'Home',
      required: true,
      // Stats intentionally absent — render only when content generation
      // emits a sectionType: 'stats' section. See issue #217.
      blueprintDefaults: ['hero_split_60_40', 'services_numbered_accordion', 'testimonials_featured_large', 'cta_dark_centered'],
      description: 'Lead with authority and segmentation. The homepage must orient three different audiences (Healthcare / Land / Commercial) without making any feel secondary. The hero introduces the broker; the navigation is the segmentation mechanism.',
    },
    {
      slug: 'healthcare',
      displayName: 'Healthcare Real Estate',
      required: true,
      blueprintDefaults: ['hero_interior_minimal', 'services_detail_two_column', 'process_grid_4step_numbered', 'testimonials_featured_large', 'cta_split_contact'],
      description: 'Dedicated audience pathway for healthcare professionals (dental, veterinary, optometry). Tone is clinically precise — these are educated professionals who expect competence. Lead with specialized knowledge, not generic real-estate-speak.',
    },
    {
      slug: 'land',
      displayName: 'Land Sales',
      required: true,
      blueprintDefaults: ['hero_fullbleed_photo', 'about_story_split', 'services_detail_two_column', 'cta_split_contact'],
      description: 'Middle Tennessee land: residential, agricultural, hunting. Local-knowledge-forward. Place-specific photography is essential — buyers want to feel the land before they call.',
    },
    {
      slug: 'commercial',
      displayName: 'Commercial Real Estate',
      required: true,
      // Commercial pages benefit from stats only when the broker has
      // representative deal volume / square-footage placed numbers.
      // Content generation decides.
      blueprintDefaults: ['hero_interior_minimal', 'services_detail_two_column', 'process_grid_4step_numbered', 'cta_dark_centered'],
      description: 'Businesses looking for the right space, market, and lease terms — retail, food service, professional services, fitness, banks, car washes, and other owner-occupant or tenant categories outside healthcare. Tone is operationally fluent: foot traffic, co-tenancy, build-out, and lease structure (CAM, exclusivity, escalation) are the levers, not cap rates. Page leans on process + a relevant proof point. NEVER frame this audience as "investors" or center capital-markets language — that is a different audience this pack does not serve.',
    },
    {
      slug: 'about',
      displayName: 'About',
      required: true,
      blueprintDefaults: ['hero_interior_minimal', 'about_story_split', 'testimonials_featured_large', 'cta_split_contact'],
      description: "Broker credibility is the moat for a boutique. This page should answer: who is the broker, what markets do they actually know, and why does boutique beat big-box for this client's deal.",
    },
    {
      slug: 'listings',
      displayName: 'Current Listings',
      required: false,
      blueprintDefaults: ['hero_interior_minimal', 'services_detail_two_column', 'cta_split_contact'],
      description: 'Active inventory. Segment by audience where possible (healthcare spaces / land / commercial). IDX or manual listing cards.',
    },
    {
      slug: 'contact',
      displayName: 'Contact',
      required: true,
      blueprintDefaults: ['cta_split_contact'],
    },
  ],

  // ── Services catalog ─────────────────────────────────────────────────
  servicesCatalog: [
    // Healthcare real estate
    { slug: 'healthcare-tenant-rep', displayName: 'Healthcare Tenant Representation', category: 'healthcare', aliases: ['tenant rep', 'practice location search', 'healthcare space'] },
    { slug: 'practice-site-selection', displayName: 'Practice Site Selection', category: 'healthcare', aliases: ['site selection', 'demographic analysis', 'location analysis'] },
    { slug: 'medical-lease-negotiation', displayName: 'Medical Office Lease Negotiation', category: 'healthcare', aliases: ['lease negotiation', 'TI negotiation', 'tenant improvement'] },
    { slug: 'healthcare-buyer-rep', displayName: 'Healthcare Property Buyer Representation', category: 'healthcare', aliases: ['buyer rep', 'medical office purchase', 'practice building'] },
    { slug: 'second-location', displayName: 'Second Location Strategy', category: 'healthcare', aliases: ['expansion', 'second location', 'multi-site strategy'] },
    // Land
    { slug: 'land-sales', displayName: 'Land Sales', category: 'land', aliases: ['land listing', 'acreage', 'rural land'] },
    { slug: 'land-buyer-rep', displayName: 'Land Buyer Representation', category: 'land', aliases: ['land buyer', 'land search', 'acreage buyer'] },
    { slug: 'agricultural-land', displayName: 'Agricultural Land', category: 'land', aliases: ['farm land', 'farmland', 'agriculture', 'row crop'] },
    { slug: 'hunting-land', displayName: 'Hunting & Recreational Land', category: 'land', aliases: ['hunting tract', 'recreational property', 'timber land'] },
    { slug: 'residential-land', displayName: 'Residential Development Land', category: 'land', aliases: ['residential land', 'development site', 'building lots'] },
    // Commercial
    { slug: 'commercial-tenant-rep', displayName: 'Commercial Tenant Representation', category: 'commercial', aliases: ['tenant rep', 'commercial space', 'business location search'] },
    { slug: 'retail-site-selection', displayName: 'Retail & Restaurant Site Selection', category: 'commercial', aliases: ['retail site selection', 'restaurant location', 'foot traffic analysis', 'trade area'] },
    { slug: 'commercial-lease-negotiation', displayName: 'Commercial Lease Negotiation', category: 'commercial', aliases: ['lease negotiation', 'CAM negotiation', 'co-tenancy', 'TI negotiation'] },
    { slug: 'commercial-buyer-rep', displayName: 'Commercial Property Buyer Representation', category: 'commercial', aliases: ['buyer rep', 'owner-occupant purchase', 'commercial acquisition'] },
    { slug: 'business-relocation', displayName: 'Business Relocation', category: 'commercial', aliases: ['relocation', 'move', 'space transition'] },
    { slug: 'multi-site-expansion', displayName: 'Multi-Site Expansion Strategy', category: 'commercial', aliases: ['second location', 'expansion', 'multi-site', 'rollout'] },
  ],

  // ── Vocabulary ──────────────────────────────────────────────────────
  vocabulary: {
    preferred: [
      // Healthcare segment
      'operatory', 'build-out', 'tenant improvement allowance', 'TI', 'demographic analysis',
      'patient flow', 'equipment requirements', 'lease negotiation', 'practice location',
      'second location', 'medical office space', 'healthcare real estate', 'practice building',
      'tenant representation', 'site selection',
      // Land segment
      'acreage', 'tract', 'farm land', 'timberland', 'recreational property', 'hunting lease',
      'Middle Tennessee', 'agricultural land', 'road frontage', 'creek bottom', 'hardwood',
      'row crop', 'pasture', 'platted subdivision',
      // Commercial segment
      'foot traffic', 'drive time', 'trade area', 'demographic analysis', 'co-tenancy',
      'anchor tenant', 'exclusivity clause', 'escalation clause', 'CAM', 'common area maintenance',
      'base rent', 'percentage rent', 'gross lease', 'NNN', 'triple net', 'full-service lease',
      'parking ratio', 'signage rights', 'retail frontage', 'rent abatement', 'white box',
      'vanilla shell', 'owner-occupant', 'SBA 504', 'visibility', 'daily traffic count',
      // General brokerage
      'boutique brokerage', 'exclusive representation', 'off-market', 'due diligence',
      'letter of intent', 'LOI', 'purchase agreement',
    ],
    avoid: [
      { term: 'we do it all', reason: 'Boutique positioning requires specialization language, not generalist claims.' },
      { term: 'one-stop shop', reason: 'Undermines the specialized-expertise positioning that differentiates a boutique from big-box brokerages.' },
      { term: 'affordable', reason: 'Commercial real-estate clients are not price-shopping; positions the broker as low-tier rather than high-expertise.' },
      { term: 'cheap', reason: 'Same as affordable — damages credibility with professional and business-owner audiences.' },
      { term: 'guaranteed returns', reason: 'Real estate investment carries market risk; guaranteeing returns is a regulatory violation (FINRA/SEC context) and misleading.' },
      { term: 'free consultation', reason: 'Devalues professional services. Use "complimentary discovery call" or "no-obligation conversation."' },
    ],
  },

  // ── CTA defaults ─────────────────────────────────────────────────────
  ctaDefaults: {
    approved: [
      'Schedule a Discovery Call',
      'Let\'s Talk About Your Practice Location',
      'Connect With a Specialist',
      'Request Property Information',
      'Start Your Site Search',
      'Explore Available Listings',
      'Talk to an Advisor',
    ],
    rejected: [
      'Book Now',
      'Buy Now',
      'Click Here',
      'Sign Up',
      'Get a Free Quote',
      'Call Us Today',
    ],
  },

  // ── Seasonality ──────────────────────────────────────────────────────
  seasonality: {
    Q1: {
      intent: 'medium',
      focus: ['budget-cycle-close', 'q1-planning', 'commercial-lease-renewal-windows'],
      notes: 'Jan–Mar: new fiscal year budget cycles activate for business expansions and practice expansions. Healthcare practices and commercial businesses finalizing location decisions before mid-year build-out targets. Many commercial leases renew at calendar year-end, so Q1 sees relocation searches accelerate.',
    },
    Q2: {
      intent: 'high',
      focus: ['spring-land-listing-peak', 'healthcare-lease-cycle', 'commercial-build-out-window'],
      notes: 'Apr–Jun: peak listing season for land (buyers active post-tax-season). Healthcare and commercial lease cycles often conclude Q2 for businesses targeting Q3–Q4 move-ins. Nashville market activity typically peaks in spring.',
    },
    Q3: {
      intent: 'high',
      focus: ['summer-land-activity', 'healthcare-build-out-planning', 'commercial-q4-opening-prep'],
      notes: 'Jul–Sep: active land-buyer season (hunting-land buyers planning fall season, agricultural buyers pre-harvest). Healthcare practices and commercial businesses contracting for spaces with Q4 or early-next-year build-outs and openings.',
    },
    Q4: {
      intent: 'high',
      focus: ['year-end-tax-planning', 'hunting-land-peak', 'commercial-renewal-pressure'],
      notes: 'Oct–Dec: hunting/recreational land at peak demand (hunting season). Commercial tenants with year-end lease expirations drive renewal-or-relocation decisions. Healthcare: slower deal-making but strong pipeline-building for Q1.',
    },
  },

  // ── Keyword bank ─────────────────────────────────────────────────────
  keywordBank: {
    primary: [
      'commercial real estate broker {city}',
      'healthcare real estate {city}',
      'medical office space for lease {city}',
      'dental office space {city}',
      'land for sale Middle Tennessee',
      'retail space for lease {city}',
      'restaurant space for lease {city}',
      'commercial space for lease {city}',
      'boutique commercial real estate',
    ],
    serviceLevel: [
      'dental office lease negotiation',
      'veterinary clinic space',
      'medical office tenant representation',
      'hunting land Middle Tennessee',
      'agricultural land Tennessee',
      'commercial tenant representation {city}',
      'retail site selection {city}',
      'restaurant site selection {city}',
      'practice location site selection',
    ],
  },

  // ── Directories ──────────────────────────────────────────────────────
  directories: {
    required: [
      'Google Business Profile',
      'Bing Places',
      'Apple Business Connect',
      'LinkedIn Company Page',
    ],
    optional: [
      'Facebook Business Page',
      'Yelp',
    ],
    conditional: {
      'commercial-listings': [
        'CoStar',
        'LoopNet',
        'Crexi',
        'CityFeet',
      ],
      'healthcare-listings': [
        'HealthcareRealEstate.com',
        'Colliers Healthcare',
        'CBRE Medical Office',
      ],
      'land-listings': [
        'LandWatch',
        'Lands of America',
        'Land And Farm',
        'Land.com',
        'Realtor.com Land',
      ],
    },
  },

  // ── Regulatory ───────────────────────────────────────────────────────
  regulatory: [
    {
      topic: 'Tennessee Real Estate License Law',
      summary: 'Licensed brokers must comply with TREC regulations including agency disclosure and representation rules.',
      implication: 'Agency relationship (buyer rep vs. seller rep vs. dual agency) must be disclosed. Copy claiming exclusive buyer or seller advocacy must be accurate and compliant with TREC agency disclosure forms.',
      scope: 'state',
    },
    {
      topic: 'Truth in Advertising — Property Value Claims',
      summary: 'FTC and state law prohibit misleading claims about property appreciation, returns, or financial outcomes.',
      implication: 'Copy that references owner-occupant property purchases, build-out cost recovery, or long-term real-estate value must avoid guaranteeing returns, implying guaranteed appreciation, or citing past performance without appropriate risk disclaimers.',
      scope: 'federal',
    },
    {
      topic: 'Healthcare Facility Real Estate (CON Laws)',
      summary: 'Tennessee has Certificate of Need (CON) requirements for certain healthcare facility types.',
      implication: 'Certain healthcare practice expansions (particularly inpatient/surgical) require CON review. Site selection copy for these clients should note that facility type determines permitting requirements — avoid implying site selection is the only approval needed.',
      scope: 'state',
    },
    {
      topic: 'Agricultural / Farmland Disclosures',
      summary: 'Land sales in Tennessee may involve agricultural land classification, flood plain designations, and easement disclosures.',
      implication: 'Listing copy for agricultural and hunting land must not misrepresent tillable acreage, hunting access, water rights, or easement burdens. Flood plain status should be disclosed or disclaimed.',
      scope: 'state',
    },
    {
      topic: 'ADA Accessibility (Web)',
      summary: 'WCAG 2.1 AA applies to the brokerage website itself.',
      implication: 'Property listing images require alt text. Contact forms and listing filters must be keyboard-navigable. Applies regardless of the healthcare focus of some clients.',
      scope: 'federal',
    },
  ],

  // ── Customer pain points ─────────────────────────────────────────────
  customerPainPoints: [
    // Healthcare segment — verbatim from Vale's audience_strategy
    {
      summary: 'First practice location decision — high stakes, unfamiliar process',
      segment: 'healthcare',
      detail: 'Healthcare professionals are highly educated in their clinical field but real estate is outside their training. The stakes are high (a 5–10 year lease commitment) and the process is opaque. They need a guide who removes the intimidation, not adds to it.',
    },
    {
      summary: 'Second location timing — when to expand, where to expand',
      segment: 'healthcare',
      detail: 'Existing practice owners face a different challenge: they know how to run a practice but are uncertain when expansion is financially sound and which market or corridor makes demographic sense.',
    },
    {
      summary: 'Buy vs. lease decision for long-term practice planning',
      segment: 'healthcare',
      detail: 'Owning the building vs. leasing is a wealth-planning question as much as a real-estate question. Advisors who understand both the practice economics and the property side provide meaningfully different guidance.',
    },
    {
      summary: 'Build-out complexity — equipment, layout, timeline coordination',
      segment: 'healthcare',
      detail: 'Medical and dental build-outs involve specialized contractors, equipment vendors, and permits. Clients need a broker who has navigated this before and can coordinate timelines and tenant improvement allowance negotiations.',
    },
    {
      summary: 'Understanding lease terms that affect practice profitability',
      segment: 'healthcare',
      detail: 'Operating expenses, renewal options, rent escalation clauses, and co-tenancy provisions directly affect practice P&L. Most healthcare professionals lack the context to evaluate these without a specialist.',
    },
    {
      summary: 'Finding space that supports patient acquisition goals',
      segment: 'healthcare',
      detail: 'Visibility, demographics, and competitive proximity all affect new-patient volume. A great lease in the wrong location is still a bad location decision.',
    },
    // Land segment
    {
      summary: 'Finding authentic place-specific land with honest representation',
      segment: 'land',
      detail: 'Land buyers in Middle Tennessee are often skeptical of out-of-area or big-box brokers who have not personally walked the tract. Local knowledge — creek access, soil type, hunting pressure, development pressure — is the differentiator.',
    },
    {
      summary: 'Navigating rural land due diligence (easements, flood, access)',
      segment: 'land',
      detail: 'Easements, landlocked parcels, flood plain classifications, and road frontage details are not always clear in online listings. Buyers need a broker who surfaces these proactively rather than letting them surface in due diligence.',
    },
    // Commercial segment
    {
      summary: 'Finding a location with the right foot traffic and demographics for the business model',
      segment: 'commercial',
      detail: 'Retail, restaurant, fitness, and other foot-traffic-dependent businesses live or die by site selection. Daily traffic count, trade-area demographics, and visibility from primary roads matter more than the lease rate. A broker who runs the demographic analysis before showing space saves the business from a bad-location lease.',
    },
    {
      summary: 'Negotiating commercial lease terms that protect business margins',
      segment: 'commercial',
      detail: 'Operating expense pass-throughs, CAM caps, percentage rent thresholds, exclusivity clauses, and rent escalation directly affect business P&L. Most business owners have not negotiated more than one or two leases and lack the leverage that an experienced broker brings to the table.',
    },
    {
      summary: 'Coordinating build-out timeline against opening date and TI allowance',
      segment: 'commercial',
      detail: 'Permits, contractors, equipment installation, and inspections all stack against the opening date. Tenant improvement allowance negotiations and build-out responsibility (landlord vs. tenant) shape both timeline and budget. A broker who has run dozens of build-outs anticipates the bottlenecks.',
    },
    {
      summary: 'Buy vs. lease decision for owner-occupant businesses',
      segment: 'commercial',
      detail: 'Established businesses with stable revenue often face the question of buying their own building (often via SBA 504) versus continuing to lease. The decision is part real-estate, part business-finance, and part tax strategy — and benefits from a broker who has walked clients through both paths.',
    },
    {
      summary: 'Co-tenancy and neighbor-mix decisions that affect business outcomes',
      segment: 'commercial',
      detail: 'For retail and food service, the businesses next door drive or kill traffic. Co-tenancy clauses, anchor-tenant departures, and shopping-center vacancy trajectory all shape the long-term value of a lease. A broker who reads the center, not just the deal, surfaces these signals.',
    },
  ],

  // ── Competitive landscape ─────────────────────────────────────────────
  competitiveLandscape: [
    {
      name: 'National full-service brokerages (CBRE, Cushman & Wakefield, JLL)',
      moat: 'Scale, institutional relationships, national listings database, dedicated healthcare practice groups.',
      weakness: 'Junior brokers on smaller deals; less local market texture; client is a number, not a relationship.',
    },
    {
      name: 'Regional mid-size commercial brokerages',
      examples: ['Colliers Tennessee', 'Avison Young Nashville'],
      moat: 'Regional brand, dedicated healthcare teams, depth of listings.',
      weakness: 'Mid-size bureaucracy; boutique clients often compete for broker attention with larger accounts.',
    },
    {
      name: 'Residential agents crossing over to commercial',
      moat: 'Existing client relationships, approachability.',
      weakness: 'Lack of commercial transaction experience, lease structure expertise, and healthcare-specific knowledge — a significant liability for clients with complex needs.',
    },
    {
      name: 'Healthcare-only national RE firms',
      examples: ['HREA (Healthcare Real Estate Advisors)', 'Transwestern Healthcare'],
      moat: 'Deep healthcare specialization, national footprint.',
      weakness: 'No land or general commercial capability; boutique clients with multi-asset needs (e.g. a healthcare professional who also owns retail property or land) need a second broker relationship.',
    },
    {
      name: 'Land-only brokerages and auctions',
      examples: ['United Country', 'Mossy Oak Properties'],
      moat: 'National land buyer networks, brand recognition in recreational market.',
      weakness: 'No commercial or healthcare specialization; clients who need both land and commercial services have a split relationship.',
    },
  ],

  // ── Strategic considerations ─────────────────────────────────────────
  strategicConsiderations: [
    {
      slug: 'boutique-vs-bigbox',
      title: 'Boutique Moat: Broker Continuity vs. Team-Rotation Structures',
      summary: 'The single most defensible advantage of a boutique brokerage is that the principal is the broker — not a team lead who delegates to junior associates. For healthcare clients making a 5–10 year lease commitment, knowing the person advising them will be accountable throughout the process (including build-out and renewal) is a genuine differentiator.',
      appliesWhen: ['client is comparing boutique to large-firm options', 'client has had a negative experience with junior associate handoffs'],
    },
    {
      slug: 'healthcare-specialist-advantage',
      title: 'Clinical Literacy as a Trust Signal',
      summary: 'Healthcare professionals recognize when a broker understands their world — operatory counts, equipment clearances, plumbing requirements for sterilization, patient flow implications of a floor plan. Demonstrating fluency in healthcare real estate language removes the "you don\'t understand my business" objection before it is raised.',
      appliesWhen: ['client is a dentist, veterinarian, optometrist, or other healthcare professional', 'client is planning a new or second location'],
    },
    {
      slug: 'multi-segment-portfolio',
      title: 'The Single-Broker Advantage Across Asset Classes',
      summary: 'A healthcare professional who also owns or operates a commercial business, or who has land interests, benefits from a broker who can serve all three needs. This reduces friction (one relationship, consistent advice) and positions the brokerage as a long-term partner rather than a transaction vendor.',
      appliesWhen: ['client has multiple asset class interests', 'client has mentioned land ownership alongside practice real estate needs', 'client operates additional businesses beyond a healthcare practice'],
    },
  ],

  // ── Billing / intake vocabularies ───────────────────────────────────
  services: [
    'Healthcare Tenant Representation',
    'Practice Site Selection (Demographic Analysis)',
    'Medical Office Lease Negotiation',
    'Tenant Improvement Allowance (TI) Advisory',
    'Buy vs. Lease Analysis',
    'Second Location Strategy',
    'Practice Building Acquisition',
    'Healthcare Property Disposition',
    'Land Sales (Residential)',
    'Land Sales (Agricultural)',
    'Land Sales (Hunting & Recreational)',
    'Land Buyer Representation',
    'Commercial Tenant Representation',
    'Retail & Restaurant Site Selection',
    'Commercial Lease Negotiation',
    'Commercial Property Buyer Representation',
    'Business Relocation',
    'Multi-Site Expansion Strategy',
  ],

  paymentTypes: [
    'Commission (Standard Brokerage)',
    'Buyer Representation Fee',
    'Tenant Representation Fee',
    'Flat-Fee Consulting Arrangement',
    'ACH / Bank Transfer',
    'Check',
    'Wire Transfer',
  ],

  // Insurance is not applicable to a commercial real-estate brokerage
  // billing relationship. Individual E&O (errors and omissions) insurance
  // is the broker's professional liability, not a billing item.
  insuranceProviders: [],

  // ── Navigation IA — 3-column audience-pathway mega-menu ──────────────
  //
  // This is the graduation trigger from small-business: a boutique commercial
  // RE brokerage with three co-equal audience verticals (Healthcare / Land /
  // Commercial) requires a structured audience-pathway mega-menu. The small-
  // business pack explicitly notes this pattern as a graduation condition.
  //
  // Each column represents one audience. `audienceAccents` and `audienceIcons`
  // are parallel to `servicesMegaMenu.categories` and enable the
  // `nav_mega_audience_pathways` blueprint to render distinct color cues per
  // column. Values map to Vale's palette primitives.
  //
  // Archetype: `editorial-transparent` — the brokerage brand leads at first
  // load; the header solidifies on scroll. Primary link count is tight at 4
  // (Services / About / Listings / Contact) — the mega-menu is the depth,
  // not the breadth.
  navigationIA: {
    archetype: 'editorial-transparent',
    primaryLinkCount: 4,
    primaryLinks: [
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Listings', href: '/listings' },
      { label: 'Contact', href: '/contact' },
    ],
    servicesMegaMenu: {
      triggerLabel: 'Services',
      columns: 3,
      categories: [
        {
          heading: 'Healthcare',
          items: [
            { label: 'Practice site selection', href: '/services/healthcare/site-selection', note: 'Demographic + patient-flow analysis' },
            { label: 'Lease negotiation', href: '/services/healthcare/lease-negotiation', note: 'TI allowance + favorable terms' },
            { label: 'Buy vs. lease analysis', href: '/services/healthcare/buy-vs-lease', note: 'Long-term practice planning' },
            { label: 'Second location strategy', href: '/services/healthcare/second-location', note: 'When + where to expand' },
          ],
        },
        {
          heading: 'Land',
          items: [
            { label: 'Residential land', href: '/services/land/residential', note: 'Middle Tennessee homesites' },
            { label: 'Agricultural land', href: '/services/land/agricultural', note: 'Farm + row-crop tracts' },
            { label: 'Hunting & recreational', href: '/services/land/hunting', note: 'Timber, creek, wildlife corridors' },
            { label: 'Land buyer representation', href: '/services/land/buyer-rep', note: 'Local-knowledge advantage' },
          ],
        },
        {
          heading: 'Commercial',
          items: [
            { label: 'Tenant representation', href: '/services/commercial/tenant-rep', note: 'Find the right space for the business' },
            { label: 'Retail & restaurant site selection', href: '/services/commercial/site-selection', note: 'Foot traffic + trade-area analysis' },
            { label: 'Lease negotiation', href: '/services/commercial/lease-negotiation', note: 'CAM, exclusivity, escalation, TI allowance' },
            { label: 'Buyer representation', href: '/services/commercial/buyer-rep', note: 'Owner-occupant purchase advisory' },
          ],
        },
      ],
      featured: {
        eyebrow: 'Not sure where to start?',
        heading: 'Tell us what you\'re trying to accomplish',
        body: 'Whether you\'re finding your first practice location, buying land, or moving your business into the right space — a 20-minute call sets the direction.',
        ctaLabel: 'Schedule a discovery call',
        ctaHref: '/contact',
      },
    },
    utility: {
      showPhone: true,
      primaryCTA: { label: 'Schedule a Call', href: '/contact', variant: 'solid' },
    },
    scrollBehavior: 'transparent-top-frosted-past-80',
    mobileDrawer: 'slide-left-panel',
    // Per-column audience accent colors — parallel to servicesMegaMenu.categories.
    // Index 0 = Healthcare, 1 = Land, 2 = Commercial.
    // Values reference Vale's palette primitives; consumer theme resolves these.
    audienceAccents: ['var(--color-moss-dark)', 'var(--color-olive-light)', 'var(--color-gold-light)'],
    // Per-column icon slugs — parallel to servicesMegaMenu.categories.
    // Icons pulled from BDS icon vocabulary (Phosphor icon set).
    audienceIcons: ['ph:stethoscope', 'ph:tree', 'ph:storefront'],
  },

  footerArchetype: 'four_col_directory',

  // ── Page compositions ────────────────────────────────────────────────
  pageCompositions: {
    home: {
      pageArchetype: 'home',
      sections: [
        'hero_split_60_40',
        'services_numbered_accordion',
        'testimonials_featured_large',
        'cta_dark_centered',
      ],
    },
    healthcare: {
      pageArchetype: 'healthcare',
      sections: [
        'hero_interior_minimal',
        'services_detail_two_column',
        'process_grid_4step_numbered',
        'testimonials_featured_large',
        'cta_split_contact',
      ],
    },
    land: {
      pageArchetype: 'land',
      sections: [
        'hero_fullbleed_photo',
        'about_story_split',
        'services_detail_two_column',
        'cta_split_contact',
      ],
    },
    commercial: {
      pageArchetype: 'commercial',
      sections: [
        'hero_interior_minimal',
        'services_detail_two_column',
        'process_grid_4step_numbered',
        'cta_dark_centered',
      ],
    },
    about: {
      pageArchetype: 'about',
      sections: [
        'hero_interior_minimal',
        'about_story_split',
        'testimonials_featured_large',
        'cta_split_contact',
      ],
    },
    listings: {
      pageArchetype: 'listings',
      sections: [
        'hero_interior_minimal',
        'services_detail_two_column',
        'cta_split_contact',
      ],
    },
    contact: {
      pageArchetype: 'contact',
      sections: ['cta_split_contact'],
    },
  },
};
