import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { BrikDevBar } from '../BrikDevBar';

/**
 * Brik feedback widget — vanilla, two modes (since brik-bds#467).
 *
 * Source: components/ui/BrikDevBar/widgets/feedback-widget.js (canonical).
 *
 * Modes (opt-in via `data-mode`):
 *   - **pin** (default) — click-anywhere pin-drop overlay for external clients
 *     reviewing pre-launch mockups. Anonymous via `data-review-token`. Pins
 *     POST to `portal.brikdesigns.com`. Used by vale-partners-mockups.
 *   - **form** (Phase 2) — type-button + textarea panel mirroring the React
 *     `DevFeedbackWidget`. Authenticated via host-page session cookies.
 *     Submissions POST to `data-endpoint`. Integrates with `BrikDevBar` if
 *     present; falls back to a standalone FAB. Target: brikdesigns staging
 *     admin QA (Phase 3 of brikdesigns/brik-llm#352).
 *
 * Auth (opt-in via `data-auth`):
 *   - **review-token** (default) — pin-mode flow.
 *   - **user** (Phase 2) — form-mode only; cookies for auth.
 */
const meta: Meta = {
  title: 'Dev Tools/widgets/Feedback',
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

const MARKER = 'data-brik-feedback-loader';

function clearWidgetMounts() {
  document.querySelectorAll(`script[${MARKER}]`).forEach((n) => n.remove());
  document.querySelectorAll('[class*="bfb-"], [class*="bff-"]').forEach((n) => n.remove());
}

function loadPinScript(token: string) {
  clearWidgetMounts();
  const s = document.createElement('script');
  s.src = '/brik-feedback-widget.js';
  s.async = false;
  s.setAttribute(MARKER, '');
  s.setAttribute('data-review-token', token);
  s.setAttribute('data-api-url', 'https://portal.brikdesigns.com');
  document.head.appendChild(s);
}

function loadFormUserScript(endpoint: string) {
  clearWidgetMounts();
  const s = document.createElement('script');
  s.src = '/brik-feedback-widget.js';
  s.async = false;
  s.setAttribute(MARKER, '');
  s.setAttribute('data-mode', 'form');
  s.setAttribute('data-auth', 'user');
  s.setAttribute('data-endpoint', endpoint);
  s.setAttribute('data-context-label', 'Page');
  document.head.appendChild(s);
}

function PinDemo({ token }: { token: string }) {
  useEffect(() => {
    loadPinScript(token);
    return clearWidgetMounts;
  }, [token]);

  return (
    <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', maxWidth: 720 }}>
      <h2 style={{ fontSize: 'var(--heading-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        Pin-drop mode (default)
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--gap-sm)' }}>
        Toolbar appears bottom-right. Toggle pin mode, then click anywhere in the iframe to drop
        a pin and leave a comment.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--body-sm)', marginTop: 'var(--gap-md)' }}>
        Submissions will 401 in this story (no real review token) — the UI renders, but the POST
        won&apos;t succeed. That&apos;s expected for the demo.
      </p>
    </div>
  );
}

function FormUserDemo({ withDevBar, endpoint }: { withDevBar: boolean; endpoint: string }) {
  useEffect(() => {
    // Mount DevBar shell first when requested so the widget registers as a slot
    // instead of falling back to its FAB.
    loadFormUserScript(endpoint);
    return clearWidgetMounts;
  }, [endpoint]);

  return (
    <>
      {withDevBar && <BrikDevBar />}
      <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', maxWidth: 720 }}>
        <h2 style={{ fontSize: 'var(--heading-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Form mode (Phase 2)
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--gap-sm)' }}>
          {withDevBar
            ? 'Open the Feedback slot in the DevBar (bottom of preview). The panel matches the React DevFeedbackWidget UI: 4 type buttons + textarea + context line + submit.'
            : 'No DevBar mounted — the widget renders its standalone FAB at bottom-left. Click 💬 to open the panel.'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--body-sm)', marginTop: 'var(--gap-md)' }}>
          Submissions POST to <code>{endpoint}</code> with <code>credentials: &apos;include&apos;</code>.
          In Storybook the call will 404; the UI exercises the full form flow regardless.
        </p>
      </div>
    </>
  );
}

/** @summary Pin mode (default) */
export const PinMode: Story = {
  name: 'Pin mode (default · sample review token)',
  render: () => <PinDemo token="storybook-demo-token" />,
};

/** @summary Pin mode missing token */
export const PinNoToken: Story = {
  name: 'Pin mode · missing token → widget disabled',
  render: () => <PinDemo token="" />,
};

/** @summary Form mode in DevBar slot */
export const FormUserInDevBar: Story = {
  name: 'Form + user-auth · in DevBar slot',
  render: () => <FormUserDemo withDevBar={true} endpoint="/api/feedback" />,
};

/** @summary Form mode standalone FAB */
export const FormUserStandalone: Story = {
  name: 'Form + user-auth · standalone FAB (no DevBar)',
  render: () => <FormUserDemo withDevBar={false} endpoint="/api/feedback" />,
};
