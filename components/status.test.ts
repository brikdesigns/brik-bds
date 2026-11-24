import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { STATUS_MAP } from './status';
import { Banner } from './ui/Banner';
import { Toast } from './ui/Toast';

// Icons render nothing on the server, so stand in a marker that carries the
// requested name and assert on it.
vi.mock('./ui/Icon', () => ({
  Icon: ({ icon }: { icon: string }) => createElement('i', { 'data-icon': icon }),
}));

const has = (html: string, name: string) => html.includes(`data-icon="${name}"`);

describe('STATUS_MAP', () => {
  it('gives every status a tone, icon and label', () => {
    for (const entry of Object.values(STATUS_MAP)) {
      expect(entry.icon).toMatch(/^ph:[a-z-]+$/);
      expect(entry.tone).toBeTruthy();
      expect(entry.label).toBeTruthy();
    }
  });

  it('defines on_hold as info / ph:pause-circle / "On Hold"', () => {
    expect(STATUS_MAP.on_hold).toEqual({ tone: 'info', icon: 'ph:pause-circle', label: 'On Hold' });
  });

  it('renders negative with the same icon in Banner and Toast', () => {
    const banner = renderToStaticMarkup(createElement(Banner, { tone: 'negative', title: 'x' }));
    const toast = renderToStaticMarkup(createElement(Toast, { tone: 'negative', title: 'x' }));
    expect(has(banner, STATUS_MAP.negative.icon)).toBe(true);
    expect(has(toast, STATUS_MAP.negative.icon)).toBe(true);
    expect(has(banner, STATUS_MAP.blocked.icon)).toBe(false);
  });
});
