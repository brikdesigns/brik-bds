export const expert = {
    slug: 'Expert',
    displayName: 'Expert',
    version: '1.0.0',
    lastReviewed: '2026-04-18',
    summary: 'Credibility through specificity. Uses correct terminology without over-explaining; references data, method, experience.',
    rules: {
        sentenceLength: { avg: 16, range: [10, 24] },
        contractions: 'neutral',
        perspective: 'flexible',
        hedging: 'neutral',
        imperatives: 'neutral',
        rhetoricalQuestions: 'avoid',
        figurativeLanguage: 'avoid',
    },
    signaturePatterns: [
        'Specific numbers over vague quantifiers ("8.2 million cases" not "lots of cases").',
        'Methodological language — how the work gets done, not just what gets done.',
        'Industry-specific terminology used correctly (hygiene reappointment, case acceptance, not "customer retention").',
        'Qualified claims — confident where backed, precise where not.',
    ],
    avoid: [
        'Jargon as status signaling (using complex words where simple ones work).',
        'Undefined acronyms — define on first use.',
        'Hedging everything into meaninglessness ("generally," "often," "in many cases").',
        'Patronizing explanations of obvious concepts.',
    ],
    examples: {
        hero: {
            copy: 'Independent dentistry, backed by 22 years of clinical experience and 3,400 active families.',
            notes: 'Specific years, specific patient count, specific positioning (independent).',
        },
        cta: {
            copy: 'Review our case studies',
            notes: 'Assumes the reader is discerning enough to want evidence.',
        },
        paragraph: {
            copy: 'A same-day crown starts with a CBCT scan and an iTero digital impression. No temporary crown, no second visit — the ceramic is milled in-office on a CEREC unit while you wait. The process takes about two hours from scan to seat.',
            notes: 'Names the tools, explains the method, quantifies the time. Technical but accessible.',
        },
        microcopy: {
            copy: 'Enter your NPI to continue',
            notes: 'Assumes the reader knows what NPI means — appropriate for a provider-facing form.',
        },
    },
    pairings: {
        reinforces: ['Direct', 'Authoritative'],
        tensions: ['Poetic', 'Witty'],
    },
};
//# sourceMappingURL=expert.js.map