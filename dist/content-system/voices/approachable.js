export const approachable = {
    slug: 'Approachable',
    displayName: 'Approachable',
    version: '1.0.0',
    lastReviewed: '2026-04-18',
    summary: 'Warm, inclusive, encouraging. Uses first-person-plural (we/us) to signal partnership. Lowers the reader\'s barrier to action.',
    rules: {
        sentenceLength: { avg: 12, range: [6, 18] },
        contractions: 'encouraged',
        perspective: 'first-person-plural',
        hedging: 'neutral',
        imperatives: 'soften',
        rhetoricalQuestions: 'neutral',
        figurativeLanguage: 'neutral',
    },
    signaturePatterns: [
        'First-person-plural as default ("We work with you," "Our team," "Let\'s").',
        'Inclusive language — "everyone," "all of us," "you and your family."',
        'Low-barrier CTAs — "say hi," "drop us a line," "come by."',
        'Permission-giving phrases ("no commitment," "at your own pace," "when you\'re ready").',
    ],
    avoid: [
        'Formal distance — third-person institutional voice reads as cold here.',
        'Over-promising familiarity — "Welcome home!" when the reader has never been here.',
        'Euphemisms that hide real concerns instead of addressing them warmly.',
        'Condescension dressed as friendliness.',
    ],
    examples: {
        hero: {
            copy: 'Dental care for your whole family — without the dental-office feeling.',
            notes: 'Inclusive ("whole family") + specific pain name ("the dental-office feeling") + friendly tone.',
        },
        cta: {
            copy: 'Say hi',
            notes: 'Low-barrier, low-commitment, friendly register. Pairs well with a subhead like "We\'ll get right back to you."',
        },
        paragraph: {
            copy: 'We\'re a small team, and we like it that way. You\'ll see the same dentist and the same hygienist every time you come in. We\'ll know your kids\' names. We\'ll remember that you like mint over cinnamon. It\'s not complicated — it\'s just how we think dental care should feel.',
            notes: 'First-person-plural throughout, specific warm details (mint over cinnamon), explicit positioning ("small team").',
        },
        microcopy: {
            copy: 'Any questions? We\'re around.',
            notes: 'Permission + availability + casual register.',
        },
    },
    pairings: {
        reinforces: ['Empathetic', 'Conversational'],
        tensions: ['Authoritative'],
    },
};
//# sourceMappingURL=approachable.js.map