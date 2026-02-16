import type { Meta, StoryObj } from '@storybook/react';
import { type CSSProperties } from 'react';
import {
  faHome,
  faFolder,
  faChartLine,
  faFileAlt,
  faCog,
  faCaretDown,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SidebarNavigation, type NavItem } from './SidebarNavigation';
import { Button } from '../Button';

const meta: Meta<typeof SidebarNavigation> = {
  title: 'Components/sidebar-navigation',
  component: SidebarNavigation,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    activeId: { control: 'text' },
    width: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarNavigation>;

// Sample navigation items
const navItems: NavItem[] = [
  { id: 'home', icon: faHome, label: 'Home', onClick: () => console.log('Home clicked') },
  { id: 'projects', icon: faFolder, label: 'Projects', onClick: () => console.log('Projects clicked') },
  { id: 'analytics', icon: faChartLine, label: 'Analytics', onClick: () => console.log('Analytics clicked') },
  { id: 'reports', icon: faFileAlt, label: 'Reports', onClick: () => console.log('Reports clicked') },
  { id: 'settings', icon: faCog, label: 'Settings', onClick: () => console.log('Settings clicked') },
];

// Brik logo component
const BrikLogo = () => (
  <svg
    viewBox="0 0 124 43"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: 'auto' }}
  >
    <path
      d="M23.9998 18.6094C23.9998 21.4531 21.6873 23.7656 18.8436 23.7656H13.1248V32.0469H18.8436C21.6873 32.0469 23.9998 34.3594 23.9998 37.2031C23.9998 40.0469 21.6873 42.3594 18.8436 42.3594H0.968628V4.01562H18.8436C21.6873 4.01562 23.9998 6.32812 23.9998 9.17188C23.9998 12.0156 21.6873 14.3281 18.8436 14.3281H13.1248V18.6094H23.9998Z"
      fill="currentColor"
    />
    <path
      d="M52.9685 4.01562V18.6094C52.9685 23.7656 48.6873 28.0469 43.531 28.0469H37.8123V42.3594H25.656V4.01562H43.531C48.6873 4.01562 52.9685 8.29688 52.9685 13.4531V4.01562Z"
      fill="currentColor"
    />
    <path
      d="M67.5623 4.01562V42.3594H55.406V4.01562H67.5623Z"
      fill="currentColor"
    />
    <path
      d="M96.1561 4.01562L82.5936 23.7656L96.1561 42.3594H81.5623L74.4373 32.0469L67.3123 42.3594H52.7186L66.281 23.7656L52.7186 4.01562H67.3123L74.4373 14.3281L81.5623 4.01562H96.1561Z"
      fill="currentColor"
    />
    <rect x="100.437" y="18.6094" width="23.5625" height="4.28125" fill="#F6C647" />
  </svg>
);

// Footer dropdown menu item
const footerMenuStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--_space---gap--md)',
  padding: 'var(--_space---tiny)',
  fontSize: 'var(--_typography---label--sm)',
  fontFamily: 'var(--_typography---font-family--label)',
  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
  color: 'var(--_color---text--muted)',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  width: '100%',
  marginBottom: 'var(--_space---xl)',
};

const FooterMenu = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---xl)' }}>
    <button type="button" style={footerMenuStyles}>
      <FontAwesomeIcon icon={faUser} style={{ fontSize: 'var(--_typography---icon--small)' }} />
      <span style={{ flex: 1, textAlign: 'left' }}>Account</span>
      <FontAwesomeIcon icon={faCaretDown} style={{ fontSize: '11.54px' }} />
    </button>
    <Button variant="primary" size="sm" fullWidth>
      Primary Button
    </Button>
  </div>
);

// ─── Default ─────────────────────────────────────────────────────

/**
 * Default sidebar navigation with all sections
 */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SidebarNavigation
  items={[
    { id: 'home', icon: faHome, label: 'Home' },
    { id: 'projects', icon: faFolder, label: 'Projects' },
    { id: 'analytics', icon: faChartLine, label: 'Analytics' },
    { id: 'reports', icon: faFileAlt, label: 'Reports' },
    { id: 'settings', icon: faCog, label: 'Settings' },
  ]}
  activeId="projects"
  logo={<BrikLogo />}
  footer={<FooterMenu />}
/>`,
      },
    },
  },
  render: (args) => (
    <div style={{ height: '800px', display: 'flex' }}>
      <SidebarNavigation
        {...args}
        items={navItems}
        activeId="projects"
        logo={<BrikLogo />}
        footer={<FooterMenu />}
      />
      <div style={{ flex: 1, padding: 'var(--_space---xl)', backgroundColor: 'var(--_color---background--secondary)' }}>
        <h1 style={{ fontSize: 'var(--_typography---heading--large)', fontFamily: 'var(--_typography---font-family--heading)' }}>
          Main Content Area
        </h1>
        <p style={{ fontSize: 'var(--_typography---body--md-base)', marginTop: 'var(--_space---lg)' }}>
          The sidebar navigation component provides consistent navigation across your application.
          Click any navigation item to see the active state.
        </p>
      </div>
    </div>
  ),
};

// ─── Active States ───────────────────────────────────────────────

/**
 * Comparison of different active states
 */
export const ActiveStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `// Active on first item
<SidebarNavigation items={navItems} activeId="home" />

// Active on middle item
<SidebarNavigation items={navItems} activeId="analytics" />

