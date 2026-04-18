import type { VoicePattern } from '../schema';

export const witty: VoicePattern = {
  slug: 'Witty',
  displayName: 'Witty',
  version: '1.0.0',
  lastReviewed: '2026-04-18',

  summary: 'Playful, observant, a little sideways. Uses unexpected turns and cultural resonance to make a point memorable.',

  rules: {
    sentenceLength: { avg: 12, range: [6, 20] },
    contractions: 'encouraged',
    perspective: 'flexible',
    hedging: 'avoid',
    imperatives: 'neutral',
    rhetoricalQuestions: 'encouraged',
    figurativeLanguage: 'encouraged',
  },

  signaturePatterns: [
    'Sentence reversals ("We don\'t sell dreams. We fix teeth.").',
    'Parenthetical asides that wink at the reader.',
    'Unexpected noun choices ("This isn\'t a dental practice. It\'s a witness-protection program for your molars.").',
    'Rhetorical questions that answer themselves.',
  ],

  avoid: [
    'Humor at the client\'s or reader\'s expense.',
    'Jokes that require context the reader won\'t have.',
    'Trying too hard — three-joke paragraphs exhaust goodwill fast.',
    'Humor in inappropriate contexts (medical emergencies, grief, compliance copy).',
  ],

  examples: {
    hero: {
      copy: 'Your teeth called. They\'d like a word.',
      notes: 'Personification + familiar phrasing + implicit urgency. Works for a practice that can afford to be playful.',
    },
    cta: {
      copy: 'Say hello',
      notes: 'Lowercase informality. Specifically avoids "Book Now."',
    },
    paragraph: {
      copy: 'Most dentists want to fix the thing you came in for. Fair enough. We\'re more interested in why it keeps happening. (Spoiler: it\'s almost never the flossing.)',
      notes: 'Sets up expectation, subverts it, closes with a parenthetical payoff.',
    },
    microcopy: {
      copy: 'Oops — that didn\'t work. Let\'s try again.',
      notes: 'Keeps composure under failure. Never blames the user.',
    },
  },

  pairings: {
    reinforces: ['Conversational', 'Approachable'],
    tensions: ['Authoritative'],
  },
};
