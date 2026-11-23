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
 * #3275 — Button's style is one flat `variant` list (ADR-033 § Amendments).
 * The class is `bds-button--variant-{value}`. The retired `danger*` / `destructive`
 * values still fold in for one minor.
 */
import { vi, beforeEach, afterEach } from 'vitest';
import { composeButtonClasses } from './Button';

describe('Button flat variant (#3275)', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  const cls = (props: Record<string, unknown>) => composeButtonClasses(props as never).split(' ');

  it.each([
    'primary', 'secondary', 'outline', 'ghost', 'inverse', 'on-color',
    'negative', 'negative-outline', 'negative-ghost', 'positive',
  ])('emits one class for variant="%s" and warns nothing', (variant) => {
    const c = cls({ variant });
    expect(c).toContain(`bds-button--variant-${variant}`);
    expect(c.filter((x) => x.startsWith('bds-button--variant-'))).toHaveLength(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it('defaults to primary', () => {
    expect(cls({})).toContain('bds-button--variant-primary');
  });

  it.each([
    [{ variant: 'destructive' }, 'negative'],
    [{ variant: 'danger' }, 'negative'],
    [{ variant: 'danger-outline' }, 'negative-outline'],
    [{ variant: 'danger-ghost' }, 'negative-ghost'],
  ])('folds retired %o into variant="%s"', (props, expected) => {
    expect(cls(props)).toContain(`bds-button--variant-${expected}`);
  });

  it('renders through <Button>', () => {
    expect(html({ variant: 'negative-ghost' })).toContain('bds-button--variant-negative-ghost');
  });
});
