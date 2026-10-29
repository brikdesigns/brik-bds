import { describe, expect, it } from 'vitest';
import { breadcrumbTrailFromNav, subNavItemsFromNav, type NavSection } from './navTrail';

const settings: NavSection = {
  label: 'Settings',
  href: '/settings',
  items: [
    { label: 'Services', href: '/settings/services' },
    { label: 'Agreements', href: '/settings/agreements' },
    { label: 'Service Plans', href: '/settings/services/plans' },
  ],
};

const contacts: NavSection = {
  label: 'Contacts',
  href: '/admin/contacts',
  items: [
    { label: 'Companies', href: '/admin/companies', match: '/admin/companies' },
    { label: 'People', href: '/admin/people' },
  ],
};

describe('breadcrumbTrailFromNav', () => {
  it('builds `Section / Item` for a settings page, last crumb without href', () => {
    expect(breadcrumbTrailFromNav('/settings/services', settings)).toEqual([
      { label: 'Settings', href: '/settings' },
      { label: 'Services' },
    ]);
  });

  it('builds `Contacts / Companies` for an admin level-1 page', () => {
    expect(breadcrumbTrailFromNav('/admin/companies', contacts)).toEqual([
      { label: 'Contacts', href: '/admin/contacts' },
      { label: 'Companies' },
    ]);
  });

  it('uses the longest matching prefix, not the first declared', () => {
    expect(breadcrumbTrailFromNav('/settings/services/plans', settings).slice(-1)[0]).toEqual({
      label: 'Service Plans',
    });
    // Deeper than any item: falls back to the longest prefix that does match.
    expect(breadcrumbTrailFromNav('/settings/services/plans/42', settings).slice(-1)[0]).toEqual({
      label: 'Service Plans',
    });
  });

  it('matches on segment boundaries only', () => {
    expect(breadcrumbTrailFromNav('/settings/servicesX', settings)).toEqual([]);
  });

  it('honours an explicit match prefix that differs from href', () => {
    const tree: NavSection = {
      label: 'Billing',
      items: [{ label: 'Invoices', href: '/billing/invoices', match: '/billing' }],
    };
    expect(breadcrumbTrailFromNav('/billing/overdue', tree)).toEqual([
      { label: 'Billing' },
      { label: 'Invoices' },
    ]);
  });

  it('returns [] when nothing matches', () => {
    expect(breadcrumbTrailFromNav('/elsewhere', settings)).toEqual([]);
    expect(breadcrumbTrailFromNav('/settings/unknown', settings)).toEqual([]);
  });

  it('returns only the section crumb on the section root itself', () => {
    expect(breadcrumbTrailFromNav('/settings', settings)).toEqual([{ label: 'Settings' }]);
  });

  it('omits the section href when the section declares none', () => {
    const tree: NavSection = { label: 'Ops', items: [{ label: 'Jobs', href: '/ops/jobs' }] };
    expect(breadcrumbTrailFromNav('/ops/jobs', tree)).toEqual([{ label: 'Ops' }, { label: 'Jobs' }]);
  });

  it('appends trailing crumbs, linking the matched item and un-linking the last', () => {
    expect(
      breadcrumbTrailFromNav('/admin/companies/42', contacts, {
        trailing: [{ label: 'Acme Dental', href: '/admin/companies/42' }],
      }),
    ).toEqual([
      { label: 'Contacts', href: '/admin/contacts' },
      { label: 'Companies', href: '/admin/companies' },
      { label: 'Acme Dental' },
    ]);
  });

  it('keeps every trailing crumb but only strips href from the last', () => {
    const trail = breadcrumbTrailFromNav('/admin/companies/42/edit', contacts, {
      trailing: [
        { label: 'Acme Dental', href: '/admin/companies/42' },
        { label: 'Edit', href: '/admin/companies/42/edit' },
      ],
    });
    expect(trail.map((c) => c.href)).toEqual([
      '/admin/contacts',
      '/admin/companies',
      '/admin/companies/42',
      undefined,
    ]);
  });

  it('ignores an empty trailing array', () => {
    expect(breadcrumbTrailFromNav('/settings/services', settings, { trailing: [] })).toEqual([
      { label: 'Settings', href: '/settings' },
      { label: 'Services' },
    ]);
  });

  it('does not append trailing crumbs when nothing matches', () => {
    expect(
      breadcrumbTrailFromNav('/elsewhere', settings, { trailing: [{ label: 'X' }] }),
    ).toEqual([]);
  });

  it('ignores query string, hash and trailing slash', () => {
    expect(breadcrumbTrailFromNav('/settings/services/?tab=a#top', settings)).toEqual([
      { label: 'Settings', href: '/settings' },
      { label: 'Services' },
    ]);
  });

  it('resolves across several sections by longest prefix', () => {
    const trail = breadcrumbTrailFromNav('/admin/people', [settings, contacts]);
    expect(trail).toEqual([{ label: 'Contacts', href: '/admin/contacts' }, { label: 'People' }]);
  });

  it('never matches "/" as a prefix of everything', () => {
    const tree: NavSection = { label: 'Home', items: [{ label: 'Overview', href: '/' }] };
    expect(breadcrumbTrailFromNav('/', tree)).toEqual([{ label: 'Home' }, { label: 'Overview' }]);
    expect(breadcrumbTrailFromNav('/other', tree)).toEqual([]);
  });

  it('does not mutate the tree or the trailing array', () => {
    const trailing = [{ label: 'Acme', href: '/a' }];
    breadcrumbTrailFromNav('/admin/companies/1', contacts, { trailing });
    expect(trailing).toEqual([{ label: 'Acme', href: '/a' }]);
    expect(contacts.items[0]).toEqual({
      label: 'Companies',
      href: '/admin/companies',
      match: '/admin/companies',
    });
  });
});

describe('subNavItemsFromNav', () => {
  it('derives rail items from the same declaration and marks the same item active', () => {
    expect(subNavItemsFromNav('/settings/services/plans/42', settings)).toEqual([
      { label: 'Services', href: '/settings/services', active: false },
      { label: 'Agreements', href: '/settings/agreements', active: false },
      { label: 'Service Plans', href: '/settings/services/plans', active: true },
    ]);
  });

  it('marks nothing active when no item matches, and drops `match`', () => {
    const items = subNavItemsFromNav('/elsewhere', contacts);
    expect(items.every((i) => i.active === false)).toBe(true);
    expect(items[0]).not.toHaveProperty('match');
  });
});
