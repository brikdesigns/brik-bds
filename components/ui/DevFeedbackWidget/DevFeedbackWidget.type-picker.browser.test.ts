import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DevFeedbackWidget, type DevFeedbackWidgetProps } from './DevFeedbackWidget';

// The `= {}` default on the props parameter defeats createElement's overload
// inference, so the component is typed explicitly.
const Widget: React.FC<DevFeedbackWidgetProps> = DevFeedbackWidget;

/**
 * The feedback-type picker is a pick-one group, so ADR-045 § 1 gives it radio
 * semantics: native `<input type="radio">` sharing a `name`, inside
 * `<fieldset>` + `<legend>`. The visible pill is a BDS `Chip` (#3319).
 *
 * Asserted rather than described, because the failure looks correct: a Chip
 * wired with `onChipClick` still renders and still selects on click, while
 * losing the one-Tab-stop, arrow-keys-move-and-check model the browser gives
 * native radios for free (ADR-045 § 3).
 *
 * Browser-only: arrow-key radio navigation is a real-browser behavior that
 * jsdom does not implement. Runs under the `components-browser` project.
 */

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

async function openPanel(): Promise<HTMLInputElement[]> {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => {
    root!.render(
      React.createElement(Widget, { variant: 'fab', endpoint: '/api/feedback' }),
    );
  });
  const fab = document.querySelector<HTMLElement>('[role="button"][aria-label="Open feedback"]');
  expect(fab).not.toBeNull();
  await userEvent.click(fab!);
  const fieldset = Array.from(document.querySelectorAll('fieldset')).find(
    (f) => f.querySelector('legend')?.textContent === 'Feedback type',
  );
  expect(fieldset).toBeDefined();
  return Array.from(fieldset!.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
}

const checkedValue = (radios: HTMLInputElement[]) => radios.find((r) => r.checked)?.value;

describe('DevFeedbackWidget — feedback-type picker (#3319)', () => {
  it('renders one native radio per type, sharing a name, each labelling a Chip', async () => {
    const radios = await openPanel();
    expect(radios.map((r) => r.value)).toEqual(['bug', 'ui', 'suggestion', 'question']);
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    expect(checkedValue(radios)).toBe('bug');

    for (const radio of radios) {
      const chip = radio.closest('label')?.querySelector('.bds-chip');
      expect(chip).not.toBeNull();
      // The Chip is presentation only — the radio is the one interactive element.
      expect(chip!.getAttribute('role')).toBeNull();
      expect(chip!.hasAttribute('tabindex')).toBe(false);
    }
  });

  it('marks only the selected type as the primary Chip', async () => {
    const radios = await openPanel();
    const chipOf = (value: string) =>
      radios.find((r) => r.value === value)!.closest('label')!.querySelector('.bds-chip')!;
    expect(chipOf('bug').className).toContain('bds-chip--variant-primary');
    expect(chipOf('ui').className).toContain('bds-chip--variant-secondary');
  });

  it('keeps the selected Chip Poppy on a dark host, whatever the theme tokens say', async () => {
    // The panel is always white, so a theme-following Chip would go light on
    // white in dark mode. This project loads no token stylesheet, so it also
    // stands in for the stylesheet-failed case the widget guards against.
    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      const radios = await openPanel();
      const chipOf = (value: string) =>
        radios.find((r) => r.value === value)!.closest('label')!.querySelector<HTMLElement>('.bds-chip')!;
      expect(getComputedStyle(chipOf('bug')).backgroundColor).toBe('rgb(227, 83, 53)');
      expect(getComputedStyle(chipOf('bug')).color).toBe('rgb(255, 255, 255)');
      expect(getComputedStyle(chipOf('ui')).backgroundColor).toBe('rgb(255, 255, 255)');
    } finally {
      document.documentElement.removeAttribute('data-theme');
    }
  });

  it('selects a type when its Chip is clicked', async () => {
    const radios = await openPanel();
    const uiChip = radios.find((r) => r.value === 'ui')!.closest('label')!.querySelector('.bds-chip')!;
    await userEvent.click(uiChip);
    expect(checkedValue(radios)).toBe('ui');
    expect(uiChip.className).toContain('bds-chip--variant-primary');
  });

  it('moves and checks the selection with arrow keys (native radio model)', async () => {
    const radios = await openPanel();
    act(() => radios[0].focus());
    await userEvent.keyboard('{ArrowRight}');
    expect(checkedValue(radios)).toBe('ui');
    expect(document.activeElement).toBe(radios[1]);
    await userEvent.keyboard('{ArrowLeft}');
    expect(checkedValue(radios)).toBe('bug');
  });
});
