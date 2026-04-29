import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavBar } from './NavBar';
import { Button } from '../Button';

/**
 * NavBar — site/app primary navigation. Composes a logo, link cluster, and an
 * action slot (typically primary CTAs). Optional `sticky` keeps the bar fixed
 * at the top of the viewport while scrolling.
 * @summary Site/app primary navigation bar
 */
const meta: Meta<typeof NavBar> = {
  title: 'Components/Navigation/nav-bar',
  component: NavBar,
  parameters: { layout: 'fullscreen' },
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

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks,
    actions: <Button size="sm">Get Started</Button>,
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Full nav bar — logo, links, and a single CTA action.
 *  @summary Default full nav bar */
export const Default: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks,
    actions: <Button size="sm">Get Started</Button>,
  },
};

/** Links-only — no action slot. Use for content sites without a primary CTA.
 *  @summary Nav bar without action slot */
export const LinksOnly: Story = {
  args: { logo: <LogoPlaceholder />, links: sampleLinks },
};

/** Multiple actions — auth pattern with Log In + Sign Up.
 *  @summary Nav bar with multiple actions */
export const MultipleActions: Story = {
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

/** Minimal — logo + single action only. Use for landing pages.
 *  @summary Minimal nav bar */
export const Minimal: Story = {
  args: { logo: <LogoPlaceholder />, actions: <Button size="sm">Contact</Button> },
};

/* ─── Behavior ───────────────────────────────────────────────── */

/** Sticky — `sticky` prop fixes the nav bar to the top of the viewport while
 *  the page scrolls.
 *  @summary Sticky nav bar with scrollable content */
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
