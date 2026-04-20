/**
 * Real Estate — RV Parks & Manufactured Housing Communities (MHC).
 *
 * Ported from industry-reference-real-estate-rv-mhc.md v1.0 (2026-04-01).
 * Narrative body lives in ./real-estate-rv-mhc.mdx.
 *
 * This pack covers two distinct-but-related segments that typically share
 * an operator and website: RV parks (transient + extended-stay guests) and
 * MHCs (long-term residents). Pain points, seasonality, and regulatory
 * burden differ meaningfully between the two — many entries use the
 * `segment` field to flag which customer type they apply to.
 *
 * No Brik-specific strategic POV section yet — add `strategicConsiderations`
 * once Brik has a defensible perspective backed by client outcomes.
 */
export const realEstateRvMhc = {
    slug: 'real-estate-rv-mhc',
    parentIndustry: 'real-estate',
    displayName: 'Real Estate — RV Parks & MHC',
    version: '1.2.0',
    reviewCadence: 'quarterly',
    lastReviewed: '2026-04-20',
    affinities: {
        personality: ['Approachable', 'Warm', 'Professional', 'Modern', 'Bold'],
        voice: ['Direct', 'Expert', 'Conversational'],
        visualStyle: ['Light', 'Modern', 'Classic'],
    },
    pageArchetypes: [
        {
            slug: 'home',
            displayName: 'Home',
            required: true,
            blueprintDefaults: ['hero_fullbleed_photo', 'services_detail_two_column', 'stats_dark_bar', 'cta_split_contact'],
            description: 'Lead with a hero photo of the property — drone/aerial or amenity-forward. Trust signals (years in operation, number of sites, rating) pair well here.',
        },
        {
            slug: 'sites-availability',
            displayName: 'Sites & Availability',
            required: true,
            blueprintDefaults: ['hero_interior_minimal', 'features_bento_asymmetric', 'gallery_masonry_3col'],
            description: 'The #1 bounce-prevention page. Clear hookup info (30/50 amp, full hookup, pull-through vs back-in), rig-size limits, pricing, and direct online booking or reservation link.',
        },
        {
            slug: 'amenities',
            displayName: 'Amenities',
            required: true,
            blueprintDefaults: ['features_3col_icon_grid', 'gallery_masonry_3col'],
            description: 'Photo-heavy. Reality must match photos — customer pain point is "amenities look nothing like the listing."',
        },
        {
            slug: 'rules-policies',
            displayName: 'Rules & Policies',
            required: true,
            description: 'Pet policies, quiet hours, community rules, age restrictions (55+ must be HOPA-compliant), check-in/check-out times.',
        },
        {
            slug: 'reservations',
            displayName: 'Book a Stay',
            required: false,
            description: 'RV parks only. Direct online booking reduces phone friction. Integration with Campspot, Newbook, or RMS.',
        },
        {
            slug: 'homes-for-sale',
            displayName: 'Homes for Sale',
            required: false,
            description: 'MHC only. Park-owned home inventory or listings of resident-owned homes available for resale.',
        },
        {
            slug: 'lease-info',
            displayName: 'Lot Rental Info',
            required: false,
            description: 'MHC only. Lot rent pricing, utilities pass-through structure, lease terms, application process.',
        },
        {
            slug: 'community',
            displayName: 'Our Community',
            required: false,
            description: 'MHC only. About the community, events calendar, resident testimonials, neighborhood feel.',
        },
        {
            slug: 'contact',
            displayName: 'Contact',
            required: true,
            blueprintDefaults: ['contact_form_split', 'cta_split_contact'],
        },
    ],
    servicesCatalog: [
        { slug: 'nightly-sites', displayName: 'Nightly RV Sites', category: 'rv-transient', aliases: ['overnight', 'short stay', 'nightly rate'] },
        { slug: 'weekly-sites', displayName: 'Weekly RV Sites', category: 'rv-extended', aliases: ['weekly rate'] },
        { slug: 'monthly-sites', displayName: 'Monthly RV Sites', category: 'rv-extended', aliases: ['monthly rate', 'long-term'] },
        { slug: 'seasonal-sites', displayName: 'Seasonal Sites', category: 'rv-extended', aliases: ['snowbird', 'winter site', 'summer site'] },
        { slug: 'full-hookup', displayName: 'Full-Hookup Sites (FHU)', category: 'rv-site-type', aliases: ['FHU', 'full hookup', 'water sewer electric'] },
        { slug: 'big-rig-sites', displayName: 'Big-Rig Friendly Sites', category: 'rv-site-type', aliases: ['40 foot', 'big rig', 'class A'] },
        { slug: 'pull-through', displayName: 'Pull-Through Sites', category: 'rv-site-type', aliases: ['pull through'] },
        { slug: 'cabins', displayName: 'Cabins / Park Models', category: 'rv-lodging', aliases: ['park model', 'cabin rental', 'tiny home'] },
        { slug: 'lot-rental', displayName: 'Manufactured Home Lot Rental', category: 'mhc-core', aliases: ['lot rent', 'pad rent', 'space rent', 'site rent'] },
        { slug: 'home-sales', displayName: 'Manufactured Home Sales', category: 'mhc-core', aliases: ['park-owned home', 'POH', 'home for sale', 'resale'] },
        { slug: 'home-placement', displayName: 'Home Placement Services', category: 'mhc-ops', aliases: ['move-in', 'setup', 'placement'] },
        { slug: 'clubhouse-events', displayName: 'Clubhouse & Community Events', category: 'amenity', aliases: ['clubhouse', 'events', 'activities'] },
    ],
    amenitiesCatalog: [
        // Recreation & Outdoor
        { slug: 'pool', displayName: 'Pool', category: 'recreation', aliases: ['swimming pool', 'outdoor pool', 'indoor pool'] },
        { slug: 'hot-tub', displayName: 'Hot Tub/Spa', category: 'recreation', aliases: ['spa', 'jacuzzi', 'whirlpool'] },
        { slug: 'playground', displayName: 'Playground', category: 'recreation', aliases: ['kids playground', 'play area'] },
        { slug: 'mini-golf', displayName: 'Mini Golf', category: 'recreation', aliases: ['miniature golf', 'putt putt'] },
        { slug: 'picnic-areas', displayName: 'Picnic Areas', category: 'recreation', aliases: ['picnic tables', 'picnic pavilion'] },
        { slug: 'fire-pits', displayName: 'Fire Pits', category: 'recreation', aliases: ['fire ring', 'community fire pit'] },
        { slug: 'fishing-access', displayName: 'Fishing Pond/Lake Access', category: 'recreation', aliases: ['fishing', 'lake access', 'pond access'] },
        { slug: 'boat-launch', displayName: 'Boat Launch', category: 'recreation', aliases: ['boat ramp', 'watercraft launch'] },
        { slug: 'boat-storage', displayName: 'Boat Storage', category: 'recreation', aliases: ['watercraft storage', 'marina storage'] },
        { slug: 'basketball-court', displayName: 'Basketball Court', category: 'recreation', aliases: ['hoop', 'basketball'] },
        { slug: 'pickleball-court', displayName: 'Pickleball Court', category: 'recreation', aliases: ['pickleball'] },
        { slug: 'tennis-court', displayName: 'Tennis Court', category: 'recreation', aliases: ['tennis'] },
        { slug: 'horseshoe-pits', displayName: 'Horseshoe Pits', category: 'recreation', aliases: ['horseshoes'] },
        { slug: 'disc-golf', displayName: 'Disc Golf', category: 'recreation', aliases: ['frisbee golf'] },
        { slug: 'dog-park', displayName: 'Dog Park', category: 'recreation', aliases: ['off-leash area', 'pet park'] },
        { slug: 'nature-trails', displayName: 'Nature Trails', category: 'recreation', aliases: ['walking trails', 'hiking trails'] },
        { slug: 'bike-rentals', displayName: 'Bike Rentals', category: 'recreation', aliases: ['bicycle rentals', 'bike share'] },
        // Facilities & Utilities
        { slug: 'clubhouse', displayName: 'Clubhouse/Community Room', category: 'facilities', aliases: ['clubhouse', 'community center', 'community room'] },
        { slug: 'fitness-center', displayName: 'Fitness Center', category: 'facilities', aliases: ['gym', 'workout room', 'exercise room'] },
        { slug: 'laundry-facilities', displayName: 'Laundry Facilities', category: 'facilities', aliases: ['laundry room', 'washers and dryers', 'laundromat'] },
        { slug: 'restrooms-showers', displayName: 'Restrooms/Showers', category: 'facilities', aliases: ['bathhouse', 'shower house', 'public restrooms'] },
        { slug: 'camp-store', displayName: 'Camp Store', category: 'facilities', aliases: ['general store', 'camp shop', 'convenience store'] },
        { slug: 'propane-station', displayName: 'Propane Fill Station', category: 'facilities', aliases: ['propane', 'lp fill', 'gas station'] },
        { slug: 'rv-wash-station', displayName: 'RV Wash Station', category: 'facilities', aliases: ['rig wash', 'rv wash'] },
        { slug: 'dump-station', displayName: 'Dump Station', category: 'facilities', aliases: ['sewer dump', 'waste dump'] },
        { slug: 'mail-service', displayName: 'Mail/Package Service', category: 'facilities', aliases: ['mail delivery', 'package receiving'] },
        { slug: 'wifi-common', displayName: 'Wi-Fi (common areas)', category: 'facilities', aliases: ['public wifi', 'clubhouse wifi'] },
        { slug: 'wifi-sites', displayName: 'Wi-Fi (individual sites)', category: 'facilities', aliases: ['site wifi', 'in-site wifi', 'pad wifi'] },
        { slug: 'cable-tv', displayName: 'Cable TV Hookups', category: 'facilities', aliases: ['cable tv', 'tv hookup'] },
        // Site Infrastructure
        { slug: 'full-hookup-site', displayName: 'Full Hookup (Electric + Water + Sewer)', category: 'site-infrastructure', aliases: ['fhu', 'full hookup', 'water sewer electric'] },
        { slug: 'partial-hookup', displayName: 'Partial Hookup', category: 'site-infrastructure', aliases: ['partial service', 'water and electric only'] },
        { slug: 'dry-sites', displayName: 'Dry/Primitive Sites', category: 'site-infrastructure', aliases: ['no hookup', 'primitive camping', 'boondocking'] },
        { slug: 'amp-30', displayName: '30 Amp', category: 'site-infrastructure', aliases: ['30 amp service', '30a'] },
        { slug: 'amp-50', displayName: '50 Amp', category: 'site-infrastructure', aliases: ['50 amp service', '50a'] },
        { slug: 'pull-through-sites', displayName: 'Pull-Through Sites', category: 'site-infrastructure', aliases: ['pull through', 'drive through'] },
        { slug: 'back-in-sites', displayName: 'Back-In Sites', category: 'site-infrastructure', aliases: ['back in'] },
        { slug: 'concrete-pads', displayName: 'Concrete Pads', category: 'site-infrastructure', aliases: ['concrete', 'paved pads'] },
        { slug: 'covered-sites', displayName: 'Covered Sites', category: 'site-infrastructure', aliases: ['shade structure', 'covered parking'] },
        { slug: 'grass-pads', displayName: 'Grass Pads', category: 'site-infrastructure', aliases: ['grass sites', 'natural sites'] },
        // Security & Access
        { slug: 'gated-access', displayName: 'Gated Access', category: 'security', aliases: ['gate', 'secure entry', 'key code entry'] },
        { slug: 'security-cameras', displayName: 'Security Cameras', category: 'security', aliases: ['cctv', 'surveillance'] },
        { slug: 'on-site-management', displayName: 'On-Site Management', category: 'security', aliases: ['on-site manager', 'resident manager'] },
        { slug: '24-hour-emergency', displayName: '24-Hour Emergency Contact', category: 'security', aliases: ['24/7 contact', 'emergency phone'] },
    ],
    vocabulary: {
        preferred: [
            // Site & infrastructure
            'pad', 'site', 'lot', 'space', 'full hookup', 'FHU', '30 amp', '50 amp', 'pedestal',
            'pull-through', 'back-in', 'big rig', 'Class A', 'Class B', 'Class C', 'fifth wheel',
            'travel trailer', 'toy hauler', 'park model', 'tiny home', 'manufactured home', 'modular home',
            // Operations
            'lot rent', 'site rent', 'space rent', 'pad rent', 'nightly rate', 'weekly rate',
            'monthly rate', 'seasonal rate', 'snowbird rate', 'transient guest', 'extended-stay',
            'workcamper', 'camp host', 'park-owned home', 'POH', 'tenant-owned home', 'TOH',
            'bathhouse', 'clubhouse', 'amenity',
            // Business & investment
            'cap rate', 'NOI', 'economic occupancy', 'physical occupancy', 'lot fill',
            'infill', 'value-add', 'repositioning', 'MHC',
            // Legal & tenancy
            'lot lease', 'residency agreement', 'community rules', 'house rules', 'HOPA',
            '55+ community', 'Fair Housing Act', 'chattel loan', 'real property loan',
        ],
        avoid: [
            { term: 'trailer park', reason: 'Dated, pejorative. Use "manufactured housing community" or "MHC."' },
            { term: 'mobile home', reason: 'Historically accurate for pre-1976 units; current term is "manufactured home."' },
            { term: 'permanent residence', reason: 'Used in RV park marketing creates legal and zoning risk — most jurisdictions cap length of stay.' },
            { term: 'affordable housing', reason: 'Restricts brand positioning and can trigger stigma. Use as one attribute among many, not sole positioning.' },
            { term: 'senior', reason: 'In 55+ community messaging, must be HOPA-compliant. Casual use without the HOPA framing creates FHA risk.' },
            { term: 'private community', reason: 'Language implying exclusivity can be read as protected-class exclusion under FHA.' },
            { term: 'exclusive community', reason: 'Same as "private" — FHA discrimination risk in how exclusivity is phrased.' },
            { term: 'adult community', reason: 'Only compliant if HOPA requirements are met AND copy frames it properly. Default to avoiding without legal review.' },
            { term: 'no children', reason: 'Direct FHA familial-status violation unless HOPA-compliant 55+ certification is in place.' },
        ],
    },
    ctaDefaults: {
        approved: [
            'Reserve Your Site',
            'Check Availability',
            'Book Your Stay',
            'Schedule a Tour',
            'View Homes for Sale',
            'Apply for Residency',
            'Request Info',
        ],
        rejected: [
            'Book Now',
            'Buy Now',
            'Click Here',
            'Sign Up',
        ],
    },
    seasonality: {
        Q1: {
            intent: 'high',
            focus: ['snowbird-season', 'sun-belt-rv-peak', 'mhc-slow'],
            notes: 'Jan–Mar: snowbird season in Sun Belt (AZ, FL, TX, Southern CA, Gulf Coast) for RV. Extended-stay bookings dominate. MHC move-ins are at annual low; tax refund inquiries late Q1.',
        },
        Q2: {
            intent: 'high',
            focus: ['rv-shoulder', 'mhc-move-in-peak', 'workcamper-arrivals'],
            notes: 'Apr–Jun: RV shoulder season with spring travelers, workcampers arriving for summer. MHC peak move-in season (weather, school calendar).',
        },
        Q3: {
            intent: 'high',
            focus: ['family-vacation', 'weekend-warriors', 'mhc-move-in-continued'],
            notes: 'Jul–Aug: peak family/vacation season in northern and mountain RV markets. MHC continues peak move-in season.',
        },
        Q4: {
            intent: 'medium',
            focus: ['fall-foliage', 'holiday-lull', 'sun-belt-rv-rebuild', 'mhc-rate-planning'],
            notes: 'Oct–Dec: fall foliage short window for northern RV markets → rapid drop-off → holiday lull. Sun Belt parks fill back up late Q4. MHC: slow leasing; internal budget/rate-increase planning.',
        },
    },
    keywordBank: {
        primary: [
            'RV park {city}',
            'RV resort {region}',
            'manufactured home community {city}',
            'MHC {city}',
            'mobile home park {city}',
            '55+ community {city}',
            'snowbird park {region}',
            'monthly RV site {city}',
        ],
        serviceLevel: [
            'full hookup RV sites',
            'pull-through RV sites',
            'big rig RV park',
            'park model home',
            'homes for sale manufactured',
            'lot rent {city}',
            'RV park with pool',
            'pet-friendly RV park',
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
            'Nextdoor',
        ],
        conditional: {
            'rv-parks': [
                'Good Sam',
                'Campendium',
                'RV Life',
                'RV Parky',
                'The Dyrt',
                'Hipcamp',
                'AllStays',
                'Roadtrippers',
            ],
            'mhc': [
                'MHVillage',
                'Datacomp / JLT Reports',
                'Apartments.com',
                'Zillow Rentals',
                'Facebook Marketplace',
                'MHP Home Source',
                'MobileHome.net',
            ],
        },
    },
    regulatory: [
        {
            topic: 'Fair Housing Act (FHA)',
            summary: 'Federal prohibition on discrimination based on race, color, national origin, religion, sex, familial status, disability.',
            implication: 'Affects advertising copy. "Adult community" and "no children" are restricted. Imagery must not imply exclusion of protected classes. Language like "private" or "exclusive" can trigger scrutiny if it implies protected-class exclusion.',
            scope: 'federal',
        },
        {
            topic: 'Truth-in-advertising (FTC)',
            summary: 'Amenity and availability claims must be accurate and substantiated.',
            implication: 'Pool/Wi-Fi/bathhouse photos must reflect current reality. Occupancy and availability claims must be current. "Luxury," "resort," "five-star" require substantiation.',
            scope: 'federal',
        },
        {
            topic: 'State Mobile Home Park Acts / Landlord-Tenant Law',
            summary: 'State-by-state tenant protections for MHC residents — highly variable.',
            implication: 'CA, FL, OR, MI, NY have strong protections: rent increase notice periods, lease renewal rights, resident right-to-purchase on sale. Marketing about rates, leases, and community changes must comply with the applicable state law.',
            scope: 'state',
        },
        {
            topic: 'HOPA (Housing for Older Persons Act)',
            summary: 'Federal exemption allowing age-restricted (55+) housing if specific occupancy and intent requirements are met.',
            implication: 'A 55+ community can legally restrict by age ONLY if HOPA-compliant. Marketing must reflect HOPA framing. Non-compliant communities using "55+" language face FHA risk.',
            scope: 'federal',
        },
        {
            topic: 'Lot Lease Agreements',
            summary: 'Most states require written lot leases for MHC residents; some require specific disclosures.',
            implication: 'Website should clarify lease terms, utility pass-through, community rules, sale procedures. Some states require specific disclosures be accessible to prospective residents.',
            scope: 'state',
        },
        {
            topic: 'Chattel vs Real Property Financing',
            summary: 'Manufactured homes often titled like vehicles (DMV) rather than real estate — affects financing and messaging.',
            implication: 'Financing disclosures under CFPB oversight. Marketing about home affordability must distinguish between chattel loans (higher rates) and real-property-titled homes.',
            scope: 'federal',
        },
        {
            topic: 'Rent Control',
            summary: 'Local to specific cities/states; affects rent increase communications.',
            implication: 'Rate-change messaging must comply with applicable rent control and notice-period laws.',
            scope: 'local',
        },
        {
            topic: 'Local Land-Use / Zoning (RV parks)',
            summary: 'Length-of-stay caps (often 14–30 days) exist in many jurisdictions.',
            implication: 'RV park marketing cannot promote "permanent" or "live here full-time" in jurisdictions with stay caps. Extended-stay messaging must align with zoning.',
            scope: 'local',
        },
        {
            topic: 'Transient Occupancy Tax (TOT / bed tax)',
            summary: 'Applies to short-stay RV guests in many counties.',
            implication: 'Rate communications and booking confirmations must include applicable TOT disclosures.',
            scope: 'local',
        },
        {
            topic: 'ADA Accessibility',
            summary: 'Required for amenity buildings; site-level accessibility varies.',
            implication: 'Accessibility info (ADA-compliant sites, accessible bathhouse, accessible clubhouse) should be surfaced on the site. WCAG 2.1 AA for the website itself.',
            scope: 'federal',
        },
    ],
    customerPainPoints: [
        // RV Parks
        { summary: 'Availability and reservation confusion — is the site open? can I book online?', segment: 'rv-transient' },
        { summary: 'Hookup details unclear — 30 vs 50 amp, water/sewer, full hookup vs partial, pull-through vs back-in.', segment: 'rv-transient' },
        { summary: 'Rig size limits — big rigs (40\'+) get filtered out of many parks.', segment: 'rv-transient' },
        { summary: 'Pet policies, quiet hours, community rules need to be clear upfront.', segment: 'rv-transient' },
        { summary: 'Amenities reality vs photos — is the pool open? is Wi-Fi usable? is the bathhouse clean?', segment: 'rv-transient' },
        { summary: 'Seasonal closures and rate transparency.', segment: 'rv-transient' },
        // MHC
        { summary: 'Lot rent increases and predictability.', segment: 'mhc-resident' },
        { summary: 'Community rules, pet policies, age restrictions (55+) need clarity.', segment: 'mhc-resident' },
        { summary: 'Home placement / move-in logistics and costs.', segment: 'mhc-resident' },
        { summary: 'Management responsiveness and reputation.', segment: 'mhc-resident' },
        { summary: 'Home ownership vs renting a park-owned home confusion.', segment: 'mhc-resident' },
        { summary: 'Financing barriers — "chattel" loans on the home itself carry higher rates than site-built.', segment: 'mhc-resident' },
        { summary: 'Resale restrictions and community approval of buyers.', segment: 'mhc-resident' },
        // Shared
        { summary: 'Natural disaster season (hurricane, wildfire, flood) directly affects reputation and occupancy.' },
    ],
    competitiveLandscape: [
        {
            name: 'National REITs / large RV operators',
            examples: ['Sun Communities (Sun Outdoors)', 'Equity LifeStyle Properties (ELS / Thousand Trails / Encore RV Resorts)', 'Roberts Resorts', 'Blue Water'],
            moat: 'Scale, portfolio booking, brand trust, member networks.',
            weakness: 'Commoditized experience; independents can differentiate on character, niche audiences, and location-specific appeal.',
        },
        {
            name: 'RV franchise / brand networks',
            examples: ['KOA (Kampgrounds of America)', 'Jellystone Park', 'Yogi Bear\'s franchises'],
            moat: 'Brand recognition, family-friendly standardization, national ad spend.',
            weakness: 'Less unique character; locked into franchise fees and standards.',
        },
        {
            name: 'National MHC operators',
            examples: ['Sun Communities', 'Equity LifeStyle', 'RHP Properties', 'YES! Communities', 'Inspire Communities', 'Flagship', 'Cal-Am'],
            moat: 'Capital, operational scale, resident services.',
            weakness: 'Perceived as corporate landlords — local operators can win on relationship and responsiveness.',
        },
        {
            name: 'Mid-size and family-owned MHC operators',
            moat: 'Personal relationships, community stewardship, long-time residents.',
            weakness: 'Susceptible to acquisition pressure; smaller ad budgets.',
        },
        {
            name: 'Public-land RV competition',
            examples: ['State parks', 'National Forest dispersed camping', 'Corps of Engineers sites'],
            moat: 'Cheaper, natural settings.',
            weakness: 'Fewer amenities, limited reservations, no hookups.',
        },
        {
            name: 'Apartments & SFR (for MHC)',
            moat: 'Newer inventory, more financing options for renters.',
            weakness: 'Higher monthly cost; no path to home ownership.',
        },
        {
            name: 'Boondocking / alternative platforms',
            examples: ['Harvest Hosts', 'Hipcamp', 'Boondockers Welcome'],
            moat: 'Price, unique experiences.',
            weakness: 'Bottom-of-market positioning; not a substitute for full-service parks.',
        },
    ],
    // ── Billing / intake vocabularies ──────────────────────────────────────────
    // Feeds suggestion-driven comboboxes in the portal Intel tab (Billing sheet).
    // Flat string arrays — suggestion seeds, not locked enums.
    services: [
        // RV park — site types
        'Nightly RV Sites',
        'Weekly RV Sites',
        'Monthly RV Sites',
        'Seasonal RV Sites',
        'Full-Hookup Sites (FHU)',
        'Electric-Only Sites',
        'Dry Camping / Primitive Sites',
        'Pull-Through Sites',
        'Back-In Sites',
        'Big-Rig Friendly Sites (40+ ft)',
        // RV park — lodging
        'Cabin Rentals',
        'Park Model Rentals',
        // RV park — amenities / add-ons
        'Wi-Fi / Internet Access',
        'Laundry Facilities',
        'Bathhouse / Restroom Facilities',
        'Pool & Recreation Access',
        'Dog Park',
        'Mail & Package Service',
        // MHC — core
        'Manufactured Home Lot Rental',
        'Manufactured Home Sales (Park-Owned)',
        'Manufactured Home Resales (Resident-Owned)',
        'Home Placement Services',
        // MHC — community
        'Clubhouse & Community Events',
        'On-Site Management',
        'Utilities Pass-Through (Water / Sewer / Trash)',
        'Storage Unit Rental',
    ],
    paymentTypes: [
        'Cash',
        'Check',
        'ACH / Bank Transfer',
        'Visa / Mastercard / Discover',
        'American Express',
        'Online Rent Payment Portal',
        'Money Order',
        'Owner / Seller Financing',
        'Chattel Loan (through lender)',
        'Conventional Mortgage (land + home)',
        'FHA Title I Loan',
        'VA Loan',
        'Apple Pay',
        'Google Pay',
    ],
    // Insurance is not a factor for RV park or MHC operators in the context
    // of their billing relationship with guests/residents. Individual guest
    // travel insurance or resident homeowner insurance is handled privately.
    insuranceProviders: [],
};
//# sourceMappingURL=real-estate-rv-mhc.js.map