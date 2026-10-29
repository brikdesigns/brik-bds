/**
 * ADR-045 § 4 / WAI-ARIA APG toggle button — "it is critical the label on a
 * toggle does not change when its state changes". State lives in
 * `aria-pressed`; the accessible name stays fixed.
 *
 * JSX is avoided (the `components` vitest project globs `*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompletionToggle } from './CompletionToggle';

const html = (checked: boolean, extra: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(CompletionToggle, { checked, onCheckedChange: () => {}, ...extra }));

const label = (markup: string) => markup.match(/aria-label="([^"]*)"/)?.[1];

describe('CompletionToggle accessible name', () => {
  it('is the same label in both states', () => {
    expect(label(html(false))).toBeDefined();
    expect(label(html(true))).toBe(label(html(false)));
  });

  it('keeps aria-pressed as the state carrier', () => {
    expect(html(false)).toContain('aria-pressed="false"');
    expect(html(true)).toContain('aria-pressed="true"');
  });

  it('still honours a consumer aria-label in both states', () => {
    expect(label(html(false, { 'aria-label': 'Task done' }))).toBe('Task done');
    expect(label(html(true, { 'aria-label': 'Task done' }))).toBe('Task done');
  });
});
