import type { VoicePattern } from '../schema';

export const authoritative: VoicePattern = {
  slug: 'Authoritative',
  displayName: 'Authoritative',
  version: '1.0.0',
  lastReviewed: '2026-04-18',

  summary: 'Declarative, confident, consequential. States things as fact without softening. Earns trust through certainty, not warmth.',

  rules: {
    sentenceLength: { avg: 14, range: [8, 22] },
    contractions: 'avoid',
    perspective: 'flexible',
    hedging: 'avoid',
    imperatives: 'direct',
    rhetoricalQuestions: 'avoid',
    figurativeLanguage: 'avoid',
  },

  signaturePatterns: [
    'Declarative statements without qualifiers ("This is the standard of care.").',
    'Third-person institutional voice when appropriate ("The practice maintains...").',
    'Consequence language ("Delay shortens your options. We recommend scheduling within 30 days.").',
    'Structural parallelism for weight ("We diagnose. We treat. We stand behind the work.").',
  ],

  avoid: [
    'Contractions when gravity is called for.',
    'Apologetic framing of necessary information.',
    'Over-explaining — authority implies the reader can handle the point.',
    'Condescension — there is a line between authoritative and paternalistic.',
  ],

  examples: {
    hero: {
      copy: 'Clinical excellence. Uncompromised.',
      notes: 'Two-word headline + one-word reinforcement. Weight through brevity.',
    },
    cta: {
      copy: 'Schedule a Consultation',
      notes: 'Proper capitalization, full phrase, appropriate gravity.',
    },
    paragraph: {
      copy: 'The diagnosis is clear. The treatment path is well-established. We will present three options, each with its own tradeoff, and recommend the one we believe serves you best. The decision is yours.',
      notes: 'Four declarative sentences, no hedging, closes with reader agency — authoritative without being paternalistic.',
    },
    microcopy: {
      copy: 'This action cannot be undone.',
      notes: 'Direct consequence, no softening, no "please confirm."',
    },
  },

  pairings: {
    reinforces: ['Expert', 'Direct'],
    tensions: ['Empathetic', 'Witty', 'Poetic'],
  },
};
