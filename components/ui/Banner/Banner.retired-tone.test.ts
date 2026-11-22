/**
 * #3313 — `announcement` left the Banner tone union for `emphasis="brand"`.
 * Asserts the wiring: the retired spelling still renders the brand surface and
 * landmark role, and `emphasis` (not `tone`) decides the role split.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Banner } from './Banner';

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Banner, { title: 'Title', ...props } as never));

describe('Banner emphasis and retired announcement tone', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to the brand surface with role="banner"', () => {
    const html = render({});
    expect(html).toContain('bds-banner--emphasis-brand');
    expect(html).toContain('role="banner"');
  });

  it('maps the retired tone="announcement" onto emphasis brand and warns', () => {
    const html = render({ tone: 'announcement' });
    expect(html).toContain('bds-banner--emphasis-brand');
    expect(html).not.toContain('bds-banner--tone-announcement');
    expect(html).toContain('role="banner"');
    expect(console.warn).toHaveBeenCalled();
  });

  it('renders a status tone without the brand surface', () => {
    const html = render({ tone: 'warning' });
    expect(html).toContain('bds-banner--tone-warning');
    expect(html).not.toContain('bds-banner--emphasis-brand');
    expect(html).toContain('role="alert"');
  });

  it('keys the landmark role off emphasis: brand + tone stays role="banner" and keeps the Badge', () => {
    const html = render({ tone: 'warning', emphasis: 'brand' });
    expect(html).toContain('bds-banner--emphasis-brand');
    expect(html).toContain('bds-banner--tone-warning');
    expect(html).toContain('role="banner"');
    expect(html).toContain('bds-badge');
  });

  it('keeps positive as role="status"', () => {
    expect(render({ tone: 'positive' })).toContain('role="status"');
  });
});
