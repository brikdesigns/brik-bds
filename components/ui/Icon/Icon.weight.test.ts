/**
 * Icon weight-resolution regression test (#1050).
 *
 * `<Icon>` picks its Phosphor weight in this precedence: explicit `weight` prop
 * → ambient provider default (ThemeProvider's `defaultIconWeight`) → `'bold'`.
 * Weight is applied by rewriting the Phosphor icon *name* (`ph:star` →
 * `ph:star-fill`), so the contract under test is the resolved name handed to
 * Iconify — not pixels. We stub `@iconify/react` to echo that name into markup,
 * making the assertion deterministic and independent of the bundled subset;
 * React context propagates through `renderToStaticMarkup`, so ThemeProvider's
 * default reaches the nested `<Icon>` with no DOM.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import type { IconWeight } from './icon-weight';

vi.mock('@iconify/react', async () => {
  const { createElement: h } = await import('react');
  return {
    addCollection: () => {},
    // Echo the resolved icon name so the rendered markup reveals the weight.
    Icon: (props: { icon?: unknown }) => h('span', { 'data-icon': String(props.icon) }),
  };
});

// Imported after the mock so Icon.tsx binds to the stubbed Iconify Icon.
const { Icon } = await import('./Icon');
const { ThemeProvider } = await import('../../providers/ThemeProvider');

const nameOf = (markup: string) => markup.match(/data-icon="([^"]*)"/)?.[1];

const render = (
  defaultIconWeight: IconWeight | undefined,
  props: { weight?: IconWeight },
) => {
  const icon = createElement(Icon, { icon: 'ph:star', ...props });
  const tree = defaultIconWeight
    ? createElement(ThemeProvider, { defaultIconWeight, persist: false, applyToBody: false, children: icon })
    : icon;
  return nameOf(renderToStaticMarkup(tree));
};

describe('Icon — weight resolution', () => {
  it('falls back to bold with no provider and no prop', () => {
    expect(render(undefined, {})).toBe('ph:star-bold');
  });

  it('takes the provider default when no prop is given', () => {
    expect(render('fill', {})).toBe('ph:star-fill');
  });

  it('lets an explicit weight prop win over the provider default', () => {
    expect(render('fill', { weight: 'bold' })).toBe('ph:star-bold');
  });

  it('regular resolves to the unsuffixed Phosphor name (no rewrite)', () => {
    expect(render('bold', { weight: 'regular' })).toBe('ph:star');
  });
});
