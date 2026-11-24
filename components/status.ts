// Shared status map — the one place a status gets its tone, icon and label.
// StatusList, Banner, Toast and TaskConsole read from it; none keeps its own.
// Icons are unweighted `ph:*` names: <Icon> renders them at the outline-bold
// default, so do not add `-fill` names here.
import type { BadgeTone } from './ui/Badge';
import { Circle, CheckCircle, Clock, Info, Warning, WarningCircle } from './icons';

export type StatusName =
  | 'complete'
  | 'in_progress'
  | 'not_started'
  | 'blocked'
  | 'on_hold'
  | 'negative'
  | 'info';

export interface StatusEntry {
  tone: BadgeTone;
  /** Unweighted `ph:*` Iconify name. */
  icon: string;
  /** Badge label, title case. */
  label: string;
}

/**
 * Tone, icon and label per status. Which lifecycle state earns which tone is
 * decided by the valence table in docs/foundation/color. `info` is the plain
 * informational signal (Banner, Toast), not a lifecycle state.
 *
 * `in_progress` and `on_hold` share the `info` tone, so a `Dot` cannot tell
 * them apart; use a `Badge` where both can appear.
 */
export const STATUS_MAP: Record<StatusName, StatusEntry> = {
  complete: { tone: 'positive', icon: CheckCircle, label: 'Complete' },
  in_progress: { tone: 'info', icon: Clock, label: 'In Progress' },
  not_started: { tone: 'neutral', icon: Circle, label: 'Not Started' },
  blocked: { tone: 'warning', icon: Warning, label: 'Blocked' },
  on_hold: { tone: 'info', icon: 'ph:pause-circle', label: 'On Hold' },
  negative: { tone: 'negative', icon: WarningCircle, label: 'Failed' },
  info: { tone: 'info', icon: Info, label: 'Info' },
};
