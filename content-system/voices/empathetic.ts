import type { VoicePattern } from '../schema';

export const empathetic: VoicePattern = {
  slug: 'Empathetic',
  displayName: 'Empathetic',
  version: '1.0.0',
  lastReviewed: '2026-04-18',

  summary: 'Acknowledges the reader\'s situation first. Gentle imperatives, warm tone, second-person perspective.',

  rules: {
    sentenceLength: { avg: 14, range: [6, 22] },
    contractions: 'encouraged',
    perspective: 'second-person',
    hedging: 'neutral',
    imperatives: 'soften',
    rhetoricalQuestions: 'neutral',
    figurativeLanguage: 'neutral',
  },

  signaturePatterns: [
    'Acknowledge-then-assure openings ("We know this can feel overwhelming — here\'s what comes next.").',
    'Em-dashes for emotional pivots rather than commas.',
    'Invitation language over command ("Let\'s figure this out together" vs "Book now").',
    'Named feelings — anxiety, uncertainty, hope — surfaced directly rather than avoided.',
  ],

  avoid: [
    'Imperatives without softening ("Do this now" reads as bossy).',
    'Dismissive language about the reader\'s concern ("It\'s easy! Just...").',
    'Corporate hedging that masks instead of softens.',
    'Over-promising emotional outcomes ("You\'ll feel amazing!").',
  ],

  examples: {
    hero: {
      copy: 'When you\'re ready to talk about your smile, we\'ll listen first.',
      notes: 'Acknowledges readiness as reader\'s choice; promises listening, not selling.',
    },
    cta: {
      copy: 'Take the first step',
      notes: 'Invitation, not command. Pairs with a subhead like "No pressure, no commitment."',
    },
    paragraph: {
      copy: 'We know dental visits can feel stressful — and cost anxiety doesn\'t help. Before anything else, we\'ll sit down with you, look at your coverage, and walk through what\'s actually needed. No upselling. No surprise bills.',
      notes: 'Acknowledges feelings, names the pain (cost anxiety), commits to specific behavior.',
    },
    microcopy: {
      copy: 'Not sure what to pick? We can help.',
      notes: 'Treats uncertainty as normal, not a failure.',
    },
  },

  pairings: {
    reinforces: ['Approachable', 'Conversational'],
    tensions: ['Direct', 'Authoritative'],
  },
};
