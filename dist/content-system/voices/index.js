import { approachable } from './approachable';
import { authoritative } from './authoritative';
import { conversational } from './conversational';
import { direct } from './direct';
import { empathetic } from './empathetic';
import { expert } from './expert';
import { poetic } from './poetic';
import { witty } from './witty';
/**
 * Voice pattern registry — maps every Voice value to its VoicePattern.
 *
 * Type-level guarantee: the Record<Voice, VoicePattern> shape means adding
 * a new Voice to `VOICE_VALUES` without a matching pattern will fail
 * typecheck — same drift-prevention pattern as `industryPacks`.
 */
export const voicePatterns = {
    Direct: direct,
    Empathetic: empathetic,
    Witty: witty,
    Expert: expert,
    Conversational: conversational,
    Authoritative: authoritative,
    Poetic: poetic,
    Approachable: approachable,
};
export { approachable, authoritative, conversational, direct, empathetic, expert, poetic, witty, };
//# sourceMappingURL=index.js.map