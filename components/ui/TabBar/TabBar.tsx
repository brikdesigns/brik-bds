import { type HTMLAttributes, type CSSProperties } from 'react';
import { bdsClass } from '../../utils';

/**
 * Tab item
 */
export interface TabItem {
  /** Tab label */
  label: string;
  /** Whether this tab is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/** Visual variant matching Figma spec */
export type TabBarVariant = 'text' | 'tab' | 'box';

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

/* ── Bar container styles per variant ── */

const barBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  flexWrap: 'wrap',
  boxSizing: 'border-box',
};

const barVariantStyles: Record<TabBarVariant, CSSProperties> = {
  text: { ...barBase, gap: 'var(--gap-xl)' },
  tab: { ...barBase, gap: 0 },
  box: { ...barBase, gap: 0 },
};

/* ── Shared tab base ── */

const tabBase: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
  minWidth: 0,
};

/* ── Style builders per variant ── */

function getTextStyles(active: boolean, onColor: boolean): CSSProperties {
  if (onColor) {
    return {
      ...tabBase,
      color: 'var(--text-on-color-dark)',
      opacity: active ? 1 : 0.6,
    };
  }
  return {
    ...tabBase,
    color: active ? 'var(--text-brand-primary)' : 'var(--text-secondary)',
  };
}

function getTabStyles(active: boolean, onColor: boolean): CSSProperties {
  const borderColor = onColor
    ? 'var(--border-on-color-dark)'
    : active
      ? 'var(--border-brand-primary)'
      : 'var(--border-primary)';

  const textColor = onColor
    ? 'var(--text-on-color-dark)'
    : active
      ? 'var(--text-primary)'
      : 'var(--text-secondary)';

  return {
    ...tabBase,
    color: textColor,
    backgroundColor: onColor ? 'transparent' : 'var(--background-primary)',
    padding: 'var(--padding-lg)',
    borderBottom: `var(--border-width-lg) solid ${borderColor}`,
    opacity: onColor && !active ? 0.6 : 1,
  };
}

function getBoxStyles(active: boolean, onColor: boolean): CSSProperties {
  if (active) {
    return {
      ...tabBase,
      color: 'var(--text-inverse)',
      backgroundColor: 'var(--background-brand-primary)',
      padding: 'var(--padding-lg)',
      border: 'none',
    };
  }
  const borderColor = onColor
    ? 'var(--border-on-color-dark)'
    : 'var(--border-primary)';
  const textColor = onColor
    ? 'var(--text-on-color-dark)'
    : 'var(--text-secondary)';
  return {
    ...tabBase,
    color: textColor,
    backgroundColor: 'var(--background-primary)',
    padding: 'var(--padding-lg)',
    border: `var(--border-width-md) solid ${borderColor}`,
    opacity: onColor && !active ? 0.6 : 1,
  };
}

const styleBuilders: Record<TabBarVariant, (active: boolean, onColor: boolean) => CSSProperties> = {
  text: getTextStyles,
  tab: getTabStyles,
  box: getBoxStyles,
};

/**
 * TabBar — BDS horizontal tab navigation
 *
 * Three visual variants matching Figma:
 * - **text** (default): plain text links with brand color for active
 * - **tab**: underline indicator with bottom border
 * - **box**: filled background for active, bordered for inactive
 *
 * Use `onColor` for placement on dark/brand backgrounds.
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
 */
export function TabBar({
  items,
  variant = 'text',
  onColor = false,
  className = '',
  style,
  ...props
}: TabBarProps) {
  const getStyles = styleBuilders[variant];

  return (
    <div
      className={bdsClass('bds-tab-bar', className)}
      style={{ ...barVariantStyles[variant], ...style }}
      role="tablist"
      {...props}
    >
      {items.map((tab) => (
        <button
          key={tab.label}
          type="button"
          role="tab"
          aria-selected={tab.active || false}
          className="bds-tab-bar-item"
          style={getStyles(tab.active || false, onColor)}
          onClick={tab.onClick}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default TabBar;
