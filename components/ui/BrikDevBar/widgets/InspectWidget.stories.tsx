import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { BrikDevBar } from '../BrikDevBar';

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
  title: 'Dev Tools/widgets/Inspect',
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

/** @summary URL auto-activation */
export const AutoActivated: Story = {
  name: 'Auto-activated via ?inspect=1',
  render: () => {
    useEffect(() => {
      const url = new URL(window.location.href);
      if (url.searchParams.get('inspect') !== '1') {
        url.searchParams.set('inspect', '1');
        window.history.replaceState({}, '', url.toString());
      }
    }, []);
    return <InspectDemo />;
  },
};
