import type { Voice } from '../vocabularies';

/**
 * VoicePattern — the writing rules + examples for one canonical voice trait.
 *
 * Each voice in `VOICE_VALUES` has a matching `voices/{slug}.ts` file and an
 * `{slug}.mdx` narrative. The resolver's voice blender reads `rules` and
 * merges up to 3 voice patterns with first-pick weighted highest.
 *
 * Rules are *directional*, not strict — sentence-length ranges are targets
 * that compose, not hard limits. The blender reconciles conflicts (e.g.
 * Direct's short-sentence rule vs Poetic's long-cadence rule) by weighting
 * toward the first pick but allowing the second and third picks to soften.
 */
export interface VoicePattern {
  slug: Voice;
  displayName: string;
  version: string;
  lastReviewed: string;

  /** One-sentence summary shown in portal UI tooltips. */
  summary: string;

  /** Structured rules the blender consumes. */
  rules: VoiceRules;

  /** Recognizable tics that mark this voice. */
  signaturePatterns: readonly string[];

  /** Patterns this voice avoids. */
  avoid: readonly string[];

  /** Concrete copy examples showing how this voice writes specific surfaces. */
  examples: VoiceExamples;

  /** How this voice behaves when blended with others. */
  pairings: {
    /** Voices that amplify this one when paired. */
    reinforces: readonly Voice[];
    /** Voices that create productive tension — notable but not forbidden. */
    tensions: readonly Voice[];
  };
}

export interface VoiceRules {
  /** Target sentence length in words (avg + min/max range). */
  sentenceLength: {
    avg: number;
    range: readonly [number, number];
  };
  contractions: 'encouraged' | 'neutral' | 'avoid';
  perspective: 'first-person-plural' | 'second-person' | 'third-person' | 'flexible';
  hedging: 'avoid' | 'neutral' | 'encouraged';
  imperatives: 'soften' | 'neutral' | 'direct';
  rhetoricalQuestions: 'avoid' | 'neutral' | 'encouraged';
  figurativeLanguage: 'avoid' | 'neutral' | 'encouraged';
}

export interface VoiceExamples {
  /** Hero headline + optional subhead. */
  hero: VoiceExample;
  /** CTA button label or short phrase. */
  cta: VoiceExample;
  /** A single paragraph (2–4 sentences). */
  paragraph: VoiceExample;
  /** Optional: microcopy — error states, form labels, tooltips. */
  microcopy?: VoiceExample;
}

export interface VoiceExample {
  copy: string;
  /** Optional author note explaining what the example demonstrates. */
  notes?: string;
}
