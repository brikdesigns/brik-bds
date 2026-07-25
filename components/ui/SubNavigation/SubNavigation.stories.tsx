import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { SubNavigation, type SubNavigationProps, type SubNavItem } from './SubNavigation';

/* ─── Sample data ─────────────────────────────────────────────── */

const itemsWithIcons: SubNavItem[] = [
  { label: 'Services',          href: '#settings/services',          icon: <Icon icon="ph:wrench" />,            active: true },
  { label: 'Service Lines',     href: '#settings/service-lines',     icon: <Icon icon="ph:tree-structure" /> },
  { label: 'Offerings',         href: '#settings/offerings',         icon: <Icon icon="ph:package" /> },
  { label: 'Service Plans',     href: '#settings/plans',             icon: <Icon icon="ph:list-checks" /> },
  { label: 'Customer Stories',  href: '#settings/customer-stories',  icon: <Icon icon="ph:quotes" /> },
  { label: 'Blogs',             href: '#settings/blog-posts',        icon: <Icon icon="ph:article" /> },
  { label: 'Industries',        href: '#settings/industries',        icon: <Icon icon="ph:buildings" /> },
];

/* ─── Story wrapper with synthetic toggle controls ────────────── */

interface SubNavStoryProps
  extends Omit<SubNavigationProps, 'header' | 'footer'> {
  /** Story-only — toggles the `header` slot. */
  showHeader?: boolean;
  /** Story-only — toggles the `footer` slot. */
  showFooter?: boolean;
}

function SubNavigationStory({
  showHeader = false,
  showFooter = false,
  ...props
}: SubNavStoryProps) {
  return (
    <SubNavigation
      {...props}
      header={
        showHeader ? (
          <div style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-sm)',
            color: 'var(--text-primary)',
          }}>
            Settings
          </div>
        ) : undefined
      }
      footer={
        showFooter ? (
          <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-muted)' }}>
            Last sync: 2 min ago
          </div>
        ) : undefined
      }
    />
  );
}

/* ─── Meta ────────────────────────────────────────────────────── */

const meta = {
  title: 'Navigation/sub-navigation',
  component: SubNavigationStory,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    items: {
      description: 'Nav entries — each renders as a `NavItem` internally.',
      control: false,
    },
    width: {
      description: 'Custom width (e.g. "240px"). Defaults to 194px.',
      control: 'text',
    },
    ariaLabel: {
      description: 'Accessible label for the nav landmark.',
      control: 'text',
    },
    bordered: {
      description: 'Draw the right-side panel/content divider. Default `true`; set `false` when the shell supplies its own separation.',
      control: 'boolean',
    },
    linkComponent: {
      description: 'Render each nav item with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. See ADR-012.',
      control: false,
    },
    showHeader: {
      description: 'Story-only — toggles the `header` slot.',
      control: 'boolean',
    },
    showFooter: {
      description: 'Story-only — toggles the `footer` slot.',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof SubNavigationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   Default — single story, rich controls
   ═══════════════════════════════════════════════════════════════ */

/** @summary Sub-nav with icons; toggle header / footer in Controls */
export const Default: Story = {
  args: {
    items: itemsWithIcons,
    showHeader: false,
    showFooter: false,
  },
};
