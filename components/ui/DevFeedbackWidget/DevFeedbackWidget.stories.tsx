import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrikDevBar } from '../BrikDevBar';
import { DevFeedbackWidget } from './DevFeedbackWidget';

/* ─── Layout helpers (story-only) ─────────────────────── */

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      minHeight: 360,
      padding: 'var(--padding-xl)',
      fontFamily: 'var(--font-family-body)',
      color: 'var(--text-primary)',
    }}
  >
    {children}
  </div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof DevFeedbackWidget> = {
  title: 'Dev Tools/DevFeedbackWidget',
  component: DevFeedbackWidget,
  tags: ['surface-product', 'surface-shared'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: ['auto', 'slot', 'fab'],
    },
    endpoint: { control: 'text' },
    contextLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DevFeedbackWidget>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — explore all three variants via Controls panel
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    variant: 'fab',
    endpoint: '/api/feedback',
    contextLabel: 'Story',
  },
  render: (args) => (
    <Frame>
      <p style={{ marginBottom: 'var(--gap-md)' }}>
        Toggle the <code>variant</code> control: <strong>fab</strong> renders the floating
        button standalone; <strong>slot</strong> registers with the DevBar shell (and warns
        if the shell never appears); <strong>auto</strong> runtime-detects.
      </p>
      <DevFeedbackWidget {...args} />
    </Frame>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   2. FAB — standalone, no DevBar shell
   ═══════════════════════════════════════════════════════════════ */

/** @summary Standalone floating button — explicit `variant="fab"` skips the DevBar lookup */
export const FabStandalone: Story = {
  render: () => (
    <Frame>
      <p>Standalone FAB, no DevBar present. Use this in product apps that ship customer feedback collection without the dev shell.</p>
      <DevFeedbackWidget variant="fab" endpoint="/api/feedback" contextLabel="Page" />
    </Frame>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. SLOT — explicit slot mode (no FAB flicker)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Slot-only — registers with BrikDevBar; never renders the FAB even pre-load */
export const SlotWithDevBar: Story = {
  render: () => (
    <Frame>
      <p>Explicit <code>variant=&quot;slot&quot;</code>. The widget seeds <code>devBarPresent=true</code> from the start so the FAB never flashes during the bar&apos;s load. Logs a warning if no DevBar appears within 2s.</p>
      <BrikDevBar />
      <DevFeedbackWidget variant="slot" endpoint="/api/feedback" contextLabel="Story" />
    </Frame>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. AUTO — runtime detect (current default behavior)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Auto detect with DevBar present — registers slot; FAB is hidden once detected */
export const AutoWithDevBar: Story = {
  render: () => (
    <Frame>
      <p>Default <code>variant=&quot;auto&quot;</code>. Polls <code>window.BrikDevBar</code> every 100ms for 2s. With the shell mounted, the widget settles into slot mode.</p>
      <BrikDevBar />
      <DevFeedbackWidget endpoint="/api/feedback" contextLabel="Story" />
    </Frame>
  ),
};

/** @summary Auto detect without DevBar — falls back to FAB after the 2s detection window */
export const AutoWithoutDevBar: Story = {
  render: () => (
    <Frame>
      <p>Default <code>variant=&quot;auto&quot;</code> with no DevBar shell. After the 2s lookup window, falls back to FAB rendering. Note: until detection times out, you may briefly see no widget — the trade-off the explicit <code>fab</code>/<code>slot</code> variants resolve.</p>
      <DevFeedbackWidget endpoint="/api/feedback" contextLabel="Page" />
    </Frame>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   5. RIGHT-ANCHORED — FAB pinned bottom-right; panel tracks
   ═══════════════════════════════════════════════════════════════ */

/** @summary FAB pinned bottom-right — open the panel and confirm it anchors to the right edge alongside the FAB. brik-bds#415. */
export const FabPinnedRight: Story = {
  render: () => (
    <Frame>
      <p>
        FAB pinned to <code>bottom-right</code> via <code>fabPosition={'{ bottom: \'16px\', right: \'16px\' }'}</code>.
        On click, the panel opens at the same right edge as the FAB so the menu visually grows out of the trigger.
        Earlier behavior anchored the panel to <code>left: 16px</code> regardless of <code>fabPosition</code> — opposite edge of the FAB.
      </p>
      <DevFeedbackWidget
        variant="fab"
        endpoint="/api/feedback"
        contextLabel="Page"
        fabPosition={{ bottom: '16px', right: '16px' }}
      />
    </Frame>
  ),
};
