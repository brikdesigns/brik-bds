/**
 * Card `layout="control"` source-card contract (brik-bds#3159, ADR-038
 * Amendment 2026-11-14): five statuses, a Disabled state, a typed stamp, and
 * status-driven actions inside a ButtonGroup.
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card } from './Card';

const noop = () => {};
const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(
    createElement(Card as never, { layout: 'control', title: 'Notion', ...props }),
  );

const labelOf = (html: string) =>
  /bds-card__control-status-label">([^<]*)</.exec(html)?.[1];
const buttonLabels = (html: string) =>
  [...html.matchAll(/<(?:button|a)\b[^>]*>(?:<[^>]+>)*([^<]+)</g)].map((m) => m[1]);

describe('Card control statuses', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['not-configured', 'Not configured'],
    ['connected', 'Connected'],
    ['synced', 'Synced'],
    ['error', 'Error'],
    ['disabled', 'Disabled'],
  ])('renders %s as "%s"', (status, label) => {
    const html = render({ connectionStatus: status });
    expect(labelOf(html)).toBe(label);
    expect(html).toContain(`bds-card__control-status--${status}`);
  });

  it.each([
    ['linked', 'connected'],
    ['syncing', 'connected'],
    ['failed', 'error'],
  ])('maps retired %s onto %s', (retired, current) => {
    const html = render({ connectionStatus: retired });
    expect(html).toContain(`bds-card__control-status--${current}`);
    expect(html).not.toContain(`bds-card__control-status--${retired}`);
  });
});

describe('Card control stamp', () => {
  it('renders the timestamp through DateTime with the ISO datetime attribute', () => {
    const html = render({
      connectionStatus: 'synced',
      stamp: { kind: 'synced', at: '2026-11-06T20:30:00.000Z', actor: 'Nick' },
    });
    expect(html).toContain('<time');
    expect(html).toMatch(/dateTime="2026-11-06T20:30:00.000Z"/);
    expect(html).toContain('Last synced');
    expect(html).toContain('by Nick');
  });

  it('labels the stamp by its kind', () => {
    const html = render({
      connectionStatus: 'disabled',
      stamp: { kind: 'disabled', at: '2026-11-06T20:30:00.000Z', actor: 'Brik' },
    });
    expect(html).toMatch(/bds-card__control-status-stamp">Disabled /);
  });

  it('omits the stamp for not-configured', () => {
    const html = render({
      connectionStatus: 'not-configured',
      stamp: { kind: 'synced', at: '2026-11-06T20:30:00.000Z' },
    });
    expect(html).not.toContain('<time');
  });
});

describe('Card control actions', () => {
  it('not-configured shows exactly one Setup button inside a ButtonGroup', () => {
    const html = render({ connectionStatus: 'not-configured', onSetup: noop });
    expect(html).toContain('bds-button-group');
    expect(buttonLabels(html)).toEqual(['Setup']);
  });

  it('error puts Retry before the supplied action', () => {
    const html = render({
      connectionStatus: 'error',
      onRetry: noop,
      action: createElement('button', null, 'Configure'),
    });
    expect(buttonLabels(html)).toEqual(['Retry', 'Configure']);
  });

  it('disabled mutes the card and shows only Enable', () => {
    const html = render({
      connectionStatus: 'disabled',
      onEnable: noop,
      action: createElement('button', null, 'Configure'),
    });
    expect(html).toContain('bds-card--layout-control-disabled');
    expect(buttonLabels(html)).toEqual(['Enable']);
  });

  it('read-only shows one "Manage on profile" link and no status actions', () => {
    const html = render({
      readOnly: true,
      manageHref: '/admin/companies/acme',
      connectionStatus: 'error',
      onRetry: noop,
    });
    expect(html).toContain('href="/admin/companies/acme"');
    expect(buttonLabels(html)).toEqual(['Manage on profile']);
  });
});
