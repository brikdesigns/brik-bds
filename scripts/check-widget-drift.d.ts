/**
 * Type definitions for @brikdesigns/bds/check-widget-drift.
 *
 * Source: scripts/check-widget-drift.mjs (hand-authored ESM with a named
 * export + CLI entry). Hand-written to keep the .mjs portable and out of the
 * BDS lib build, matching scripts/canonical-check.d.ts.
 */

export interface WidgetDriftResult {
  /** true when the consumer copy differs from the canonical package source */
  drifted: boolean;
  /** absolute path to the canonical widget inside the installed package */
  canonicalPath: string;
  /** the consumer copy path that was compared */
  consumerPath: string;
}

/**
 * Compare a consumer's vendored widget copy against the canonical package source.
 * @param widgetFile bare filename, e.g. "feedback-widget.js"
 * @param consumerPath path to the consumer's vendored copy
 */
export function checkWidgetDrift(widgetFile: string, consumerPath: string): WidgetDriftResult;
