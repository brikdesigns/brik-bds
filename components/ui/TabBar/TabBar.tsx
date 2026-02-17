import { type HTMLAttributes, type CSSProperties } from 'react';

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
 * - --_space---gap--lg = 24px (gap between tabs)
 */
const barStyles: CSSProperties = {
  display: 'flex',
  gap: 'var(--_space---gap--lg)',
  alignItems: 'center',
  width: '100%',
};

/**
 * Shared tab button styles
 *
 * Figma spec: font-family/label, font-size/100 (16px), SemiBold
 *
 * Token reference:
 * - --_typography---font-family--label (label font)
 * - --_typography---label--md-base = 16px (font-size/100)
 * - --font-weight--semi-bold = 600
 */
const tabBaseStyles: CSSProperties = {
  fontFamily: 'var(--_typography---font-family--label)',
  fontSize: 'var(--_typography---label--md-base)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  lineHeight: 'var(--font-line-height--100)',
  textAlign: 'center',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
};

/**
 * Active tab styles
 *
 * Token reference:
 * - --_color---text--brand (active tab text)
 */
const tabActiveStyles: CSSProperties = {
  ...tabBaseStyles,
  color: 'var(--_color---text--brand)',
};

/**
 * Inactive tab styles
 *
 * Token reference:
 * - --_color---text--secondary (inactive tab text)
 */
const tabInactiveStyles: CSSProperties = {
  ...tabBaseStyles,
  color: 'var(--_color---text--secondary)',
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
      className={className || undefined}
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
