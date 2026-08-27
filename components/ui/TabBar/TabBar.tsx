import { type HTMLAttributes, type KeyboardEvent, useRef } from 'react';
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
  /**
   * Stable id for the tab button — set it (alongside {@link TabItem.controls})
   * when wiring the rail to `tabpanel`s so the panel can point back via
   * `aria-labelledby`.
   */
  id?: string;
  /**
   * id of the `tabpanel` this tab controls. Setting it emits `aria-controls`
   * **and upgrades the rail to the full WAI-ARIA tabs keyboard contract** —
   * roving tabindex plus Arrow / Home / End navigation. Rails without any
   * `controls` (the default) keep their current label-navigation behaviour
   * untouched. Consumed by `MediaTabs`.
   */
  controls?: string;
}

/** Visual variant matching Figma spec */
export type TabBarVariant = 'text' | 'text-underline' | 'tab' | 'box';

/** Rail axis. Vertical stacks the tabs and sets `aria-orientation`. */
export type TabBarOrientation = 'horizontal' | 'vertical';

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
  /**
   * Rail axis. `'vertical'` stacks the tabs and sets `aria-orientation`, which
   * also swaps the arrow-key axis (Up/Down instead of Left/Right) when the
   * tabs keyboard contract is active. Default `'horizontal'`.
   */
  orientation?: TabBarOrientation;
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
 * **Tabs keyboard contract (opt-in).** When items carry `controls` (the id of
 * the `tabpanel` each tab drives), the rail becomes a full WAI-ARIA tabs
 * widget: exactly one tab in the page Tab sequence (roving tabindex), and
 * Arrow / Home / End move focus and activate — Left/Right when horizontal,
 * Up/Down when `orientation="vertical"`. Rails without `controls` keep the
 * plain label-navigation behaviour, so existing callers are unaffected.
 * `MediaTabs` is the primary consumer.
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
  orientation = 'horizontal',
  className = '',
  style,
  ...props
}: TabBarProps) {
  const variantClass = `bds-tab-bar--${variant}`;
  const onColorClass = onColor ? 'bds-tab-bar--on-color' : '';

  // The tabs keyboard contract only engages once panels are wired, so existing
  // label-only rails keep their current (all-tabbable, no arrow-key) behaviour.
  const isTabsWidget = items.some((tab) => tab.controls != null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // The one tab in the page Tab sequence: the active one, else the first
  // enabled tab so the widget is never keyboard-unreachable.
  const activeIndex = items.findIndex((tab) => tab.active);
  const rovingIndex = activeIndex >= 0 ? activeIndex : items.findIndex((tab) => !tab.disabled);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isTabsWidget) return;
    const enabled = items.reduce<number[]>((acc, tab, i) => {
      if (!tab.disabled) acc.push(i);
      return acc;
    }, []);
    if (enabled.length === 0) return;

    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const here = enabled.indexOf(rovingIndex);

    let target: number | undefined;
    if (event.key === nextKey) target = enabled[(here + 1) % enabled.length];
    else if (event.key === prevKey) target = enabled[(here - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') target = enabled[0];
    else if (event.key === 'End') target = enabled[enabled.length - 1];
    else return;

    event.preventDefault();
    // Automatic activation: moving focus selects, matching the reference and
    // the auto-advance model where the visible panel always tracks focus.
    itemRefs.current[target]?.focus();
    items[target]?.onClick?.();
  };

  return (
    <div
      className={bdsClass('bds-tab-bar', variantClass, onColorClass, className)}
      style={style}
      role="tablist"
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      data-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      onKeyDown={isTabsWidget ? handleKeyDown : undefined}
      {...props}
    >
      {items.map((tab, index) => (
        <button
          key={tab.id ?? tab.label}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
          role="tab"
          id={tab.id}
          aria-selected={tab.active || false}
          aria-controls={tab.controls}
          tabIndex={isTabsWidget ? (index === rovingIndex ? 0 : -1) : undefined}
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
