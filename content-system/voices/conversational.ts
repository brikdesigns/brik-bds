import type { VoicePattern } from '../schema';

export const conversational: VoicePattern = {
  slug: 'Conversational',
  displayName: 'Conversational',
  version: '1.0.0',
  lastReviewed: '2026-04-18',

  summary: 'Writes the way a thoughtful expert talks to a friend. Contractions, second-person, moderate rhythm.',

  rules: {
    sentenceLength: { avg: 13, range: [6, 20] },
    contractions: 'encouraged',
    perspective: 'second-person',
    hedging: 'neutral',
    imperatives: 'neutral',
    rhetoricalQuestions: 'encouraged',
    figurativeLanguage: 'neutral',
  },

  signaturePatterns: [
    'Rhetorical questions that set up the next point ("So what actually changes? Two things.").',
    'Sentence openings with "And," "But," "So" — conjunctions used the way people speak.',
    'Asides in dashes — small clarifications mid-thought.',
    'Second-person direct address as the default.',
  ],

  avoid: [
    'Formality for its own sake.',
    'Corporate voice ("We are pleased to announce...").',
    'Overwrought metaphors.',
    'Bullet lists for things that should be sentences.',
  ],

  examples: {
    hero: {
      copy: 'Your smile, your call — we\'ll just make sure you have the right information to decide.',
      notes: 'Direct address, em-dash aside, implicit partnership.',
    },
    cta: {
      copy: 'Let\'s talk',
      notes: 'Invitation, low commitment, conversational register.',
    },
    paragraph: {
      copy: 'So here\'s the thing about dental implants: the surgery itself is straightforward. What takes time is the healing — three to six months before the final crown goes on. That\'s the part most people don\'t hear about up front, and we think you should.',
      notes: 'Opens with "So," uses a colon like speech, explicit "we think" of opinion.',
    },
    microcopy: {
      copy: 'Quick question — how\'d you hear about us?',
      notes: 'Casual framing, em-dash, genuine curiosity tone.',
    },
  },

  pairings: {
    reinforces: ['Empathetic', 'Approachable', 'Witty'],
    tensions: ['Authoritative', 'Poetic'],
  },
};
