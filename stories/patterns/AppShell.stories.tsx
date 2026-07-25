import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { SubNavigation, type SubNavItem } from '../../components/ui/SubNavigation/SubNavigation';
import { SidebarNavigation, type SidebarNavItem } from '../../components/ui/SidebarNavigation';
import * as Icons from '../../components/icons';

/* ─── Shared Assets ───────────────────────────────────────────── */

const BrikLogomark = () => (
  <div style={{
    width: 40,
    height: 40,
    borderRadius: 'var(--border-radius-md)',
    background: 'var(--background-brand-primary)',
    color: 'var(--text-inverse)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-family-heading)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
  }}>
    B
  </div>
);

const collapsedPrimaryItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '#dashboard', icon: <Icon icon={Icons.House} /> },
  { label: 'Projects',  href: '#projects',  icon: <Icon icon={Icons.Folder} /> },
  { label: 'Analytics', href: '#analytics', icon: <Icon icon={Icons.ChartBar} /> },
  { label: 'Settings',  href: '#settings',  icon: <Icon icon={Icons.Gear} />, active: true },
];

const subNavItems: SubNavItem[] = [
  { label: 'Services',          href: '#settings/services',          icon: <Icon icon="ph:wrench" />,            active: true },
  { label: 'Service Lines',     href: '#settings/service-lines',     icon: <Icon icon="ph:tree-structure" /> },
  { label: 'Offerings',         href: '#settings/offerings',         icon: <Icon icon="ph:package" /> },
  { label: 'Service Plans',     href: '#settings/plans',             icon: <Icon icon="ph:list-checks" /> },
  { label: 'Customer Stories',  href: '#settings/customer-stories',  icon: <Icon icon="ph:quotes" /> },
  { label: 'Blogs',             href: '#settings/blog-posts',        icon: <Icon icon="ph:article" /> },
  { label: 'Industries',        href: '#settings/industries',        icon: <Icon icon="ph:buildings" /> },
];

/* ─── Meta ────────────────────────────────────────────────────── */

/**
 * App shell — the canonical two-column product layout: a collapsed primary
 * `SidebarNavigation` (80px) + a section `SubNavigation` (194px) + the main
 * region. Lives here rather than on either nav component's page because it is
 * a multi-component arrangement, not part of a single component's API
 * (storybook-story-shape consolidation rule 4).
 * @summary Two-column product app shell — collapsed primary + sub-nav + main
 */
const meta: Meta = {
  title: 'Layouts/app-shell',
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

/* ─── Two-column shell ────────────────────────────────────────── */

/** @summary Collapsed primary nav + sub-nav + main content */
export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNavigation
        logo={<BrikLogomark />}
        navItems={collapsedPrimaryItems}
        collapsed
        position="sticky"
      />
      <SubNavigation items={subNavItems} />
      <main style={{
        flex: 1,
        padding: 'var(--padding-xl)',
        backgroundColor: 'var(--page-primary)',
        overflowY: 'auto',
      }}>
        <h1 style={{
          fontSize: 'var(--heading-xxl)',
          fontFamily: 'var(--font-family-heading)',
          marginBottom: 'var(--padding-lg)',
        }}>
          Services
        </h1>
        <p style={{
          fontSize: 'var(--body-md)',
          color: 'var(--text-secondary)',
        }}>
          Collapsed primary nav (80px) on the left, sub-nav (194px) in the
          middle, main content on the right. The active primary item
          ("Settings") determines which sub-nav is shown.
        </p>
      </main>
    </div>
  ),
};
