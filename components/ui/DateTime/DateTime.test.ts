/**
 * DateTime renders one of three shapes inside a `<time dateTime={ISO}>`.
 * JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DateTime, type DateTimeProps } from './DateTime';

const render = (props: DateTimeProps) => renderToStaticMarkup(createElement(DateTime, props));

const INSTANT = '2026-11-06T20:30:00Z';
const ZONE = 'America/Chicago';
const NOW = new Date('2026-11-09T20:30:00Z');

describe('DateTime', () => {
  it('date mode renders the calendar day in a <time dateTime>', () => {
    const html = render({ value: '2026-11-06', mode: 'date' });
    expect(html).toContain('<time');
    expect(html).toContain('dateTime="2026-11-06"');
    expect(html).toContain('>Nov 6, 2026</time>');
  });

  it('date mode does not shift a date-only string with the zone', () => {
    const html = render({ value: '2026-11-06', timeZone: 'Pacific/Auckland' });
    expect(html).toContain('>Nov 6, 2026</time>');
  });

  it('a date-only string renders as its day in every mode and carries no time', () => {
    for (const mode of ['timestamp', 'relative'] as const) {
      const html = render({ value: '2026-11-06', mode, timeZone: ZONE, now: NOW });
      expect(html).toContain('dateTime="2026-11-06"');
      expect(html).toContain('>Nov 6, 2026</time>');
      expect(html).not.toContain('title=');
    }
  });

  it('a non-ISO string is normalised to an ISO dateTime attribute', () => {
    const html = render({ value: 'Nov 6, 2026 20:30 UTC', mode: 'timestamp', timeZone: ZONE });
    expect(html).toContain('dateTime="2026-11-06T20:30:00.000Z"');
  });

  it('timestamp mode carries a zone label', () => {
    const html = render({ value: INSTANT, mode: 'timestamp', timeZone: ZONE });
    expect(html).toContain(`dateTime="${new Date(INSTANT).toISOString()}"`);
    expect(html).toContain('>Nov 6, 2026, 2:30 PM CST</time>');
  });

  it('relative mode renders an age and titles it with the exact zone-labelled timestamp', () => {
    const html = render({ value: INSTANT, mode: 'relative', timeZone: ZONE, now: NOW });
    expect(html).toContain('>3 days ago</time>');
    expect(html).toContain('title="Nov 6, 2026, 2:30 PM CST"');
    expect(html).toContain(`dateTime="${new Date(INSTANT).toISOString()}"`);
  });

  it('relative mode handles the future and the present', () => {
    expect(render({ value: '2026-11-11T20:30:00Z', mode: 'relative', now: NOW })).toContain('in 2 days');
    expect(render({ value: NOW, mode: 'relative', now: NOW })).toContain('>now</time>');
  });

  it('a Date value serializes to ISO for dateTime', () => {
    const html = render({ value: new Date(INSTANT), mode: 'timestamp', timeZone: ZONE });
    expect(html).toContain(`dateTime="${INSTANT.replace('Z', '.000Z')}"`);
  });

  it.each(['date', 'timestamp', 'relative'] as const)('%s mode with null renders the empty label, not a <time>', (mode) => {
    const html = render({ value: null, mode });
    expect(html).not.toContain('<time');
    expect(html).toContain('>—</span>');
  });

  it('honours a custom emptyLabel and treats unparseable values as empty', () => {
    const html = render({ value: 'not-a-date', emptyLabel: 'Never' });
    expect(html).toContain('>Never</span>');
    expect(html).not.toContain('<time');
  });
});
