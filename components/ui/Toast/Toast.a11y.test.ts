/**
 * Toast live-region regression test (#1374).
 *
 * Toast hardcoded `role="alert"` with no `aria-live`. `role="alert"` carries
 * an implicit `aria-live="assertive"`, so every toast — including routine
 * "Saved" confirmations — interrupted screen-reader speech. The default is
 * now polite, with `urgency="assertive"` as the opt-in escalation.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`), matching Select.ssr.test.ts.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Toast } from './Toast';

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Toast, { title: 'Saved', ...props } as never));

describe('Toast live region', () => {
  it('announces politely by default', () => {
    const html = render({});
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('aria-live="assertive"');
  });

  it('escalates to assertive on request', () => {
    const html = render({ urgency: 'assertive' });
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).not.toContain('role="status"');
  });

  it('keeps urgency independent of variant', () => {
    // A red toast is not automatically an interrupting one — colour is for
    // sighted users, live-region priority is a separate axis.
    const html = render({ variant: 'error' });
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
  });
});
