/**
 * ServiceTag `icon` slot (#2417) — a consumer glyph replaces the resolved
 * service icon in the `icon` and `icon-text` variants, inside the sized,
 * decorative wrapper, and is ignored by `text` and `dot`.
 *
 * JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServiceTag, type ServiceTagProps } from './ServiceTag';

const GLYPH = createElement('i', { 'data-glyph': 'check' });

const html = (props: Partial<ServiceTagProps>) =>
  renderToStaticMarkup(createElement(ServiceTag, { category: 'marketing', ...props }));

const WRAPPER = 'class="bds-service-tag__icon"';

describe('ServiceTag icon slot', () => {
  it('replaces the service glyph in the icon variant', () => {
    const markup = html({ variant: 'icon', icon: GLYPH });
    expect(markup).toContain(`<span aria-hidden="true" ${WRAPPER}><i data-glyph="check"></i></span>`);
    expect(markup).not.toContain('<svg');
  });

  it('shows the glyph in icon-text even without a serviceName', () => {
    const markup = html({ variant: 'icon-text', icon: GLYPH, label: 'Starter Stack' });
    expect(markup).toContain('bds-service-tag--has-icon');
    expect(markup).toContain('data-glyph="check"');
    expect(markup).toContain('Starter Stack');
  });

  it('is ignored by the text and dot variants', () => {
    expect(html({ variant: 'text', icon: GLYPH })).not.toContain('data-glyph');
    expect(html({ variant: 'dot', icon: GLYPH })).not.toContain('data-glyph');
  });

  it('keeps the bundled service glyph when no icon is passed', () => {
    const markup = html({ variant: 'icon', serviceName: 'Email Marketing' });
    expect(markup).toContain('<svg');
    expect(markup).not.toContain('<span aria-hidden="true" class="bds-service-tag__icon">');
  });
});
