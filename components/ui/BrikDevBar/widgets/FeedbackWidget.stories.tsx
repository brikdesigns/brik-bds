import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';

/**
 * Brik Review — pin-drop feedback overlay (vanilla).
 *
 * Source: components/ui/BrikDevBar/widgets/feedback-widget.js (canonical).
 *
 * Audience: external clients reviewing pre-launch mockups. Auth via
 * `data-review-token`. Pins POST to `portal.brikdesigns.com` (configurable
 * via `data-api-url`).
 *
 * Distinct from `DevFeedbackWidget.tsx` (the React form-style widget for
 * authenticated internal staff). Phase 2 (#467) widens this vanilla widget
 * to support form-mode + user-auth so the two can converge.
 *
 * Configuration via script data-attrs:
 *   - data-review-token="..."   required; widget no-ops without it
 *   - data-api-url="..."        defaults to portal.brikdesigns.com
 *   - data-variant-key="..."    optional; identifies which variant the pin lands on
 */
const meta: Meta = {
  title: 'Dev Tools/widgets/Feedback (pin-drop)',
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

function loadFeedbackScript(token: string) {
  const MARKER = 'data-brik-feedback-loader';
  const existing = document.querySelector(`script[${MARKER}]`);
  if (existing) existing.remove();

  const s = document.createElement('script');
  s.src = '/brik-feedback-widget.js';
  s.async = false;
  s.setAttribute(MARKER, '');
  s.setAttribute('data-review-token', token);
  s.setAttribute('data-api-url', 'https://portal.brikdesigns.com');
  document.head.appendChild(s);
}

function FeedbackDemo({ token }: { token: string }) {
  useEffect(() => {
    loadFeedbackScript(token);
    return () => {
      // Clean up overlay nodes if the widget mounted any
      document.querySelectorAll('[class*="bfb-"]').forEach((n) => n.remove());
    };
  }, [token]);

  return (
    <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', maxWidth: 720 }}>
      <h2 style={{ fontSize: 'var(--heading-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        Pin-drop feedback widget
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--gap-sm)' }}>
        The toolbar should appear in the bottom-right of this preview. Toggle pin mode, then
        click anywhere in the iframe to drop a pin and write a comment.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--body-sm)', marginTop: 'var(--gap-md)' }}>
        Submissions in this story will fail the network call (no real review token) — the UI
        renders fully but the POST will 401. That&apos;s expected for the demo.
      </p>
    </div>
  );
}

/** @summary Default playground */
export const Default: Story = {
  name: 'Default (sample review token)',
  render: () => <FeedbackDemo token="storybook-demo-token" />,
};

/** @summary Missing token */
export const NoToken: Story = {
  name: 'No token → widget stays disabled',
  render: () => <FeedbackDemo token="" />,
};
