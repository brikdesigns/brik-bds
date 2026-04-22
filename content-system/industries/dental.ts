import type { IndustryPack } from '../schema';

/**
 * Dental industry pack.
 *
 * Ported from industry-reference-dental.md v1.1 (2026-04-01).
 * Narrative body lives in ./dental.mdx.
 *
 * Brik POV: retention over acquisition, independent over DSO,
 * long-term insurance de-risking (FFS transition). These are encoded
 * in `strategicConsiderations` and should surface in generated briefs
 * for established independent practices.
 */
export const dental: IndustryPack = {
  slug: 'dental',
  parentIndustry: 'medical',
  displayName: 'Dental',
  version: '1.4.0',
  reviewCadence: 'quarterly',
  lastReviewed: '2026-04-20',

  affinities: {
    personality: ['Professional', 'Warm', 'Approachable', 'Refined', 'Modern'],
    voice: ['Empathetic', 'Expert', 'Conversational'],
    visualStyle: ['Light', 'Classic', 'Minimal'],
  },

  pageArchetypes: [
    {
      slug: 'home',
      displayName: 'Home',
      required: true,
      blueprintDefaults: ['hero_split_60_40', 'services_detail_two_column', 'stats_centered_light', 'testimonials_3col_cards', 'cta_split_contact'],
    },
    {
      slug: 'meet-the-doctor',
      displayName: 'Meet the Doctor',
      required: true,
      blueprintDefaults: ['hero_interior_minimal', 'about_story_split', 'team_bio_grid'],
      description: 'Owner-dentist visibility is a structural moat vs DSOs. Lead with the doctor\'s face, story, and community tie-in.',
    },
    {
      slug: 'services-overview',
      displayName: 'Services',
      required: true,
      blueprintDefaults: ['hero_interior_minimal', 'services_detail_two_column', 'faq_accordion_grouped'],
    },
    {
      slug: 'insurance-accepted',
      displayName: 'Insurance & Financing',
      required: true,
      description: 'Only for insurance-accepting practices. Remove if the practice is FFS or during a transition.',
    },
    {
      slug: 'membership-plan',
      displayName: 'Membership Plan',
      required: false,
      description: 'Required for FFS practices and strongly recommended as a third option (alongside PPO/cash) for insurance-accepting practices.',
    },
    {
      slug: 'new-patient',
      displayName: 'New Patient Info',
      required: true,
      blueprintDefaults: ['hero_interior_minimal', 'features_alternating_split', 'faq_accordion_grouped'],
    },
    {
      slug: 'before-after',
      displayName: 'Smile Gallery',
      required: false,
      blueprintDefaults: ['gallery_masonry_3col'],
      description: 'HIPAA-sensitive. Requires signed patient release. Include "individual results vary" disclaimer per state board rules.',
    },
    {
      slug: 'contact',
      displayName: 'Contact',
      required: true,
      blueprintDefaults: ['contact_form_split', 'cta_split_contact'],
    },
  ],

  servicesCatalog: [
    { slug: 'preventive', displayName: 'Preventive Care', category: 'preventive', aliases: ['cleaning', 'prophy', 'prophylaxis', 'exam', 'checkup', 'hygiene'] },
    { slug: 'deep-cleaning', displayName: 'Deep Cleaning (SRP)', category: 'preventive', aliases: ['scaling and root planing', 'srp', 'periodontal maintenance'] },
    { slug: 'restorative', displayName: 'Fillings & Crowns', category: 'restorative', aliases: ['filling', 'composite', 'amalgam', 'crown', 'bridge', 'onlay', 'inlay'] },
    { slug: 'endodontics', displayName: 'Root Canal', category: 'restorative', aliases: ['endo', 'root canal therapy'] },
    { slug: 'cosmetic', displayName: 'Cosmetic Dentistry', category: 'cosmetic', aliases: ['whitening', 'veneers', 'bonding', 'smile makeover'], regulatoryNote: 'Not an ADA-recognized specialty — do not market as "cosmetic specialist" unless board-certified in a recognized specialty.' },
    { slug: 'orthodontics', displayName: 'Orthodontics', category: 'orthodontics', aliases: ['braces', 'invisalign', 'clearcorrect', 'aligners'], regulatoryNote: 'Only orthodontists may advertise as "orthodontic specialists."' },
    { slug: 'implants', displayName: 'Dental Implants', category: 'surgical', aliases: ['implant', 'all-on-4', 'all on four'], regulatoryNote: 'Not an ADA-recognized specialty — avoid "implant specialist" without board certification.' },
    { slug: 'extractions', displayName: 'Extractions & Oral Surgery', category: 'surgical', aliases: ['extraction', 'wisdom teeth', 'tooth removal', 'oral surgery'] },
    { slug: 'pediatric', displayName: 'Pediatric Dentistry', category: 'pediatric', aliases: ['pedo', 'children\'s dentistry', 'kids dentist'] },
    { slug: 'sedation', displayName: 'Sedation Dentistry', category: 'anxiety', aliases: ['nitrous', 'oral sedation', 'iv sedation', 'laughing gas'] },
    { slug: 'emergency', displayName: 'Emergency Dental Care', category: 'emergency', aliases: ['dental emergency', 'urgent care', 'same-day'] },
    { slug: 'tmj', displayName: 'TMJ & Bite Therapy', category: 'specialty', aliases: ['tmj', 'tmd', 'bruxism', 'nightguard'] },
  ],

  conditionsCatalog: [
    { slug: 'cavity', displayName: 'Cavity', category: 'decay', aliases: ['caries', 'dental caries'] },
    { slug: 'tooth-decay', displayName: 'Tooth Decay', category: 'decay', aliases: ['cavities', 'decay', 'rot'] },
    { slug: 'toothache', displayName: 'Toothache', category: 'pain', aliases: ['tooth pain', 'dental pain'] },
    { slug: 'chipped-tooth', displayName: 'Chipped Tooth', category: 'trauma', aliases: ['tooth chip', 'broken tooth edge'] },
    { slug: 'cracked-tooth', displayName: 'Cracked Tooth', category: 'trauma', aliases: ['tooth fracture', 'fractured tooth', 'broken tooth'] },
    { slug: 'gingivitis', displayName: 'Gingivitis', category: 'periodontal', aliases: ['bleeding gums', 'early gum disease', 'gum inflammation'] },
    { slug: 'gum-disease', displayName: 'Gum Disease', category: 'periodontal', aliases: ['periodontitis', 'periodontal disease', 'advanced gum disease'] },
    { slug: 'loose-teeth', displayName: 'Loose Teeth', category: 'periodontal', aliases: ['tooth mobility', 'shifting teeth'] },
    { slug: 'missing-teeth', displayName: 'Missing Teeth', category: 'tooth-loss', aliases: ['tooth gaps', 'edentulous'] },
    { slug: 'tooth-loss', displayName: 'Tooth Loss', category: 'tooth-loss', aliases: ['lost teeth', 'edentulism'] },
    { slug: 'misaligned-teeth', displayName: 'Misaligned Teeth', category: 'orthodontic', aliases: ['crooked teeth', 'crowding', 'spacing', 'malocclusion', 'bad bite'] },
    { slug: 'bruxism', displayName: 'Grinding (Bruxism)', category: 'functional', aliases: ['teeth grinding', 'clenching', 'night grinding'] },
    { slug: 'jaw-pain', displayName: 'Jaw Pain', category: 'functional', aliases: ['jaw soreness', 'jaw ache'] },
    { slug: 'tmj-disorder', displayName: 'TMJ Disorder', category: 'functional', aliases: ['tmj', 'tmd', 'jaw disorder', 'tmj syndrome'] },
    { slug: 'tooth-discoloration', displayName: 'Tooth Discoloration', category: 'cosmetic', aliases: ['yellow teeth', 'staining', 'discolored teeth', 'dull smile'] },
    { slug: 'bad-breath', displayName: 'Bad Breath', category: 'oral-health', aliases: ['halitosis', 'chronic bad breath'] },
  ],

  proceduresCatalog: [
    { slug: 'composite-filling', displayName: 'Composite Filling', category: 'restorative', aliases: ['tooth-colored filling', 'white filling', 'bonded filling'] },
    { slug: 'amalgam-filling', displayName: 'Amalgam Filling', category: 'restorative', aliases: ['silver filling', 'metal filling'] },
    { slug: 'ceramic-crown', displayName: 'Ceramic Crown', category: 'restorative', aliases: ['porcelain crown', 'zirconia crown', 'all-ceramic crown'] },
    { slug: 'gold-crown', displayName: 'Gold Crown', category: 'restorative', aliases: ['metal crown', 'full-cast crown'] },
    { slug: 'single-tooth-implant', displayName: 'Single-Tooth Implant', category: 'surgical', aliases: ['implant', 'single implant', 'endosteal implant'] },
    { slug: 'all-on-4-implants', displayName: 'All-on-4 Implants', category: 'surgical', aliases: ['all on four', 'full-arch implants', 'teeth in a day'] },
    { slug: 'bone-graft', displayName: 'Bone Graft', category: 'surgical', aliases: ['bone grafting', 'ridge augmentation', 'alveolar graft'] },
    { slug: 'sinus-lift', displayName: 'Sinus Lift', category: 'surgical', aliases: ['sinus augmentation', 'sinus graft', 'maxillary sinus elevation'] },
    { slug: 'extraction-simple', displayName: 'Extraction (Simple)', category: 'surgical', aliases: ['simple extraction', 'routine extraction'] },
    { slug: 'extraction-surgical', displayName: 'Extraction (Surgical)', category: 'surgical', aliases: ['surgical extraction', 'impacted extraction', 'wisdom tooth removal'] },
    { slug: 'root-canal-anterior', displayName: 'Root Canal (Anterior)', category: 'endodontic', aliases: ['front tooth root canal', 'anterior endo'] },
    { slug: 'root-canal-molar', displayName: 'Root Canal (Molar)', category: 'endodontic', aliases: ['back tooth root canal', 'molar endo', 'multi-canal root canal'] },
    { slug: 'invisalign-treatment', displayName: 'Invisalign Treatment', category: 'orthodontic', aliases: ['clear aligner treatment', 'aligner therapy'] },
    { slug: 'traditional-braces', displayName: 'Traditional Braces', category: 'orthodontic', aliases: ['metal braces', 'brackets and wires', 'fixed braces'] },
    { slug: 'teeth-whitening-session', displayName: 'Teeth Whitening Session', category: 'cosmetic', aliases: ['in-office whitening', 'bleaching session', 'zoom whitening'] },
    { slug: 'porcelain-veneer-placement', displayName: 'Porcelain Veneer Placement', category: 'cosmetic', aliases: ['veneer placement', 'veneer prep', 'veneer bonding'] },
    { slug: 'deep-cleaning-srp', displayName: 'Deep Cleaning (SRP)', category: 'preventive', aliases: ['scaling and root planing', 'srp', 'periodontal therapy'] },
    { slug: 'fluoride-application', displayName: 'Fluoride Application', category: 'preventive', aliases: ['fluoride treatment', 'topical fluoride', 'fluoride varnish'] },
    { slug: 'sealant-application', displayName: 'Sealant Application', category: 'preventive', aliases: ['dental sealants', 'pit and fissure sealants'] },
  ],

  vocabulary: {
    preferred: [
      // Clinical + operations (from §7)
      'operatory', 'hygienist', 'treatment coordinator', 'recall', 'recare', 'case acceptance',
      'prophy', 'scaling and root planing', 'perio maintenance', 'crown', 'veneer', 'implant', 'aligner',
      // Insurance / finance
      'PPO', 'FFS', 'in-network', 'out-of-network', 'annual maximum', 'pre-authorization',
      'membership plan', 'CareCredit', 'third-party financing',
      // Retention / communications
      'treatment plan', 'reactivation', 'ASAP list', 'expiring benefits', 'post-op', 'welcome packet',
    ],
    avoid: [
      { term: 'specialist', reason: 'Only the 12 ADA-recognized specialties may use this term unless the dentist is board-certified in that specialty.' },
      { term: 'painless', reason: 'Creates unreasonable expectations; regulated or prohibited in most state dental board advertising rules.' },
      { term: 'best dentist', reason: 'Dental board violation in most states; unsubstantiated superiority claim.' },
      { term: '#1 dentist', reason: 'Same as "best" — unsubstantiated, board-violating.' },
      { term: 'cheap', reason: 'Price-race positioning; undermines brand and profitability.' },
      { term: 'discount', reason: 'Same as "cheap" in premium-positioned copy; attracts low-LTV patients.' },
      { term: 'guaranteed results', reason: 'Prohibited in healthcare advertising in most states.' },
      { term: 'cosmetic specialist', reason: 'Cosmetic dentistry is not an ADA-recognized specialty.' },
      { term: 'implant specialist', reason: 'Implant dentistry is not an ADA-recognized specialty.' },
    ],
  },

  ctaDefaults: {
    approved: [
      'Request Your Consultation',
      'Meet Your Dentist',
      'Schedule a Visit',
      'New Patient Special',
      'See If We Take Your Insurance',
      'Reserve Your Appointment',
    ],
    rejected: [
      'Book Now',
      'Click Here',
      'Submit',
      'Learn More',
    ],
  },

  seasonality: {
    Q1: {
      intent: 'high',
      focus: ['insurance-reset', 'new-patient', 'preventive-schedule'],
      notes: 'Jan–Feb insurance benefits reset drives the highest-intent window of the year. Surge in new-patient calls. Prioritize GBP, Ads, and recall/reactivation.',
    },
    Q2: {
      intent: 'medium',
      focus: ['cosmetic', 'tax-refund', 'invisalign', 'whitening'],
      notes: 'Tax-refund season (Mar–Apr) drives elective/cosmetic inquiries. Longer shopping cycles (3–12 mo) for veneers, implants, ortho.',
    },
    Q3: {
      intent: 'high',
      focus: ['pediatric', 'orthodontics', 'back-to-school'],
      notes: 'Kids on summer break = pediatric + ortho surge. Adult cosmetic dips. Pre-back-to-school exam push.',
    },
    Q4: {
      intent: 'high',
      focus: ['expiring-benefits', 'membership-renewal', 'case-acceptance'],
      notes: 'Nov–Dec "use-it-or-lose-it" push. Strongest ROI automation is expiring-benefits for insurance-accepting practices. FFS/membership practices pivot to annual renewal + case close.',
    },
  },

  keywordBank: {
    primary: [
      'dentist near me',
      'family dentist',
      'cosmetic dentist',
      'new patient dentist',
      'dental office',
      'emergency dentist',
      'pediatric dentist',
    ],
    serviceLevel: [
      'teeth whitening',
      'dental implants',
      'Invisalign provider',
      'same day crowns',
      'sedation dentistry',
      'root canal',
      'veneers',
      'full mouth reconstruction',
    ],
  },

  directories: {
    required: [
      'Google Business Profile',
      'Bing Places',
      'Apple Business Connect',
      'Facebook Business Page',
      'Yelp',
      'Healthgrades',
      'Zocdoc',
    ],
    optional: ['Vitals', 'WebMD Care', 'RateMDs', '1-800-DENTIST', 'Nextdoor'],
    conditional: {
      // Insurance-accepting practices should verify these annually
      'insurance-network': [
        'Delta Dental provider finder',
        'MetLife provider finder',
        'Cigna provider finder',
        'Aetna provider finder',
        'Humana provider finder',
      ],
    },
  },

  regulatory: [
    {
      topic: 'HIPAA',
      summary: 'Federal health privacy law covering patient-identifiable information.',
      implication: 'Before/after photos, reviews, testimonials, and case studies require signed patient authorization. Responses to reviews cannot confirm patient status.',
      scope: 'federal',
    },
    {
      topic: 'State Dental Board Advertising Rules',
      summary: 'Each state board regulates dental advertising with varying strictness.',
      implication: 'Common prohibitions: "best," "#1," "specialist" (unless board-certified), "painless," unsubstantiated superiority claims. Cosmetic/implant dentistry are not ADA-recognized specialties in most states. Verify rules per state before publishing.',
      scope: 'state',
    },
    {
      topic: 'Before/After Photos',
      summary: 'Photos showing treatment results have state-specific disclosure requirements.',
      implication: 'Require signed patient release. Most states require "individual results vary" disclaimer. Some states restrict or prohibit use entirely for certain procedures.',
      scope: 'state',
    },
    {
      topic: 'Pricing Claims',
      summary: 'Free exam / discounted service offers may be regulated under state insurance laws.',
      implication: 'Offers of "free" exams, cleanings, or consultations may require disclaimers. Some states prohibit inducements for patients with insurance. Verify per state.',
      scope: 'state',
    },
    {
      topic: 'ADA Specialty Recognition',
      summary: 'Only 12 dental specialties are recognized by the American Dental Association.',
      implication: 'Cosmetic and implant dentistry are NOT ADA-recognized specialties. Marketing must reflect this — never describe a general dentist as a "cosmetic specialist" or "implant specialist."',
      scope: 'federal',
    },
    {
      topic: 'ADA / WCAG 2.1 AA Accessibility',
      summary: 'Healthcare websites are frequent ADA lawsuit targets.',
      implication: 'Minimum WCAG 2.1 AA compliance is non-negotiable. Color contrast, alt text, keyboard navigation, semantic markup all required.',
      scope: 'federal',
    },
    {
      topic: 'Telehealth Rules',
      summary: 'Virtual dental consultations are regulated state-by-state.',
      implication: 'If offering virtual consults, verify state-specific licensure and scope-of-practice rules before advertising.',
      scope: 'state',
    },
  ],

  customerPainPoints: [
    { summary: 'Cost anxiety — fear of surprise bills, sticker shock on crowns/implants/ortho.', detail: 'Pricing opacity drives bounce; transparent price ranges and financing options reduce friction.' },
    { summary: 'Dental anxiety — ~36% of adults report moderate-to-severe dental fear.', detail: 'Top reason for avoidance. Sedation availability, "gentle dentistry" framing, and anxiety-friendly office imagery all move the needle.' },
    { summary: 'Insurance confusion — PPO/HMO/FFS, in-network vs out-of-network, annual maximums.', detail: 'Practices that clearly list accepted carriers and explain coverage convert better.' },
    { summary: 'Trust deficit — suspicion of over-treatment ("do I really need this crown?").', detail: 'Second-opinion language, conservative-treatment positioning, and owner-dentist visibility reduce this.' },
    { summary: 'Scheduling friction — long new-patient waits, limited hours for working parents.', detail: 'Online booking, extended hours, and ASAP lists directly affect conversion.' },
    { summary: 'Continuity of care — patients stay loyal for years; provider turnover triggers churn.', detail: 'Owner-dentist visibility and team stability are marketing assets for independents.' },
    { summary: 'Cosmetic hesitation — 3–12 month shopping cycles for veneers, Invisalign, implants.', detail: 'Long nurture sequences (email, retargeting) and financing options drive case acceptance.' },
  ],

  competitiveLandscape: [
    {
      name: 'Independent solo/small-group practices',
      moat: 'Relationship, community ties, owner-dentist continuity, clinical autonomy, faster decision speed.',
      weakness: 'Cannot out-spend on ads; limited hours without burnout; fewer carriers listed.',
    },
    {
      name: 'DSO-backed practices',
      examples: ['Heartland Dental', 'Pacific Dental Services', 'Aspen Dental', 'Smile Brands', 'MB2 Dental'],
      moat: 'Ad spend, extended hours, cross-location flexibility, standardized experience, aggressive SEO.',
      weakness: 'Provider turnover, corporate production quotas, slow marketing pivots, inauthentic owner content.',
    },
    {
      name: 'Specialty practices',
      examples: ['Orthodontics', 'Endodontics', 'Periodontics', 'Oral Surgery', 'Pediatric', 'Prosthodontics'],
      moat: 'Referral-driven; board certification; niche authority.',
      weakness: 'Dependent on GP referral relationships; narrower service mix limits one-stop-shop positioning.',
    },
    {
      name: 'Cosmetic / boutique practices',
      moat: 'Design-forward, concierge positioning, premium pricing, Instagram-native content.',
      weakness: 'Smaller addressable market; depends on affluent local demographics.',
    },
    {
      name: 'Budget / insurance-heavy practices',
      moat: 'High volume, Medicaid/HMO access, compete on accessibility.',
      weakness: 'Low LTV patients, margin compression, reputation pressure.',
    },
    {
      name: 'Direct-to-consumer aligner disruptors',
      examples: ['Invisalign', 'ClearCorrect', 'Byte (defunct)'],
      moat: 'Convenience, price, at-home experience.',
      weakness: 'No in-office oversight; SmileDirectClub collapse showed limits of unsupervised care.',
    },
  ],

  strategicConsiderations: [
    {
      slug: 'retention-economics',
      title: 'Internal Marketing & Retention Economics',
      summary: 'New-patient CAC ($200–$500+) vastly exceeds reactivation/case-close cost (<$10). A 1% hygiene reappt gain on a 2,000-patient practice ≈ $40–60K/yr. Stabilize retention metrics before recommending acquisition spend.',
      appliesWhen: ['established-practice', 'has-active-patient-base', 'retention-metrics-below-benchmark'],
    },
    {
      slug: 'independent-vs-dso',
      title: 'Independent vs DSO Positioning',
      summary: 'Independents should not out-spend DSOs. Compete on continuity, autonomy, community, and owner visibility. Avoid price wars and insurance-heavy positioning — DSOs will always win that search.',
      appliesWhen: ['independent-practice', 'dso-competition-local'],
    },
    {
      slug: 'ffs-transition',
      title: 'Fee-for-Service (FFS) Transition Strategy',
      summary: 'PPO write-offs commonly consume 20–40% of potential production. FFS transition is the single highest-leverage long-term business decision for established independents. Prerequisites: 1500+ active patients, 90%+ hygiene reappt, 50%+ case acceptance, membership plan ready, 12–24 month owner runway.',
      appliesWhen: ['established-independent', 'ppo-heavy', 'owner-has-long-runway'],
    },
  ],

  // ── Billing / intake vocabularies ──────────────────────────────────────────
  // Feeds suggestion-driven comboboxes in the portal Intel tab (Billing sheet).
  // Flat string arrays — suggestion seeds, not locked enums.

  services: [
    // Preventive
    'Preventive Care / Cleaning',
    'Deep Cleaning (Scaling & Root Planing)',
    'Periodontal Maintenance',
    // Restorative
    'Fillings (Composite)',
    'Fillings (Amalgam)',
    'Crowns',
    'Bridges',
    'Inlays & Onlays',
    'Dentures (Full & Partial)',
    'Implant-Supported Dentures',
    // Endodontics
    'Root Canal Therapy',
    // Cosmetic
    'Teeth Whitening',
    'Porcelain Veneers',
    'Dental Bonding',
    'Smile Makeover',
    // Orthodontics
    'Invisalign / Clear Aligners',
    'Traditional Braces',
    'ClearCorrect',
    // Implants
    'Dental Implants',
    'All-on-4 Implants',
    'Full Mouth Reconstruction',
    // Surgical
    'Tooth Extractions',
    'Wisdom Tooth Removal',
    'Oral Surgery',
    // Pediatric
    'Pediatric Dentistry',
    'Sealants',
    'Fluoride Treatment',
    // Specialty / other
    'Sedation Dentistry',
    'Emergency Dental Care',
    'TMJ / Bite Therapy',
    'Night Guards / Bruxism',
    'Sleep Apnea Oral Appliances',
    'Gum Grafting',
    'Bone Grafting',
    'Laser Dentistry',
  ],

  paymentTypes: [
    // Third-party financing
    'CareCredit',
    'Sunbit',
    'LendingClub Patient Solutions',
    'Alphaeon Credit',
    'Cherry',
    // Insurance
    'Dental Insurance (In-Network)',
    'Dental Insurance (Out-of-Network)',
    // HSA / FSA
    'HSA (Health Savings Account)',
    'FSA (Flexible Spending Account)',
    // In-house
    'In-House Membership Plan',
    'In-House Payment Plan',
    // Standard payment
    'Visa / Mastercard / Discover',
    'American Express',
    'Cash',
    'Check',
    'ACH / Bank Transfer',
    // Digital
    'Apple Pay',
    'Google Pay',
  ],

  // Locked carrier vocabulary — the 10 dental insurance companies a practice
  // explicitly accepts. Consumed by the portal's Insurance Providers MultiSelect
  // with zero free-text. Changed from 20 suggestion seeds (pre-0.20.0) to 10
  // locked carriers to match the sales-team canonical intake list; legacy
  // non-matching values in company_profiles.insurance_providers are dropped
  // on first save in the portal (soft-migration pattern).
  insuranceProviders: [
    'Aetna',
    'Anthem',
    'Blue Cross Blue Shield',
    'Cigna',
    'Delta Dental',
    'Guardian',
    'Humana',
    'MetLife',
    'Principal',
    'UnitedHealthcare',
  ],

  // Locked plan/program vocabulary — insurance modalities and government
  // programs distinct from the individual carriers above. Separated from
  // `insuranceProviders` so practices can answer "which carriers?" and
  // "which plan postures?" independently; posture data also informs the
  // financial_model inference downstream.
  insurancePlans: [
    'Out-of-Network PPO',
    'Fee-for-Service Only',
    'Medicaid',
    'Medicare',
  ],

  // Locked financing-product vocabulary — structured financing programs
  // a practice offers to patients, distinct from point-of-sale payment
  // methods. CareCredit appears here AND in the global PAYMENT_METHOD_VALUES
  // intentionally: as a financing product (this list) and as a payment
  // method clients swipe at checkout (global list).
  financing: [
    'CareCredit',
    'Cherry Finance',
    'Sunbit',
    'LendingClub',
    'In-House Financing',
  ],

  // Footer archetype — dental practices are healthcare providers, so
  // the footer leads with HIPAA/privacy compliance. `legal_heavy`
  // ensures Privacy Officer contact + Notice of Privacy Practices link
  // sit prominently alongside the directory + visit columns.
  footerArchetype: 'legal_heavy',

  // Page compositions — the sequence of section blueprints per page
  // archetype. Dental's compositions reference the full v1 blueprint
  // library; sections whose Astro components haven't shipped yet will
  // render `<BlueprintFallback>` at scaffold time — they land as
  // follow-up PRs after v0.1. Pack-owned sequence is authoritative;
  // content gen fills slots per the source-of-truth discipline.
  pageCompositions: {
    home: {
      pageArchetype: 'home',
      sections: [
        'hero_fullbleed_photo',
        'services_detail_two_column',
        'about_story_split',
        'testimonials_featured_large',
        'cta_dark_centered',
      ],
    },
    'meet-the-doctor': {
      pageArchetype: 'meet-the-doctor',
      sections: [
        'hero_interior_minimal',
        'team_bio_grid',
        'about_story_split',
        'cta_split_contact',
      ],
    },
    'services-overview': {
      pageArchetype: 'services-overview',
      sections: [
        'hero_interior_minimal',
        'services_detail_two_column',
        'faq_accordion_grouped',
        'cta_dark_centered',
      ],
    },
    'insurance-accepted': {
      pageArchetype: 'insurance-accepted',
      sections: [
        'hero_interior_minimal',
        'features_alternating_split',
        'faq_accordion_grouped',
        'cta_split_contact',
      ],
    },
    'membership-plan': {
      pageArchetype: 'membership-plan',
      sections: [
        'hero_interior_minimal',
        'features_alternating_split',
        'cta_dark_centered',
      ],
    },
    'new-patient': {
      pageArchetype: 'new-patient',
      sections: [
        'hero_interior_minimal',
        'features_3col_icon_grid',
        'faq_accordion_grouped',
        'cta_split_contact',
      ],
    },
    'before-after': {
      pageArchetype: 'before-after',
      sections: [
        'hero_interior_minimal',
        'gallery_masonry_3col',
        'cta_split_contact',
      ],
    },
    contact: {
      pageArchetype: 'contact',
      sections: ['hero_interior_minimal', 'contact_form_split'],
    },
  },

  // Navigation IA — the dental archetype is `editorial-transparent`:
  // hero photography breathes at first load, header becomes frosted-glass
  // past 80px scroll. Services mega-menu groups the catalog by treatment
  // category (Cosmetic / Restorative & Preventive / Comfort & Support)
  // + a featured "new patient" card that directs to the first-visit
  // landing page — dental's primary conversion surface.
  //
  // Primary link count kept tight at 4 to resist the "stale + bloated"
  // failure mode observed on generic dental template sites. Utility
  // cluster leads with phone (still the #1 booking channel for dental)
  // and a solid Book CTA.
  navigationIA: {
    archetype: 'editorial-transparent',
    primaryLinkCount: 4,
    primaryLinks: [
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Smile Gallery', href: '/smile-gallery' },
      { label: 'Financing', href: '/financing' },
    ],
    servicesMegaMenu: {
      triggerLabel: 'Services',
      columns: 4,
      categories: [
        {
          heading: 'Cosmetic',
          items: [
            { label: 'Porcelain veneers', href: '/services/veneers', note: 'Custom-crafted restorations' },
            { label: 'Cosmetic dentistry', href: '/services/cosmetic-dentistry', note: 'Whitening, bonding, smile design' },
            { label: 'Teeth whitening', href: '/services/whitening', note: 'In-office + take-home systems' },
          ],
        },
        {
          heading: 'Restorative & Preventive',
          items: [
            { label: 'Restorative dentistry', href: '/services/restorative-dentistry', note: 'Crowns, bridges, full-mouth rehab' },
            { label: 'Preventive care', href: '/services/preventive-care', note: 'Cleanings, exams, family care' },
            { label: 'Dentures', href: '/services/dentures', note: 'Custom-fit, natural look' },
          ],
        },
        {
          heading: 'Comfort & Support',
          items: [
            { label: 'Sedation dentistry', href: '/services/sedation-dentistry', note: 'Nitrous oxide available' },
            { label: 'Your first visit', href: '/first-visit', note: '90 minutes, no surprises' },
            { label: 'Membership', href: '/membership', note: 'In-house care plan' },
          ],
        },
      ],
      featured: {
        eyebrow: 'New patient?',
        heading: '90 minutes with the doctor you choose',
        body: 'Choose your doctor when you book. Both doctors are accepting new patients.',
        ctaLabel: 'Request your first visit',
        ctaHref: '/contact',
      },
    },
    utility: {
      showPhone: true,
      primaryCTA: { label: 'Book', href: '/contact', variant: 'solid' },
    },
    scrollBehavior: 'transparent-top-frosted-past-80',
    mobileDrawer: 'fullscreen-overlay',
  },

  // ── Site Audit extractors ─────────────────────────────────────────────
  //
  // Dental is the first industry to ship structured site-audit extraction
  // beyond the universal scrape. Four dental-specific facts surface from a
  // live site that the universal extractors collapse into free text:
  //
  //   1. Membership plan tiers — name, monthly price, inclusions, enrollment
  //      CTA. Turns /membership-plan-1 into data the /membership page
  //      generator can render verbatim instead of paraphrasing.
  //   2. Insurance accepted — the actual carrier list the practice names
  //      publicly, not just "we accept most major insurance."
  //   3. New patient offers — live promos, complimentary consults, free
  //      X-ray offers — the conversion-critical copy the hero needs to
  //      honor or explicitly replace.
  //   4. Appointment systems — booking integrations (Zocdoc, LocalMed,
  //      custom forms) the content generator should reference correctly
  //      rather than invent a generic "Book online" CTA.
  //
  // Portal implementation: src/lib/website-audits/industry-packs/dental.ts
  // reads the patterns below to route scraped pages into the corresponding
  // extractors, then writes structured output to the listed profile columns.
  siteAudit: {
    pagePatterns: [
      {
        key: 'membership_plan',
        description: 'In-house membership plan page — tier listing with pricing.',
        urlContains: ['membership', 'dental-plan', 'savings-plan', 'in-house-plan'],
        pathMatches: ['/membership', '/membership-plan', '/dental-savings-plan', '/care-plan'],
        titleMatches: ['membership plan', 'dental savings', 'in-house plan', 'care plan'],
      },
      {
        key: 'insurance',
        description: 'Insurance information page — accepted carriers and plan details.',
        urlContains: ['insurance', 'financing', 'payment-options'],
        pathMatches: ['/insurance', '/insurance-accepted', '/financing', '/payment-options'],
        titleMatches: ['insurance', 'financing', 'payment options', 'accepted insurance'],
      },
      {
        key: 'new_patients',
        description: 'New patient welcome / offers page — current promos and first-visit flow.',
        urlContains: ['new-patient', 'first-visit', 'welcome', 'special', 'offer'],
        pathMatches: ['/new-patients', '/first-visit', '/welcome', '/specials', '/offers'],
        titleMatches: ['new patient', 'first visit', 'welcome', 'special offer', 'current promotion'],
      },
      {
        key: 'contact_or_homepage',
        description: 'Homepage + contact page — where appointment-system references surface.',
        pathMatches: ['/', '/contact', '/contact-us', '/book', '/schedule', '/appointments'],
        titleMatches: ['contact', 'book', 'schedule', 'appointment'],
      },
    ],

    extractors: [
      {
        key: 'membership_plans',
        label: 'Membership plan tiers',
        description: 'Structured tier inventory — tier name, monthly price, included services, enrollment CTA.',
        handles: ['membership_plan'],
        outputFields: ['membership_plans', 'has_membership_plan'],
      },
      {
        key: 'insurance_accepted',
        label: 'Accepted insurance carriers',
        description: 'Explicit carrier list the practice publishes — used to populate insurance_providers verbatim.',
        handles: ['insurance'],
        outputFields: ['insurance_providers', 'insurance_plans'],
      },
      {
        key: 'new_patient_offers',
        label: 'New patient offers + first-visit flow',
        description: 'Live promos (free consult, complimentary X-ray, new patient specials) plus the first-visit experience description.',
        handles: ['new_patients'],
        outputFields: ['new_patient_offers'],
      },
      {
        key: 'appointment_systems',
        label: 'Appointment booking integrations',
        description: 'Third-party booking systems referenced on contact / homepage (Zocdoc, LocalMed, Weave, NexHealth, custom forms).',
        handles: ['contact_or_homepage'],
        outputFields: ['appointment_systems'],
      },
    ],

    fieldSchemas: {
      membership_plans:
        'Array<{ tier: string; monthly_price_cents: number | null; annual_price_cents: number | null; included_services: string[]; enrollment_cta: string | null; source_url: string }>',
      has_membership_plan:
        '{ status: "active" | "in_development" | "planned" | "none"; notes: string | null }',
      insurance_providers:
        'string[] — carrier names (e.g. "Delta Dental", "Aetna", "Cigna"). Verbatim from the site.',
      insurance_plans:
        'string[] — plan/program names distinct from carriers (e.g. "Medicaid", "PPO", "Out-of-Network").',
      new_patient_offers:
        'Array<{ offer: string; first_visit_duration_minutes: number | null; source_url: string }>',
      appointment_systems:
        'string[] — integration names (e.g. "Zocdoc", "LocalMed", "Weave", "custom web form").',
    },
  },
};
