import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { BrikDevBar } from '../BrikDevBar';
// Raw IIFE source so the interaction test can load the widget exactly as a
// `?inspect=1` page would — currentScript is null under eval, so activation
// comes solely from the URL flag (the path under assertion). Mirrors the
// widget's own browser tests (inspect-widget.detect.browser.test.ts).
import inspectWidgetSource from './inspect-widget.js?raw';

/**
 * Brik Inspect — token & component auditor.
 *
 * Source: components/ui/BrikDevBar/widgets/inspect-widget.js (canonical).
 *
 * Already loaded automatically by `<BrikDevBar />` (BrikDevBar.tsx:85), so
 * mounting the shell is sufficient. This story exists to document the widget
 * surface and exercise its configuration knobs.
 *
 * Configuration via script data-attrs:
 *   - data-auto-enable="1"  loads the toolbar; hover stays off until the user
 *                            clicks the Inspect slot. Default behaviour.
 *
 * Activation paths:
 *   1. Click the Inspect slot in the DevBar.
 *   2. Append `?inspect=1` to the URL.
 *   3. Cmd/Ctrl + Shift + I.
 *   4. localStorage `brik-inspect-enabled=1` persists across sessions.
 */
const meta: Meta = {
  title: 'Tools/inspect-widget',
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

function InspectDemo() {
  return (
    <>
      <BrikDevBar />
      <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', maxWidth: 720 }}>
        <h2 style={{ ...{ fontSize: 'var(--heading-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 } }}>
          Brik Inspect
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--gap-sm)' }}>
          Hover any element to see its computed style audited against BDS tokens. Click to lock
          the panel; click again or hit ESC to release. The inspect script is injected by{' '}
          <code>BrikDevBar.tsx</code> on mount.
        </p>

        <div style={{ marginTop: 'var(--gap-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <SampleCard
            title="Token-clean card"
            body="Every value below routes through a BDS variable — Inspect should show all green."
            style={{
              padding: 'var(--padding-lg)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--border-radius-md)',
              background: 'var(--surface-primary)',
              color: 'var(--text-primary)',
            }}
          />

          <SampleCard
            title="Hardcoded card (intentional)"
            body="Same shape, but raw hex + px. Inspect should flag the hardcoded values — useful for
                  testing that the auditor still catches them."
            style={{
              padding: '24px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#1b1b1b',
            }}
          />
        </div>
      </div>
    </>
  );
}

function SampleCard({
  title,
  body,
  style,
}: {
  title: string;
  body: string;
  style: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <h3 style={{ margin: 0, fontSize: 'var(--heading-sm)', fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: 'var(--gap-sm) 0 0', fontSize: 'var(--body-sm)' }}>{body}</p>
    </div>
  );
}

/** @summary Live inspect demo */
export const LiveDemo: Story = {
  name: 'Live demo (hover sample cards)',
  render: () => <InspectDemo />,
};

/**
 * Asserts the `?inspect=1` activation path (audit #2491): the widget must
 * auto-activate hover on load when the flag is present, not just render the
 * toolbar. A visual story here duplicated `LiveDemo` frame-for-frame, so the
 * value is behavioral — this is a `play`-only assertion, not a snapshot.
 *
 * @summary InteractionTest — ?inspect=1 auto-activates inspect on load
 */
export const InteractionTestUrlActivation: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <div style={{ padding: 'var(--padding-lg)', fontFamily: 'var(--font-family-body)', color: 'var(--text-secondary)' }}>
      Behavioral assertion only — the play function loads the inspect widget with
      <code> ?inspect=1</code> and asserts it auto-activates. No visual surface.
    </div>
  ),
  play: async () => {
    // The URL-activation branch (`if (URL_ENABLED) toggleActive()`) runs once,
    // at the widget's init — a shared-page play cannot re-trigger a widget a
    // prior story already loaded. So drive a fresh IIFE here, exactly as a
    // page load with `?inspect=1` would, and assert it self-activates.
    const original = window.location.href;
    const w = window as unknown as {
      BrikDevBar?: { register(): void; unregister(): void };
      __BRIK_INSPECT_DEVBAR_HOST_MANAGED__?: boolean;
      BrikInspect?: { isActive?(): boolean; setActive?(next: boolean): void };
    };
    // Suppress the widget's page-chrome side effects so this test never leaks
    // into another story's render: the host-managed flag skips DevBar
    // self-registration, and a stub `window.BrikDevBar` defeats the "no DevBar
    // → build a standalone toolbar" 80ms fallback whose lingering toolbar would
    // shift every later baseline (mirrors .storybook/vitest.visual.setup.ts).
    const hadDevBar = 'BrikDevBar' in w;
    w.__BRIK_INSPECT_DEVBAR_HOST_MANAGED__ = true;
    w.BrikDevBar = w.BrikDevBar ?? { register() {}, unregister() {} };
    try {
      const url = new URL(original);
      url.searchParams.set('inspect', '1');
      window.history.replaceState({}, '', url.toString());
      // currentScript is null under eval → AUTO_ENABLE false, so activation is
      // attributable solely to the ?inspect=1 flag.
      // eslint-disable-next-line no-eval
      (0, eval)(inspectWidgetSource);
      await waitFor(() => {
        expect(w.BrikInspect?.isActive?.()).toBe(true);
      });
    } finally {
      // Leave no live inspector: an active capture-phase click handler swallows
      // other stories' userEvent clicks. Deactivating makes the (unremovable)
      // document listeners early-return.
      w.BrikInspect?.setActive?.(false);
      window.history.replaceState({}, '', original);
      // Wait past the widget's 80ms standalone-toolbar fallback before dropping
      // the stub, so the fallback still sees a DevBar and renders nothing.
      await new Promise((r) => setTimeout(r, 150));
      delete w.__BRIK_INSPECT_DEVBAR_HOST_MANAGED__;
      if (!hadDevBar) delete w.BrikDevBar;
    }
  },
};