// Active on last item
<SidebarNavigation items={navItems} activeId="settings" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---lg)', height: '600px' }}>
      <div>
        <h3 style={{ marginBottom: 'var(--_space---md)', fontSize: 'var(--_typography---body--lg)' }}>
          Active: Home
        </h3>
        <SidebarNavigation items={navItems} activeId="home" logo={<BrikLogo />} />
      </div>
      <div>
        <h3 style={{ marginBottom: 'var(--_space---md)', fontSize: 'var(--_typography---body--lg)' }}>
          Active: Analytics
        </h3>
        <SidebarNavigation items={navItems} activeId="analytics" logo={<BrikLogo />} />
      </div>
      <div>
        <h3 style={{ marginBottom: 'var(--_space---md)', fontSize: 'var(--_typography---body--lg)' }}>
          Active: Settings
        </h3>
        <SidebarNavigation items={navItems} activeId="settings" logo={<BrikLogo />} />
      </div>
    </div>
  ),
};

// ─── Without Logo ────────────────────────────────────────────────

/**
 * Sidebar without logo
 */
export const WithoutLogo: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SidebarNavigation
  items={navItems}
  activeId="home"
/>`,
      },
    },
  },
  render: () => (
    <div style={{ height: '600px' }}>
      <SidebarNavigation items={navItems} activeId="home" />
    </div>
  ),
};

// ─── Without Footer ──────────────────────────────────────────────

/**
 * Sidebar without footer section
 */
export const WithoutFooter: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SidebarNavigation
  items={navItems}
  activeId="projects"
  logo={<BrikLogo />}
/>`,
      },
    },
  },
  render: () => (
    <div style={{ height: '600px' }}>
      <SidebarNavigation items={navItems} activeId="projects" logo={<BrikLogo />} />
    </div>
  ),
};

// ─── Custom Width ────────────────────────────────────────────────

/**
 * Sidebar with custom width
 */
export const CustomWidth: Story = {
  parameters: {
    docs: {
      source: {
        code: `// Narrow sidebar (200px)
<SidebarNavigation items={navItems} activeId="home" width={200} />

// Wide sidebar (300px)
<SidebarNavigation items={navItems} activeId="home" width={300} />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--_space---lg)', height: '600px' }}>
      <div>
        <h3 style={{ marginBottom: 'var(--_space---md)', fontSize: 'var(--_typography---body--lg)' }}>
          Narrow (200px)
        </h3>
        <SidebarNavigation items={navItems} activeId="home" logo={<BrikLogo />} width={200} />
      </div>
      <div>
        <h3 style={{ marginBottom: 'var(--_space---md)', fontSize: 'var(--_typography---body--lg)' }}>
          Default (246px)
        </h3>
        <SidebarNavigation items={navItems} activeId="home" logo={<BrikLogo />} width={246} />
      </div>
      <div>
        <h3 style={{ marginBottom: 'var(--_space---md)', fontSize: 'var(--_typography---body--lg)' }}>
          Wide (300px)
        </h3>
        <SidebarNavigation items={navItems} activeId="home" logo={<BrikLogo />} width={300} />
      </div>
    </div>
  ),
};

// ─── Minimal Navigation ──────────────────────────────────────────

/**
 * Minimal navigation with just a few items
 */
export const MinimalNavigation: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SidebarNavigation
  items={[
    { id: 'home', icon: faHome, label: 'Home' },
    { id: 'settings', icon: faCog, label: 'Settings' },
  ]}
  activeId="home"
/>`,
      },
    },
  },
  render: () => (
    <div style={{ height: '400px' }}>
      <SidebarNavigation
        items={[
          { id: 'home', icon: faHome, label: 'Home' },
          { id: 'settings', icon: faCog, label: 'Settings' },
        ]}
        activeId="home"
        logo={<BrikLogo />}
      />
    </div>
  ),
};

// ─── Full Application Layout ─────────────────────────────────────

/**
 * Complete application layout with sidebar
 */
export const FullApplicationLayout: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div style={{ display: 'flex', height: '100vh' }}>
  <SidebarNavigation
    items={navItems}
    activeId="home"
    logo={<BrikLogo />}
    footer={<FooterMenu />}
  />
  <main style={{ flex: 1, padding: '2rem' }}>
    {/* Your application content */}
  </main>
</div>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SidebarNavigation
        items={navItems}
        activeId="home"
        logo={<BrikLogo />}
        footer={<FooterMenu />}
      />
      <main style={{
        flex: 1,
        padding: 'var(--_space---xxl)',
        backgroundColor: 'var(--_color---page--primary)',
        overflowY: 'auto',
      }}>
        <h1 style={{
          fontSize: 'var(--_typography---heading--xx-large)',
          fontFamily: 'var(--_typography---font-family--heading)',
          marginBottom: 'var(--_space---lg)',
        }}>
          Dashboard
        </h1>
        <p style={{
          fontSize: 'var(--_typography---body--md-base)',
          color: 'var(--_color---text--secondary)',
          marginBottom: 'var(--_space---xl)',
        }}>
          Welcome to your application dashboard. Use the sidebar navigation to explore different sections.
        </p>

        {/* Sample content cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 'var(--_space---lg)',
        }}>
          {['Projects', 'Analytics', 'Reports', 'Settings'].map((title) => (
            <div
              key={title}
              style={{
                padding: 'var(--_space---xl)',
                backgroundColor: 'var(--_color---surface--primary)',
                borderRadius: 'var(--_border-radius---lg)',
                boxShadow: 'var(--_box-shadow---sm)',
              }}
            >
              <h3 style={{
                fontSize: 'var(--_typography---heading--small)',
                fontFamily: 'var(--_typography---font-family--heading)',
                marginBottom: 'var(--_space---md)',
              }}>
                {title}
              </h3>
              <p style={{
                fontSize: 'var(--_typography---body--sm)',
                color: 'var(--_color---text--secondary)',
              }}>
                Sample content for {title.toLowerCase()} section.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  ),
};
