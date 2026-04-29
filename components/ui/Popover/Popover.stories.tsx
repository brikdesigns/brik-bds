import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../Button';

/**
 * Popover — anchored floating panel with click or hover trigger and four
 * placements. Use for settings panels, info cards, and small action menus.
 * For richer overlays use `Modal`; for inline tips use `Tooltip`.
 * @summary Anchored floating panel
 */
const meta: Meta<typeof Popover> = {
  title: 'Components/Overlay/popover',
  component: Popover,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '120px' /* bds-lint-ignore — space for popover overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    trigger: { control: 'select', options: ['click', 'hover'] },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleContent = (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--gap-sm)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--body-md)',
    color: 'var(--text-primary)',
  }}>
    <strong style={{ fontWeight: 'var(--font-weight-semi-bold)' as unknown as number }}>
      Popover title
    </strong>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
      This is some helpful content inside the popover panel.
    </p>
  </div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    content: sampleContent,
    placement: 'bottom',
    trigger: 'click',
    children: <Button variant="outline">Click me</Button>,
  },
};

/* ─── Placement axis ─────────────────────────────────────────── */

/** Side-by-side comparison of all four placements. ADR-006 axis-gallery
 *  exception — comparing placement is the entire point.
 *  @summary All placements rendered together */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-xl)', alignItems: 'flex-start' }}>
      <Popover content={sampleContent} placement="top">
        <Button variant="outline" size="sm">Top</Button>
      </Popover>
      <Popover content={sampleContent} placement="bottom">
        <Button variant="outline" size="sm">Bottom</Button>
      </Popover>
      <Popover content={sampleContent} placement="left">
        <Button variant="outline" size="sm">Left</Button>
      </Popover>
      <Popover content={sampleContent} placement="right">
        <Button variant="outline" size="sm">Right</Button>
      </Popover>
    </div>
  ),
};

/* ─── Trigger axis ───────────────────────────────────────────── */

/** Click trigger (default) — opens on click, closes on outside click or Escape.
 *  @summary Click trigger */
export const ClickTrigger: Story = {
  args: {
    content: sampleContent,
    trigger: 'click',
    children: <Button variant="outline" size="sm">Click trigger</Button>,
  },
};

/** Hover trigger — opens on hover/focus, closes on blur. Use for read-only
 *  contextual hints (similar to Tooltip but with richer content).
 *  @summary Hover trigger */
export const HoverTrigger: Story = {
  args: {
    content: sampleContent,
    trigger: 'hover',
    children: <Button variant="ghost" size="sm">Hover trigger</Button>,
  },
};

/* ─── Composition ────────────────────────────────────────────── */

/** Settings panel — checkboxes inside the popover content slot.
 *  @summary Notification-settings popover */
export const SettingsPanel: Story = {
  render: () => (
    <Popover
      placement="bottom"
      content={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap-md)',
          fontFamily: 'var(--font-family-body)',
          minWidth: 240,
        }}>
          <div style={{ fontSize: 'var(--label-md)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-primary)' }}>
            Notification settings
          </div>
          <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
            <input type="checkbox" defaultChecked /> Push notifications
          </label>
          <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
            <input type="checkbox" /> Email digest
          </label>
          <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
            <input type="checkbox" defaultChecked /> Sound alerts
          </label>
        </div>
      }
    >
      <Button>Settings</Button>
    </Popover>
  ),
};
