import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Badge.css';

/** Badge valence variants */
export type BadgeTone = 'positive' | 'warning' | 'negative' | 'info' | 'brand' | 'neutral';

/** @deprecated Renamed `BadgeTone` (ADR-033 § 2). */
export type BadgeStatus = BadgeTone;

/**
 * `progress` was a third spelling of the blue info signal (Counter.css proved
 * it), and the old `info` was the gray system-neutral. ADR-033 § 5 gives the
 * blue to `info` and the gray family to `neutral`, so both fold inward.
 */
const RETIRED_TONES: Record<string, BadgeTone> = {
  error: 'negative',
  success: 'positive',
  progress: 'info',
};

/** Badge size variants — shared scale with Tag */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Badge density — orthogonal to `size`, shared axis with Tag / BulletList / Table.
 * - `comfortable` (default) — current spacing.
 * - `compact` — tighter horizontal padding (one token-step down per size),
 *   kept in sync with Tag so both align in dense rows. Height is unchanged.
 */
export type BadgeDensity = 'comfortable' | 'compact';

/**
 * Badge fill appearance — shared axis with Chip (`solid | outline`) and
 * Tag (`solid | subtle`). Badge supports the two pastel-capable values.
 * - `solid`  — saturated status-color background, high emphasis.
 * - `subtle` — pastel status-color background, saturated text, lower emphasis.
 */
export type BadgeAppearance = 'solid' | 'subtle';

/** Badge component props */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Valence variant. `info` is the blue informational signal; `neutral` is
   * the gray tone for inert states (skipped, not-started, not-linked).
   */
  tone?: BadgeTone;
  /**
   * @deprecated Use `tone` instead (ADR-033 § 2). Honoured for one minor
   * version; `tone` wins when both are passed.
   */
  status?: BadgeTone;
  /** Size variant — xs is icon-only (no text) */
  size?: BadgeSize;
  /** Fill appearance — solid (saturated bg) or subtle (pastel bg). */
  appearance?: BadgeAppearance;
  /** Density — `compact` tightens horizontal padding for dense rows. Default `comfortable`. */
  density?: BadgeDensity;
  /** Children content (optional for xs/icon-only size) */
  children?: ReactNode;
  /** Optional icon before text (required for xs size) */
  icon?: ReactNode;
}

/**
 * Badge — status indicator with semantic colors.
 *
 * Pill-shaped label for communicating status, category, or count.
 * Uses BDS system color tokens for consistent status semantics.
 * Sizing scale is shared with Tag for side-by-side alignment.
 *
 * **Indicator, not action.** Badge is non-interactive. Render it as a
 * `<span>` reflecting state; never attach `onClick` or wrap it to
 * navigate. For clickable pills use `Chip` (filters, selections) or
 * `Button` / `LinkButton` (primary actions). See the "Indicators vs
 * Actions" section of Badge.mdx for the full decision tree.
 *
 * @example
 * ```tsx
 * <Badge tone="positive">Success</Badge>
 * <Badge tone="warning" size="sm" appearance="subtle">Pending</Badge>
 * <Badge tone="negative" size="lg">Failed</Badge>
 * ```
 *
 * @summary Status indicator with semantic tones and sizes
 */
export function Badge({
  tone,
  status,
  size = 'md',
  appearance = 'solid',
  density = 'comfortable',
  children,
  icon,
  className,
  style,
  ...props
}: BadgeProps) {
  const resolvedTone =
    resolveRetiredValue('Badge', tone !== undefined ? 'tone' : 'status', tone ?? status, RETIRED_TONES) ??
    'info';
  const isIconOnly = size === 'xs';

  const classes = bdsClass(
    'bds-badge',
    `bds-badge--tone-${resolvedTone}`,
    `bds-badge--${size}`,
    `bds-badge--${appearance}`,
    density === 'compact' && 'bds-badge--compact',
    className
  );

  return (
    <span className={classes} style={style} {...props}>
      {icon && <span className="bds-badge__icon">{icon}</span>}
      {!isIconOnly && children}
    </span>
  );
}

export default Badge;

