export {
  PERSONALITY_VALUES,
  isPersonality,
  type Personality,
} from './personality';

export {
  VOICE_VALUES,
  isVoice,
  type Voice,
} from './voice';

export {
  VISUAL_STYLE_VALUES,
  VISUAL_STYLE_EXAMPLES,
  isVisualStyle,
  getVisualStyleExamples,
  getPrimaryVisualStyleExample,
  type VisualStyle,
  type VisualStyleExample,
} from './visual-style';

export {
  INDUSTRY_SLUGS,
  DEFAULT_INDUSTRY_SLUG,
  isIndustrySlug,
  PARENT_INDUSTRY_SLUGS,
  isParentIndustrySlug,
  type IndustrySlug,
  type ParentIndustrySlug,
} from './industry';

export {
  ANIMATION_TIER_VALUES,
  isAnimationTier,
  type AnimationTier,
} from './animation-tier';

export {
  IMAGE_MOOD_VALUES,
  isImageMood,
  type ImageMood,
} from './image-mood';

export {
  PAYMENT_METHOD_VALUES,
  isPaymentMethod,
  type PaymentMethod,
} from './payment-method';

export {
  NAV_ARCHETYPE_VALUES,
  isNavArchetype,
  type NavArchetype,
} from './nav-archetype';

export {
  FOOTER_ARCHETYPE_VALUES,
  isFooterArchetype,
  DEFAULT_FOOTER_ARCHETYPE,
  type FooterArchetype,
} from './footer-archetype';

export {
  SCROLL_BEHAVIOR_VALUES,
  isScrollBehavior,
  type ScrollBehavior,
} from './scroll-behavior';

export {
  DRAWER_PATTERN_VALUES,
  isDrawerPattern,
  type DrawerPattern,
} from './drawer-pattern';

export {
  ATMOSPHERE_VALUES,
  isAtmosphere,
  type Atmosphere,
  THEME_MODE_VALUES,
  isThemeMode,
  type ThemeMode,
  ATMOSPHERE_THEME_MODE,
} from './atmosphere';

export {
  COLOR_PRIMITIVE_TIERS,
  isColorPrimitiveTier,
  type ColorPrimitiveTier,
} from './color-primitive-tier';

// ── Expression modes (ADR-039 Style axis, #2774) ──────────────────
// The five `[data-mode-*]` axes, one closed list per axis, each equal to the
// selector values in the matching tokens/modes-*.css. See
// `expression-modes.test.ts` for the contract and each module's header for
// why the attribute-absent default is not a member.

export {
  SPACING_MODE_VALUES,
  isSpacingMode,
  type SpacingMode,
} from './spacing-mode';

export {
  RADIUS_MODE_VALUES,
  isRadiusMode,
  type RadiusMode,
} from './radius-mode';

export {
  ELEVATION_MODE_VALUES,
  isElevationMode,
  type ElevationMode,
} from './elevation-mode';

export {
  TYPOGRAPHY_MODE_VALUES,
  isTypographyMode,
  type TypographyMode,
} from './typography-mode';

export {
  BORDERWIDTH_MODE_VALUES,
  isBorderWidthMode,
  type BorderWidthMode,
} from './borderwidth-mode';
