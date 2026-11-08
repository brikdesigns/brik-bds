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
      { ...ROW, id: '4', status: 'error' },
    ]);
    for (const label of ['Complete', 'In Progress', 'Not Started', 'Error']) {
      expect(html).toContain(`>${label}<`);
    }
    for (const tone of ['positive', 'warning', 'neutral', 'negative']) {
      expect(html).toContain(`bds-badge--tone-${tone}`);
    }
  });

  it('renders rows as non-interactive (no button, no strikethrough class)', () => {
    const html = render([{ ...ROW, status: 'complete' }]);
    expect(html).not.toContain('<button');
    expect(html).toContain('bds-interactive-list-item--readonly');
    expect(html).not.toContain('line-through');
  });

  it('announces the error message with role="alert", only on error rows', () => {
    const error = render([{ ...ROW, status: 'error', errorMessage: 'Agent run failed' }]);
    expect(error).toContain('role="alert"');
    expect(error).toContain('Agent run failed');

    const ok = render([{ ...ROW, status: 'complete', errorMessage: 'ignored' }]);
    expect(ok).not.toContain('role="alert"');
    expect(ok).not.toContain('ignored');
  });

  it('renders no alert region for an error row without a message', () => {
    expect(render([{ ...ROW, status: 'error' }])).not.toContain('role="alert"');
  });

  it('renders ReactNode descriptions', () => {
    const html = render([
      { ...ROW, status: 'not_started', description: createElement('a', { href: '/x' }, 'Open') },
    ]);
    expect(html).toContain('<a href="/x">Open</a>');
  });
});
