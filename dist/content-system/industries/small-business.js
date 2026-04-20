/**
 * Small Business industry pack — the catch-all baseline.
 *
 * Ported from industry-reference-small-business.md v1.0 (2026-04-01).
 * Narrative body lives in ./small-business.mdx.
 *
 * This pack is the DEFAULT_INDUSTRY_SLUG used when a client's vertical
 * has not yet been matched to a dedicated pack. Promote a vertical out of
 * this pack when Brik has 3+ clients in it OR seasonality/regulation/
 * terminology diverges meaningfully OR strategy docs repeat 60%+.
 */
export const smallBusiness = {
    slug: 'small-business',
    displayName: 'Small Business (General)',
    version: '1.1.0',
    reviewCadence: 'quarterly',
    lastReviewed: '2026-04-19',
    affinities: {
        personality: ['Professional', 'Approachable', 'Warm', 'Modern'],
        voice: ['Direct', 'Conversational', 'Expert'],
        visualStyle: ['Light', 'Modern', 'Minimal'],
    },
    pageArchetypes: [
        {
            slug: 'home',
            displayName: 'Home',
            required: true,
            blueprintDefaults: ['hero_split_60_40', 'services_detail_two_column', 'testimonials_3col_cards', 'cta_split_contact'],
        },
        {
            slug: 'about',
            displayName: 'About',
            required: true,
            blueprintDefaults: ['hero_interior_minimal', 'about_story_split'],
        },
        {
            slug: 'services',
            displayName: 'Services',
            required: true,
            blueprintDefaults: ['hero_interior_minimal', 'services_detail_two_column', 'faq_accordion_grouped'],
        },
        {
            slug: 'contact',
            displayName: 'Contact',
            required: true,
            blueprintDefaults: ['contact_form_split', 'cta_split_contact'],
        },
        {
            slug: 'testimonials',
            displayName: 'Testimonials',
            required: false,
            blueprintDefaults: ['testimonials_3col_cards', 'testimonials_featured_large'],
        },
        {
            slug: 'pricing',
            displayName: 'Pricing',
            required: false,
            description: 'Include when the vertical benefits from transparent pricing (increasingly most). Omit only when "call for quote" is the dominant model in the sub-vertical.',
        },
        {
            slug: 'service-areas',
            displayName: 'Service Areas',
            required: false,
            description: 'Required for service-area businesses (SABs) operating across multiple cities/neighborhoods. Skip for brick-and-mortar single-location businesses.',
        },
    ],
    servicesCatalog: [
    // Intentionally empty. The catch-all pack cannot enumerate services for
    // every vertical. The resolver should fall back to free-text service
    // capture from onboarding and flag for industry promotion when 3+
    // clients share a pattern.
    ],
    vocabulary: {
        preferred: [
            // Marketing + measurement
            'CAC', 'LTV', 'LTV:CAC', 'CPL', 'CPA', 'lead-to-close rate', 'show rate',
            'average ticket', 'repeat rate', 'NPS',
            // Local SEO
            'NAP', 'GBP', 'SAB', 'citation', 'local pack', 'map pack', 'schema markup',
            // Website + conversion
            'landing page', 'lead magnet', 'CTA', 'above-the-fold', 'hero',
            // Reputation
            'reputation management', 'review velocity', 'response rate', 'review diversity',
        ],
        avoid: [
            { term: 'best', reason: 'FTC requires substantiation for superiority claims. Unqualified "best" is legally risky and rarely earns trust.' },
            { term: '#1', reason: 'Same as "best" — unsubstantiated superiority claim.' },
            { term: 'leading', reason: 'Same as "best" unless specific market-share data backs it.' },
            { term: 'expert', reason: 'Requires credentials/licensure backing; misleading without them in regulated verticals.' },
            { term: 'guaranteed results', reason: 'Prohibited in most regulated verticals (health, legal, finance). Creates legal exposure in unregulated ones.' },
            { term: 'review gating', reason: 'Now largely prohibited on Google — do not design systems that filter reviews by sentiment before publishing.' },
        ],
    },
    ctaDefaults: {
        approved: [
            'Get a Free Quote',
            'Request a Consultation',
            'Schedule a Visit',
            'Contact Us',
            'See Pricing',
            'Get Started',
        ],
        rejected: [
            'Click Here',
            'Submit',
            'Buy Now',
        ],
    },
    seasonality: {
        Q1: {
            intent: 'medium',
            focus: ['tax-refund-services', 'new-year-fitness', 'professional-services-slow'],
            notes: 'Tax refund season (late Feb–Apr) boosts discretionary services. January surges fitness/wellness. Home services quiet until spring.',
        },
        Q2: {
            intent: 'high',
            focus: ['home-services', 'outdoor-services', 'event-services'],
            notes: 'Spring/summer ramp for home services, landscaping, events, wedding-adjacent businesses.',
        },
        Q3: {
            intent: 'medium',
            focus: ['back-to-school', 'family-services', 'seasonal-peak'],
            notes: 'Back-to-school affects family services. Peak for most outdoor/seasonal verticals.',
        },
        Q4: {
            intent: 'high',
            focus: ['holiday-retail', 'year-end-deductible-spend', 'december-slowdown'],
            notes: 'Holiday retail push Oct–Dec. Professional services slow in late December. Year-end deductible-driven spend on services.',
        },
    },
    keywordBank: {
        primary: [
            '{service} near me',
            'best {service} {city}',
            '{service} {neighborhood}',
            'local {service}',
            'affordable {service}',
            'trusted {service}',
        ],
        serviceLevel: [
            '{specific service} cost',
            '{specific service} reviews',
            'how to choose a {service}',
            '{service} consultation',
        ],
    },
    directories: {
        required: [
            'Google Business Profile',
            'Bing Places',
            'Apple Business Connect',
            'Facebook Business Page',
        ],
        optional: [
            'Yelp',
            'Better Business Bureau',
            'Nextdoor',
        ],
        conditional: {
            'home-services': ['Angi', 'Thumbtack', 'HomeAdvisor', 'Porch', 'Nextdoor'],
            'restaurants': ['Yelp', 'TripAdvisor', 'OpenTable', 'Resy', 'DoorDash', 'Uber Eats', 'Google Food Menu'],
            'legal-financial': ['Avvo', 'Justia', 'FindLaw', 'Super Lawyers', 'NAPFA'],
            'medical-wellness': ['Healthgrades', 'Zocdoc', 'Vitals'],
            'beauty': ['Vagaro', 'Booksy', 'StyleSeat', 'Fresha'],
            'fitness': ['ClassPass', 'Mindbody'],
            'real-estate': ['Zillow', 'Realtor.com', 'Redfin', 'Trulia'],
        },
    },
    regulatory: [
        {
            topic: 'Business Licensing',
            summary: 'State and local business licenses must be current and displayed correctly on the website.',
            implication: 'Site footer and About pages should surface license numbers where required by industry or state.',
            scope: 'state',
        },
        {
            topic: 'FTC Advertising Rules',
            summary: 'Truthful claims, substantiation for "best/#1/leading" language, clear and conspicuous disclosures.',
            implication: 'Never use superiority claims without data. Disclose paid relationships, affiliate links, sponsored content.',
            scope: 'federal',
        },
        {
            topic: 'FTC Endorsement Guides (2023 update)',
            summary: 'Testimonials must reflect typical results. Paid/incentivized reviews must be disclosed. Fake reviews carry civil penalties.',
            implication: 'Testimonial pages need "individual results vary" disclaimers where applicable. Any compensated reviews must be flagged.',
            scope: 'federal',
        },
        {
            topic: 'CAN-SPAM Act',
            summary: 'Email marketing must include physical address, unsubscribe link, honored within 10 days.',
            implication: 'All transactional and marketing email templates must meet these requirements out of the box.',
            scope: 'federal',
        },
        {
            topic: 'TCPA',
            summary: 'SMS/call marketing requires express consent. Violations carry heavy per-message fines.',
            implication: 'Any SMS automation must collect explicit opt-in before send. Document consent capture.',
            scope: 'federal',
        },
        {
            topic: 'ADA / WCAG 2.1 AA Accessibility',
            summary: 'Small businesses are frequent ADA-lawsuit targets.',
            implication: 'Minimum WCAG 2.1 AA compliance is non-negotiable across all Brik-delivered sites.',
            scope: 'federal',
        },
        {
            topic: 'CCPA / State Privacy Laws',
            summary: 'California, Virginia, Colorado, Connecticut, Utah, Texas, and growing list require privacy disclosures.',
            implication: 'Privacy policy and cookie consent required. Right-to-delete and opt-out mechanisms must be implemented.',
            scope: 'state',
        },
        {
            topic: 'Industry-specific licensing',
            summary: 'HIPAA (health), Gramm-Leach-Bliley (financial), state bar (legal), licensing boards (RE, contractors, cosmetology) all add requirements.',
            implication: 'Always cross-check regulatory scope during intake. Graduate client to a dedicated industry pack once vertical is identified.',
            scope: 'industry',
        },
    ],
    customerPainPoints: [
        { summary: 'Trust and legitimacy — is this business real, licensed, and reviewed?' },
        { summary: 'Pricing opacity — "call for quote" friction; customers want ranges or transparent pricing.' },
        { summary: 'Scheduling friction — phone-only booking, slow web response.' },
        { summary: 'Service-area confusion — do they come to me or do I come to them?' },
        { summary: 'Comparison shopping — customers typically get 2–3 quotes and read 3+ review platforms before choosing.' },
        { summary: 'Response time — leads go cold within hours; slow replies kill conversion.' },
        { summary: 'Quality anxiety — will the work be done right, on time, for the quoted price?' },
        { summary: 'Decision fatigue — too many options, inconsistent credentials, unclear differentiation.' },
    ],
    competitiveLandscape: [
        {
            name: 'Direct local competitors',
            moat: 'Proximity, word-of-mouth, local reviews.',
            weakness: 'Similar offerings create commoditization pressure.',
        },
        {
            name: 'Franchise / chain encroachment',
            examples: ['Mosquito Joe', 'Mr. Handyman', 'Anytime Fitness', 'Massage Envy', 'H&R Block'],
            moat: 'Bigger ad budgets, brand trust, convenience.',
            weakness: 'Lower personalization, less community embeddedness, slower local decision-making.',
        },
        {
            name: 'Marketplace aggregators',
            examples: ['Yelp', 'Thumbtack', 'Angi', 'HomeAdvisor', 'Houzz', 'TaskRabbit', 'Bark'],
            moat: 'Intercept bottom-of-funnel searches. Sell leads.',
            weakness: 'Race-to-bottom pricing; eroding lead quality; customer loyalty stays with the platform, not the business.',
        },
        {
            name: 'Platform disruptors',
            examples: ['DoorDash', 'UberEats', 'Airbnb', 'ClassPass', 'Rover'],
            moat: 'Change how customers discover and compare.',
            weakness: 'Take a significant cut; commoditize the experience.',
        },
        {
            name: 'Solopreneur informal competition',
            moat: 'Nextdoor/Facebook groups; price.',
            weakness: 'Unlicensed, uninsured, inconsistent quality — positioning opportunity for licensed businesses.',
        },
        {
            name: 'DIY / self-service alternatives',
            examples: ['YouTube tutorials', 'AI tools', 'Big-box retail'],
            moat: 'Free or near-free; customer self-sufficiency.',
            weakness: 'Doesn\'t work for complex, urgent, or high-stakes needs.',
        },
    ],
    // ── Billing / intake vocabularies ──────────────────────────────────────────
    // Feeds suggestion-driven comboboxes in the portal Intel tab (Billing sheet).
    // Flat string arrays — suggestion seeds, not locked enums.
    //
    // The catch-all pack keeps these intentionally broad. Graduate a vertical
    // to its own pack when specificity here feels inadequate for 3+ clients.
    services: [
        'Consulting',
        'Coaching',
        'Strategy',
        'Implementation',
        'Training',
        'Support / Maintenance',
        'Custom Project Work',
    ],
    paymentTypes: [
        'Cash',
        'Credit Card',
        'ACH / Bank Transfer',
        'Check',
        'PayPal',
        'Venmo for Business',
        'Stripe',
        'Square',
        'Invoice / Net 30',
        'Apple Pay',
        'Google Pay',
    ],
    // Not applicable for the generic small-business baseline. Individual
    // verticals that require insurance (health, legal, financial) should be
    // promoted to dedicated packs where insurance arrays are meaningful.
    insuranceProviders: [],
};
//# sourceMappingURL=small-business.js.map