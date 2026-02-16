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
    width="154"
    height="42"
    viewBox="0 0 154 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: 'auto' }}
  >
    <path d="M133.253 0.736023C136.986 0.736023 140.384 1.61335 143.445 3.36802C146.544 5.08535 148.97 7.49336 150.725 10.592C152.517 13.6907 153.413 17.1814 153.413 21.064C153.413 24.9467 152.517 28.4374 150.725 31.536C148.933 34.6347 146.488 37.0614 143.389 38.816C140.328 40.5334 136.949 41.392 133.253 41.392C129.557 41.392 126.16 40.5334 123.061 38.816C119.962 37.0614 117.517 34.6347 115.725 31.536C113.933 28.4374 113.037 24.9467 113.037 21.064C113.037 17.1814 113.933 13.6907 115.725 10.592C117.517 7.49336 119.962 5.08535 123.061 3.36802C126.16 1.61335 129.557 0.736023 133.253 0.736023ZM133.253 10.928C130.453 10.928 128.25 11.8427 126.645 13.672C125.04 15.464 124.237 17.928 124.237 21.064C124.237 24.1254 125.04 26.5707 126.645 28.4C128.25 30.2294 130.453 31.144 133.253 31.144C136.016 31.144 138.2 30.2294 139.805 28.4C141.41 26.5707 142.213 24.1254 142.213 21.064C142.213 17.928 141.41 15.464 139.805 13.672C138.237 11.8427 136.053 10.928 133.253 10.928Z" fill="currentColor"/>
    <path d="M90.5341 1.01599C95.6114 1.01599 99.7741 2.24799 103.022 4.71199C106.27 7.17599 108.23 10.4987 108.902 14.68H97.3101C96.7127 13.5973 95.8354 12.7387 94.6781 12.104C93.5207 11.4693 92.1581 11.152 90.5901 11.152C87.9021 11.152 85.7554 12.0667 84.1501 13.896C82.5821 15.688 81.7981 18.096 81.7981 21.12C81.7981 24.5547 82.6381 27.168 84.3181 28.96C86.0354 30.7147 88.5367 31.592 91.8221 31.592C93.6887 31.592 95.3314 31.144 96.7501 30.248C98.1687 29.352 99.2887 28.0267 100.11 26.272H89.1341V18.432H109.238V29.352C107.819 32.6373 105.542 35.456 102.406 37.808C99.3074 40.1227 95.3874 41.28 90.6461 41.28C86.6141 41.28 83.0861 40.44 80.0621 38.76C77.0381 37.0427 74.7047 34.6533 73.0621 31.592C71.4567 28.5307 70.6541 25.04 70.6541 21.12C70.6541 17.2 71.4567 13.728 73.0621 10.704C74.7047 7.64266 77.0194 5.27199 80.0061 3.59199C82.9927 1.87466 86.5021 1.01599 90.5341 1.01599Z" fill="currentColor"/>
    <path d="M46.6826 0.736023C50.4159 0.736023 53.8132 1.61335 56.8746 3.36802C59.9732 5.08535 62.3999 7.49336 64.1546 10.592C65.9466 13.6907 66.8426 17.1814 66.8426 21.064C66.8426 24.9467 65.9466 28.4374 64.1546 31.536C62.3626 34.6347 59.9172 37.0614 56.8186 38.816C53.7572 40.5334 50.3786 41.392 46.6826 41.392C42.9866 41.392 39.5892 40.5334 36.4906 38.816C33.3919 37.0614 30.9466 34.6347 29.1546 31.536C27.3626 28.4374 26.4666 24.9467 26.4666 21.064C26.4666 17.1814 27.3626 13.6907 29.1546 10.592C30.9466 7.49336 33.3919 5.08535 36.4906 3.36802C39.5892 1.61335 42.9866 0.736023 46.6826 0.736023ZM46.6826 10.928C43.8826 10.928 41.6799 11.8427 40.0746 13.672C38.4692 15.464 37.6666 17.928 37.6666 21.064C37.6666 24.1254 38.4692 26.5707 40.0746 28.4C41.6799 30.2294 43.8826 31.144 46.6826 31.144C49.4452 31.144 51.6292 30.2294 53.2346 28.4C54.8399 26.5707 55.6426 24.1254 55.6426 21.064C55.6426 17.928 54.8399 15.464 53.2346 13.672C51.6666 11.8427 49.4826 10.928 46.6826 10.928Z" fill="currentColor"/>
    <path d="M11.0559 32.656H23.4319V41H0.0239258V1.35199H11.0559V32.656Z" fill="currentColor"/>
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
