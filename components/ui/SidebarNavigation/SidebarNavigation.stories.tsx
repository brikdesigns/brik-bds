import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { SidebarNavigation, type SidebarNavigationProps, type SidebarNavItem } from './SidebarNavigation';
import { type BdsLinkComponent } from '../NavItem';
import { Button } from '../Button';
import * as Icons from '../../icons';

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

const defaultNavItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '#dashboard', active: true, icon: <Icon icon={Icons.House} /> },
  { label: 'Projects',  href: '#projects',  icon: <Icon icon={Icons.Folder} /> },
  { label: 'Analytics', href: '#analytics', icon: <Icon icon={Icons.ChartBar} /> },
  { label: 'Settings',  href: '#settings',  icon: <Icon icon={Icons.Gear} /> },
];

const profileBlock = (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--padding-sm)' }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      backgroundColor: 'var(--background-brand-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-inverse)',
      fontWeight: 'var(--font-weight-semibold)' as unknown as number,
    }}>
      JD
    </div>
    <div>
      <div style={{ fontSize: 'var(--body-sm)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, color: 'var(--text-primary)' }}>
        John Doe
      </div>
      <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
        john@example.com
      </div>
    </div>
  </div>
);

/**
 * Stand-in for a router `Link` (Next.js `Link`, Remix `Link`). Renders an
 * `<a>` tagged so the injected-component path is observable. See ADR-012.
 */
const MockLink: BdsLinkComponent = ({ href, children, ...props }) => (
  <a href={href} data-link-component="mock" {...props}>
    {children}
  </a>
);

/* ─── Story wrapper with synthetic toggle controls ────────────── */

interface SidebarStoryProps
  extends Omit<SidebarNavigationProps, 'profile' | 'footerActions'> {
  /** Story-only — toggles the `profile` slot. */
  showProfile?: boolean;
  /** Story-only — toggles the `footerActions` slot. */
  showFooterActions?: boolean;
}

function SidebarNavigationStory({
  showProfile = true,
  showFooterActions = false,
  ...props
}: SidebarStoryProps) {
  return (
    <SidebarNavigation
      {...props}
      profile={showProfile ? profileBlock : undefined}
      footerActions={
        showFooterActions ? (
          <Button variant="primary" size="sm" fullWidth>
            New Project
          </Button>
        ) : undefined
      }
    />
  );
}

/* ─── Meta ────────────────────────────────────────────────────── */

const meta = {
  title: 'Sections/sidebar-navigation',
  component: SidebarNavigationStory,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    logo: {
      description: 'Top-section content (brand mark / logo). ReactNode.',
      control: false,
    },
    navItems: {
      description: 'Nav entries — each renders as a `NavItem` internally.',
      control: false,
    },
    collapsed: {
      description: 'Icon-only mode. Default width drops to 80px; labels become `aria-label`. Pair with `SubNavigation` for a two-column shell.',
      control: 'boolean',
    },
    position: {
      description: '`fixed` (default, legacy single-column) or `sticky` (two-column shell — sits in flex flow).',
      control: { type: 'inline-radio' },
      options: ['fixed', 'sticky'],
    },
    width: {
      description: 'Custom width (e.g. "240px"). Defaults to 260px expanded / 80px collapsed.',
      control: 'text',
    },
    linkComponent: {
      description: 'Render each nav item with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. See ADR-012.',
      control: false,
    },
    showProfile: {
      description: 'Story-only — toggles the `profile` slot.',
      control: 'boolean',
    },
    showFooterActions: {
      description: 'Story-only — toggles the `footerActions` slot.',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof SidebarNavigationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   Default — single story, rich controls
   ═══════════════════════════════════════════════════════════════ */

/** @summary Sidebar with icons; toggle collapsed, profile, footer in Controls */
export const Default: Story = {
  args: {
    logo: <BrikLogomark />,
    navItems: defaultNavItems,
    collapsed: false,
    showProfile: true,
    showFooterActions: false,
  },
};

/** @summary Nav items routed through an injected link component for client-side routing */
export const WithLinkComponent: Story = {
  args: {
    logo: <BrikLogomark />,
    navItems: defaultNavItems,
    linkComponent: MockLink,
    showProfile: true,
  },
};
