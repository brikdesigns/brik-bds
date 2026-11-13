import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StatusList, type StatusListItem } from './StatusList';

const render = (items: StatusListItem[]) =>
  renderToStaticMarkup(createElement(StatusList, { items }));

const ROW = { id: 'a', title: 'Site Structure' };

describe('StatusList', () => {
  it('renders a distinct badge label and tone per status', () => {
    const html = render([
      { ...ROW, id: '1', status: 'complete' },
      { ...ROW, id: '2', status: 'in_progress' },
      { ...ROW, id: '3', status: 'not_started' },
      { ...ROW, id: '4', status: 'blocked' },
      { ...ROW, id: '5', status: 'negative' },
    ]);
    for (const label of ['Complete', 'In Progress', 'Not Started', 'Blocked', 'Failed']) {
      expect(html).toContain(`>${label}<`);
    }
    for (const tone of ['positive', 'info', 'neutral', 'warning', 'negative']) {
      expect(html).toContain(`bds-badge--tone-${tone}`);
    }
  });

  it('keeps the icon colour on the same tone as the badge', () => {
    const html = render([
      { ...ROW, id: '1', status: 'in_progress' },
      { ...ROW, id: '2', status: 'blocked' },
    ]);
    expect(html).toContain('bds-status-list__icon--status-in-progress');
    expect(html).toContain('bds-status-list__icon--status-blocked');
    expect(html).not.toContain('Error');
  });

  it('renders rows as non-interactive (no button, no strikethrough class)', () => {
    const html = render([{ ...ROW, status: 'complete' }]);
    expect(html).not.toContain('<button');
    expect(html).toContain('bds-interactive-list-item--readonly');
    expect(html).not.toContain('line-through');
  });

  it('announces the error message with role="alert", only on negative rows', () => {
    const negative = render([{ ...ROW, status: 'negative', message: 'Agent run failed' }]);
    expect(negative).toContain('role="alert"');
    expect(negative).toContain('Agent run failed');

    const ok = render([{ ...ROW, status: 'complete', message: 'ignored' }]);
    expect(ok).not.toContain('role="alert"');
    expect(ok).not.toContain('ignored');
  });

  it('renders no alert region for a negative row without a message', () => {
    expect(render([{ ...ROW, status: 'negative' }])).not.toContain('role="alert"');
  });

  it('renders ReactNode descriptions', () => {
    const html = render([
      { ...ROW, status: 'not_started', description: createElement('a', { href: '/x' }, 'Open') },
    ]);
    expect(html).toContain('<a href="/x">Open</a>');
  });
});
