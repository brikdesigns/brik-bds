/**
 * Animation Tier — the canonical motion intensity captured in the client portal.
 *
 * Single source of truth shared by the portal Visual Direction intel topic,
 * the mockup generator's `resolveAnimationTierNote()` resolver, and the
 * BDS animation toolkit (animation-toolkit.md). Drift here breaks the
 * mockup pipeline silently — the worker reads this tier to decide which
 * libraries (Lenis / GSAP / ScrollTrigger / Granim) to load and which
 * interaction patterns Claude is allowed to generate.
 *
 * Clients pick exactly one. The tier carries forward from onboarding
 * through design-preflight into every mockup variant.
 *
 * Tier semantics (matches `animation-toolkit.md`):
 *   - subtle     — `.fade-up` IntersectionObserver only. No GSAP.
 *   - moderate   — fade-ups + SplitText hero H1 + stat counters + hover
 *                  lifts + CSS animated gradient.
 *   - expressive — SplitText + ScrollTrigger parallax + staggered card
 *                  entrances + Granim.js gradient + Lenis smooth scroll.
 */
export const ANIMATION_TIER_VALUES = ['subtle', 'moderate', 'expressive'];
export const isAnimationTier = (value) => ANIMATION_TIER_VALUES.includes(value);
//# sourceMappingURL=animation-tier.js.map