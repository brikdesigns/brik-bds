// Providers
export * from './providers';

// UI Components
export * from './ui';

// Canonical CRUD + integration-lifecycle action-icon set (brikdesigns/brik-bds#1127).
// The flat `ph:*` name constants stay internal; only the semantic action set is public.
export { ACTION_ICONS, type ActionIconName } from './icons';

// Accessible-name requirement shared by form controls + Modal (brikdesigns/brik-bds#2699).
export type { AccessibleNameProps, ModalAccessibleNameProps } from './utils';
