// ToggleSwitch is the canonical component
export { ToggleSwitch } from './ToggleSwitch';
export type {
  ToggleSwitchProps,
  ToggleSwitchSize,
  ToggleSwitchVariant,
} from './ToggleSwitch';

// @deprecated — Switch has been renamed to ToggleSwitch.
// Import from '@brikdesigns/bds' as before; this bridge re-export will be
// removed in a future minor after consumers (brikdesigns dark-mode toggle)
// migrate to ToggleSwitch.
export {
  ToggleSwitch as Switch,
  type ToggleSwitchProps as SwitchProps,
  type ToggleSwitchSize as SwitchSize,
  type ToggleSwitchVariant as SwitchVariant,
} from './ToggleSwitch';
