// Internal shared hooks for BDS components.
// These are not part of the public @brikdesigns/bds package surface —
// consumers import only from the root or named entry points.
// The barrel export satisfies the component-completeness pre-commit check.
export { useSuggestionFilter } from './useSuggestionFilter';
export type { UseSuggestionFilterOptions, UseSuggestionFilterReturn } from './useSuggestionFilter';
export { useAddableList, isAddableDuplicate } from './useAddableList';
export type { UseAddableListOptions, UseAddableListReturn } from './useAddableList';
export { useElementWidth } from './useElementWidth';
export { usePrefersReducedMotion } from './usePrefersReducedMotion';
