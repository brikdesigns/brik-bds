import type { VoicePattern } from '../schema';

export const poetic: VoicePattern = {
  slug: 'Poetic',
  displayName: 'Poetic',
  version: '1.0.0',
  lastReviewed: '2026-04-18',

  summary: 'Rhythm and imagery. Longer cadences, sensory detail, language that earns its space. Used sparingly for emotional resonance.',

  rules: {
    sentenceLength: { avg: 18, range: [8, 32] },
    contractions: 'neutral',
    perspective: 'flexible',
    hedging: 'neutral',
    imperatives: 'soften',
    rhetoricalQuestions: 'encouraged',
    figurativeLanguage: 'encouraged',
  },

  signaturePatterns: [
    'Sensory detail — light, sound, texture, time of day — grounds abstraction.',
    'Parallel clauses and triadic rhythm ("A practice. A home. A beginning.").',
    'Metaphor carried through a passage rather than dropped.',
    'White space and pacing — short sentences after long ones for weight.',
  ],

  avoid: [
    'Purple prose — ornament without substance.',
    'Mixed metaphors or metaphors that fall apart under scrutiny.',
    'Vagueness dressed up as depth.',
    'Poetic framing on transactional surfaces (pricing, forms, error states).',
  ],

  examples: {
    hero: {
      copy: 'Before the before. Before the first visit, the first question, the first decision. This is where it starts — with listening.',
      notes: 'Three repetitions of "before" + triadic "first" structure + em-dash pivot to the reveal.',
    },
    cta: {
      copy: 'Begin',
      notes: 'Single word carrying the weight of the whole passage above.',
    },
    paragraph: {
      copy: 'The practice sits between the old courthouse and the maple that turns first every October. Inside, the light is low and the air is warm. We have been here twenty-two years, and in that time we have learned something simple — that dentistry is not the thing people remember. Being known is the thing people remember.',
      notes: 'Three sentences, 56 words. Sensory specificity (maple, light, air) grounds the abstract close.',
    },
    microcopy: {
      copy: 'Take your time.',
      notes: 'Minimal imperative, emotional permission. Works on a long-form intake screen.',
    },
  },

  pairings: {
    reinforces: ['Empathetic'],
    tensions: ['Direct', 'Expert', 'Witty'],
  },
};
