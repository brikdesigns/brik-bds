/**
 * ADR-033 valence rename, at the render boundary (#1957).
 *
 * `resolveRetiredValue` is unit-tested on its own; this asserts the wiring —
 * that a retired spelling arriving on the deprecated `status` prop still
 * produces the canonical modifier, so a consumer that has not migrated keeps
 * rendering the same pixels. Badge stands in for the eleven components that
 * share the pattern; it is the one carrying all three kinds of fold
 * (`error`→`negative`, `progress`→`info`, and `info` changing meaning).
 *
 * JSX is avoided to keep this a `.test.ts` file (the `components` vitest
 * project's include glob is `**\/*.test.ts`), matching Toast.a11y.test.ts.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge } from './Badge';

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Badge, props as never, 'Label'));

describe('Badge retired tone values', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the canonical modifier for a canonical tone', () => {
    expect(render({ tone: 'negative' })).toContain('bds-badge--tone-negative');
  });

  it('maps the retired `error` onto `negative`', () => {
    const html = render({ tone: 'error' });
    expect(html).toContain('bds-badge--tone-negative');
    expect(html).not.toContain('bds-badge--error');
  });

  it('maps the retired `progress` onto the blue `info`', () => {
    const html = render({ tone: 'progress' });
    expect(html).toContain('bds-badge--tone-info');
    expect(html).not.toContain('bds-badge--progress');
  });

  it('honours the deprecated `status` prop', () => {
    expect(render({ status: 'error' })).toContain('bds-badge--tone-negative');
  });

  it('lets `tone` win when both props are passed', () => {
    expect(render({ tone: 'positive', status: 'error' })).toContain('bds-badge--tone-positive');
  });

  it('defaults to `info` when neither prop is passed', () => {
    expect(render({})).toContain('bds-badge--tone-info');
  });
});
