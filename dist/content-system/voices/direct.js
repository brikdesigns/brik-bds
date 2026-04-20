export const direct = {
    slug: 'Direct',
    displayName: 'Direct',
    version: '1.0.0',
    lastReviewed: '2026-04-18',
    summary: 'Short, declarative, imperative. Gets to the point and trusts the reader to keep up.',
    rules: {
        sentenceLength: { avg: 10, range: [4, 16] },
        contractions: 'neutral',
        perspective: 'second-person',
        hedging: 'avoid',
        imperatives: 'direct',
        rhetoricalQuestions: 'avoid',
        figurativeLanguage: 'avoid',
    },
    signaturePatterns: [
        'Opens with the verb or the value, not a warm-up.',
        'Fragments used for emphasis ("Fast. Reliable. Done.").',
        'Single-clause sentences with active voice.',
        'Claims stated without softeners ("You save 30%." not "You could save up to 30%.").',
    ],
    avoid: [
        'Corporate hedging ("please be advised," "kindly note").',
        'Passive voice when active is natural.',
        'Throat-clearing openers ("In today\'s fast-paced world...").',
        'Qualifying every claim to the point of meaninglessness.',
    ],
    examples: {
        hero: {
            copy: 'Book a visit. Get a plan. Move forward.',
            notes: 'Three imperatives, no adjectives, complete information.',
        },
        cta: {
            copy: 'Start',
            notes: 'Single-verb CTAs are peak-Direct. Works when context makes the action obvious.',
        },
        paragraph: {
            copy: 'You need a new website. We build them. Fixed price, four weeks, no surprises. See pricing below.',
            notes: 'Four sentences, 25 words total. Information-dense, zero ornament.',
        },
        microcopy: {
            copy: 'Required.',
            notes: 'Not "This field is required" — just "Required."',
        },
    },
    pairings: {
        reinforces: ['Expert', 'Authoritative'],
        tensions: ['Poetic', 'Empathetic'],
    },
};
//# sourceMappingURL=direct.js.map