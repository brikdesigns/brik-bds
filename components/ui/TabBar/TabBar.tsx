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

/**
 * TabBar component props
 */
export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Tab items */
  items: TabItem[];
}

/**
 * Tab bar container styles
 *
 * Figma spec: auto-layout row, gap/lg (24px), full width
 *
 * Token reference:
 * - --gap-lg = 24px (gap between tabs)
 */
const barStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--gap-lg)',
  alignItems: 'center',
  width: '100%',
  borderBottom: 'var(--border-width-sm) solid var(--border-muted)',
  paddingBottom: 'var(--gap-md)',
};

/**
 * Shared tab button styles
 *
 * Figma spec: font-family/label, font-size/100 (16px), SemiBold
 *
 * Token reference:
 * - --font-family-label (label font)
 * - --label-md = 16px (font-size/100)
 * - --font-weight-semi-bold = 600
 */
const tabBaseStyles: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height-tight)',
  textAlign: 'center',
  textTransform: 'capitalize' as const,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
};

/**
 * Active tab styles
 *
 * Token reference:
 * - --text-brand-primary (active tab text)
 */
const tabActiveStyles: CSSProperties = {
  ...tabBaseStyles,
  color: 'var(--text-brand-primary)',
};

/**
 * Inactive tab styles
 *
 * Token reference:
 * - --text-secondary (inactive tab text)
 */
const tabInactiveStyles: CSSProperties = {
  ...tabBaseStyles,
  color: 'var(--text-secondary)',
};

/**
 * TabBar — BDS horizontal tab navigation
 *
 * Standalone tab bar component matching Figma spec.
 * Renders a row of tab buttons with active/inactive states.
 *
 * Can be used independently or composed inside PageHeader.
 *
 * @example
 * ```tsx
 * <TabBar
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
  className = '',
  style,
  ...props
}: TabBarProps) {
  return (
    <div
      className={bdsClass('bds-tab-bar', className)}
      style={{ ...barStyles, ...style }}
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
          style={tab.active ? tabActiveStyles : tabInactiveStyles}
          onClick={tab.onClick}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default TabBar;
