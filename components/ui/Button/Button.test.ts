/**
 * ADR-045 § 4 — `Button` `selected` stays a visual state, and when it is
 * defined the button also announces itself as a toggle via `aria-pressed`.
 * Left undefined, an ordinary button never reads as a toggle.
 *
 * JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from './Button';

const html = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(Button as never, props, 'Label'));

describe('Button selected -> aria-pressed', () => {
  it('omits aria-pressed when selected is not passed', () => {
    const markup = html({});
    expect(markup).not.toContain('aria-pressed');
    expect(markup).not.toContain('bds-button--selected');
  });

  it('sets aria-pressed="true" and the selected class when selected', () => {
    const markup = html({ selected: true });
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('bds-button--selected');
  });

  it('sets aria-pressed="false" without the selected class when selected={false}', () => {
    const markup = html({ selected: false });
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).not.toContain('bds-button--selected');
  });

  it('lets a consumer-supplied aria-pressed win (portal call sites add it by hand today)', () => {
    expect(html({ selected: true, 'aria-pressed': 'mixed' })).toContain('aria-pressed="mixed"');
  });

  it('does not put aria-pressed on an anchor (the attribute is not valid on role=link)', () => {
    const markup = html({ selected: true, href: '/x' });
    expect(markup).toContain('<a');
    expect(markup).toContain('bds-button--selected');
    expect(markup).not.toContain('aria-pressed');
  });
});

/**
 * #1983 — `variant` is the form axis only. Valence rides `tone`, hue source
 * rides `emphasis` (ADR-033 § 2). Retired `variant` values still resolve.
 */
import { vi, beforeEach, afterEach } from 'vitest';
import { composeButtonClasses } from './Button';

describe('Button tone × form (#1983)', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  const cls = (props: Record<string, unknown>) => composeButtonClasses(props as never).split(' ');

  it.each(['primary', 'outline', 'ghost'])('ships tone="negative" on %s', (variant) => {
    const c = cls({ variant, tone: 'negative' });
    expect(c).toContain(`bds-button--${variant}`);
    expect(c).toContain('bds-button--tone-negative');
    expect(warn).not.toHaveBeenCalled();
  });

  it('ships tone="positive" on primary only', () => {
    expect(cls({ variant: 'primary', tone: 'positive' })).toContain('bds-button--tone-positive');
    const c = cls({ variant: 'outline', tone: 'positive' });
    expect(c).toContain('bds-button--outline');
    expect(c).not.toContain('bds-button--tone-positive');
  });

  it('drops a tone on secondary and warns', () => {
    const c = cls({ variant: 'secondary', tone: 'negative' });
    expect(c).toContain('bds-button--secondary');
    expect(c).not.toContain('bds-button--tone-negative');
    expect(warn).toHaveBeenCalled();
  });

  it('puts emphasis on a primary-form fill', () => {
    const c = cls({ emphasis: 'inverse' });
    expect(c).toContain('bds-button--inverse');
    expect(c).not.toContain('bds-button--primary');
    expect(cls({ emphasis: 'on-color' })).toContain('bds-button--on-color');
  });

  it('drops emphasis on outline / alongside tone, and warns', () => {
    expect(cls({ variant: 'outline', emphasis: 'inverse' })).not.toContain('bds-button--inverse');
    expect(cls({ tone: 'negative', emphasis: 'inverse' })).not.toContain('bds-button--inverse');
    expect(warn).toHaveBeenCalled();
  });

  it.each([
    ['negative', 'bds-button--tone-negative'],
    ['positive', 'bds-button--tone-positive'],
    ['destructive', 'bds-button--tone-negative'],
    ['danger-outline', 'bds-button--tone-negative'],
    ['inverse', 'bds-button--inverse'],
    ['on-color', 'bds-button--on-color'],
  ])('still honours retired variant="%s"', (variant, expected) => {
    expect(cls({ variant })).toContain(expected);
    expect(warn).toHaveBeenCalled();
  });

  it('an explicit tone beats the tone a retired variant implies', () => {
    const c = cls({ variant: 'negative', tone: 'positive' });
    expect(c).toContain('bds-button--tone-positive');
    expect(c).not.toContain('bds-button--tone-negative');
  });

  it('renders the pair through <Button>', () => {
    expect(html({ variant: 'ghost', tone: 'negative' })).toContain('bds-button--ghost bds-button--tone-negative');
  });
});
