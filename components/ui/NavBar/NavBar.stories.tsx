import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavBar } from './NavBar';
import { Button } from '../Button';

const meta: Meta<typeof NavBar> = {
  title: 'Navigation/Primary/nav-bar',
  component: NavBar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleLinks = [
  { label: 'Home', href: '#', active: true },
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
];

const LogoPlaceholder = () => (
  <div style={{
    fontFamily: 'var(--font-family-heading)',
    fontSize: 'var(--label-lg)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
    color: 'var(--text-primary)',
  }}>
    BrandName
  </div>
);

export const Default: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks,
    actions: <Button size="sm">Get Started</Button>,
  },
};

export const LinksOnly: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks,
  },
};

export const WithMultipleActions: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks.slice(0, 3),
    actions: (
      <div style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
        <Button variant="ghost" size="sm">Log In</Button>
        <Button size="sm">Sign Up</Button>
      </div>
    ),
  },
};

export const Minimal: Story = {
  args: {
    logo: <LogoPlaceholder />,
    actions: <Button size="sm">Contact</Button>,
  },
};

export const Sticky: Story = {
  render: () => (
    <div>
      <NavBar
        logo={<LogoPlaceholder />}
        links={sampleLinks}
        actions={<Button size="sm">Get Started</Button>}
        sticky
      />
      <div style={{
        height: 2000,
        padding: 'var(--padding-xl)',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-secondary)',
      }}>
        <p>Scroll down to see the sticky navbar behavior.</p>
      </div>
    </div>
  ),
};
