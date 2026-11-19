import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import '../../../tokens/figma-tokens.css';
import '../../../tokens/gap-fills.css';
import { Sheet } from '../Sheet/Sheet';
import { DatePicker } from '../DatePicker/DatePicker';
import { Popover } from '../Popover/Popover';

/**
 * Popover and DatePicker inside a Sheet (brik-bds#3259): Radix portals the
 * panel to `body`, where the popper wrapper's z-index (100) sits below
 * `--bds-z-sheet` (901). The panel must be the topmost thing at its centre.
 */

const h = React.createElement;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function mountInSheet(child: React.ReactElement) {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(h(Sheet, { isOpen: true, onClose: () => {}, title: 'Sheet' }, child));
  });
  const trigger = document.querySelector<HTMLElement>('.bds-sheet button[aria-haspopup="dialog"]')!;
  await userEvent.click(trigger);
  await act(async () => {
    for (let i = 0; i < 4; i++) await frame();
  });
}

function expectPanelOnTop(panel: HTMLElement | null) {
  expect(panel).not.toBeNull();
  const r = panel!.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  expect(hit).not.toBeNull();
  expect(panel!.contains(hit), `hit: ${(hit as HTMLElement).className}`).toBe(true);
}

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  host?.remove();
});

describe('overlays hosted in a Sheet (#3259)', () => {
  it('a DatePicker panel is the topmost element at its centre', async () => {
    await mountInSheet(h(DatePicker, { value: new Date(2026, 10, 18), onChange: () => {}, label: 'Due' }));
    expectPanelOnTop(document.querySelector<HTMLElement>('[aria-label="Choose date"]'));
  });

  it('a Popover panel is the topmost element at its centre', async () => {
    await mountInSheet(
      h(Popover, { content: h('p', null, 'Popover body'), panelLabel: 'Details', children: h('button', { type: 'button' }, 'Open') }),
    );
    expectPanelOnTop(document.querySelector<HTMLElement>('.bds-popover__panel'));
  });
});
