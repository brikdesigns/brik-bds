import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import { Dot, type DotStatus } from '../Dot';
import './TabBar.css';

/**
 * Tab item
 */
export interface TabItem {
  /** Tab label */
  label: string;
  /** Whether this tab is currently active */
  active?: boolean;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /**
   * Show a small indicator dot after the label — a decorative attention cue
   * (e.g. the tab's section needs action). Rendered `aria-hidden`, so the
   * tab's accessible name stays the label alone.
   *
   * `true` renders the brand-default dot; pass a {@link DotStatus}
   * (`'warning'`, `'positive'`, `'error'`, …) to color the cue by status.
   */
  dot?: boolean | DotStatus;
}

/** Visual variant matching Figma spec */
export type TabBarVariant = 'text' | 'text-underline' | 'tab' | 'box';

/**
 * TabBar component props
 */
export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Tab items */
  items: TabItem[];
  /** Visual variant */
  variant?: TabBarVariant;
  /**
   * On-color mode — for use on brand/dark backgrounds.
   * Switches text and border colors to on-color-dark tokens
   * for legibility against colored surfaces.
   */
  onColor?: boolean;
}

/**
 * TabBar — BDS horizontal tab navigation
 *
 * Four visual variants:
 * - **text** (default): plain text links with brand color for active; no indicator
 * - **text-underline**: text variant + per-tab brand-color underline below the active tab
 * - **tab**: bottom-border bar with neutral active color and brand-color underline
 * - **box**: filled background for active, bordered for inactive
 *
 * Use `onColor` for placement on dark/brand backgrounds.
 *
 * All variant / active / on-color styling lives in `TabBar.css`, keyed on the
 * variant class, `[aria-selected]`, and the `--on-color` modifier — so external
 * rules (e.g. PageHeader's tabs slot) can override via normal cascade rather
 * than fighting inline-style specificity.
 *
 * @example
 * ```tsx
 * <TabBar
 *   variant="tab"
 *   items={[
 *     { label: 'Overview', active: true },
 *     { label: 'Billing', onClick: () => setTab('billing') },
 *     { label: 'Security', onClick: () => setTab('security') },
 *   ]}
 * />
 * ```
 *
 * @summary Horizontal tab navigation with active indicator
 */
export function TabBar({
  items,
  variant = 'text',
  onColor = false,
  className = '',
  style,
  ...props
}: TabBarProps) {
  const variantClass = `bds-tab-bar--${variant}`;
  const onColorClass = onColor ? 'bds-tab-bar--on-color' : '';

  return (
    <div
      className={bdsClass('bds-tab-bar', variantClass, onColorClass, className)}
      style={style}
      role="tablist"
      {...props}
    >
      {items.map((tab) => (
        <button
          key={tab.label}
          type="button"
          role="tab"
          aria-selected={tab.active || false}
          disabled={tab.disabled || false}
          className={bdsClass('bds-tab-bar-item', tab.dot && 'bds-tab-bar-item--has-dot')}
          onClick={tab.onClick}
        >
          {tab.label}
          {tab.dot && (
            <Dot status={tab.dot === true ? 'default' : tab.dot} size="sm" aria-hidden="true" />
          )}
        </button>
      ))}
    </div>
  );
}

export default TabBar;
