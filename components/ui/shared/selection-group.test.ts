/**
 * ADR-045 — selection semantics follow cardinality.
 *
 * Markup contract for the group-aware items: inside a `RadioGroup` /
 * `CheckboxGroup` an `InteractiveListItem` / `SelectableMediaTile` renders as a
 * `<label>` wrapping a visually hidden native input (radio / checkbox) and
 * never `aria-pressed`; outside a group it stays the `<button aria-pressed>`
 * toggle. Keyboard + change behaviour is native and is asserted by the
 * `play` functions in RadioGroup.stories.tsx / CheckboxGroup.stories.tsx.
 *
 * JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RadioGroup } from '../RadioGroup';
import { CheckboxGroup } from '../CheckboxGroup';
import { InteractiveListItem } from '../InteractiveListItem';
import { SelectableMediaTile } from '../SelectableMediaTile';

const html = (el: ReactNode) => renderToStaticMarkup(el);

const tile = (value: string) =>
  createElement(SelectableMediaTile, { key: value, value, src: `${value}.png`, alt: value, caption: value });

const row = (value: string) =>
  createElement(InteractiveListItem, { key: value, value, title: `Row ${value}` });

const count = (markup: string, needle: string) => markup.split(needle).length - 1;

describe('SelectableMediaTile inside a RadioGroup', () => {
  const markup = html(
    createElement(RadioGroup, { legend: 'Hero photo', name: 'hero', value: 'b' }, tile('a'), tile('b'), tile('c')),
  );

  it('renders each tile as a <label> wrapping a native radio, not a <button>', () => {
    expect(count(markup, '<label')).toBe(3);
    expect(count(markup, 'type="radio"')).toBe(3);
    expect(markup).not.toContain('<button');
  });

  it('shares the group name and gives each radio its own value', () => {
    expect(count(markup, 'name="hero"')).toBe(3);
    for (const v of ['a', 'b', 'c']) expect(markup).toContain(`value="${v}"`);
  });

  it('checks only the option the group value selects', () => {
    expect(count(markup, 'checked=""')).toBe(1);
    expect(markup).toMatch(/<input[^>]*value="b"[^>]*checked=""|<input[^>]*checked=""[^>]*value="b"/);
  });

  it('takes the selected visual from the group and never sets aria-pressed', () => {
    expect(count(markup, 'bds-selectable-media-tile--selected')).toBe(1);
    expect(markup).not.toContain('aria-pressed');
  });

  it('renders inside the group fieldset, after the legend', () => {
    expect(markup).toMatch(/<fieldset[^>]*role="radiogroup"/);
    expect(markup.indexOf('<legend')).toBeGreaterThan(-1);
    expect(markup.indexOf('<legend')).toBeLessThan(markup.indexOf('<label'));
  });
});

describe('InteractiveListItem inside a CheckboxGroup', () => {
  const markup = html(
    createElement(CheckboxGroup, { legend: 'Services', value: ['a', 'c'] }, row('a'), row('b'), row('c')),
  );

  it('renders each row as a <label> wrapping a native checkbox', () => {
    expect(count(markup, '<label')).toBe(3);
    expect(count(markup, 'type="checkbox"')).toBe(3);
    expect(markup).not.toContain('<button');
  });

  it('checks every option in the group value array', () => {
    expect(count(markup, 'checked=""')).toBe(2);
    expect(count(markup, 'bds-interactive-list-item--selected')).toBe(2);
    expect(markup).not.toContain('aria-pressed');
  });

  it('keeps the size modifier on the label root', () => {
    expect(count(markup, 'bds-interactive-list-item--md')).toBe(3);
  });
});

describe('group disabled', () => {
  it('disables every native input and marks the item disabled', () => {
    const markup = html(
      createElement(RadioGroup, { legend: 'Hero photo', disabled: true, value: 'a' }, tile('a'), tile('b')),
    );
    expect(count(markup, 'disabled=""')).toBeGreaterThanOrEqual(2);
    expect(count(markup, 'bds-selectable-media-tile--disabled')).toBe(2);
  });
});

describe('outside a group the items stay aria-pressed toggle buttons', () => {
  it('InteractiveListItem', () => {
    const markup = html(createElement(InteractiveListItem, { title: 'Solo', selected: true }));
    expect(markup).toContain('<button');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).not.toContain('<input');
  });

  it('SelectableMediaTile', () => {
    const markup = html(createElement(SelectableMediaTile, { src: 'a.png', alt: 'a', selected: false }));
    expect(markup).toContain('<button');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).not.toContain('<input');
  });
});

describe('the options API is unchanged', () => {
  it('RadioGroup options still render Radio items', () => {
    const markup = html(
      createElement(RadioGroup, {
        legend: 'Plan',
        name: 'plan',
        value: 'pro',
        options: [
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
        ],
      }),
    );
    expect(count(markup, 'bds-radio__input')).toBe(2);
    expect(count(markup, 'checked=""')).toBe(1);
  });

  it('CheckboxGroup options still render Checkbox items and select-all', () => {
    const markup = html(
      createElement(CheckboxGroup, {
        legend: 'Channels',
        selectAllLabel: 'All',
        value: ['a'],
        options: [
          { label: 'Alpha', value: 'a' },
          { label: 'Bravo', value: 'b' },
        ],
      }),
    );
    expect(count(markup, 'type="checkbox"')).toBe(3);
    expect(markup).toContain('All');
  });
});
