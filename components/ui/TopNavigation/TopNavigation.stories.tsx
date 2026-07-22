import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopNavigation } from './TopNavigation';
import { Button } from '../Button';
import { type BdsLinkComponent } from '../NavItem';

/* Story-only stand-in for a router `Link` (Next.js / Remix). Tags the rendered
 * anchor so the injected-routing path is visible in the DOM. */
const MockLink: BdsLinkComponent = ({ href, children, ...props }) => (
  <a href={href} data-link-component="mock" {...props}>
    {children}
  </a>
);

/* ─── Shared Data ─────────────────────────────────────────────── */

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

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TopNavigation> = {
  title: 'Navigation/top-navigation',
  component: TopNavigation,
  tags: ['surface-web'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    logo: {
      control: false,
      description: 'Logo element (image, SVG, or text) rendered at the left edge.',
    },
    links: {
      control: 'object',
      description: 'Navigation links. Each entry sets `active` for the current page.',
    },
    actions: {
      control: false,
      description: 'Right-side actions slot (buttons, dropdowns). ReactNode.',
    },
    sticky: {
      control: 'boolean',
      description: 'Pins the nav bar to the viewport top while scrolling.',
    },
    linkComponent: {
      description:
        'Render each nav link with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. See ADR-012.',
      control: false,
    },
  },
} satisfies Meta<typeof TopNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Toggle `sticky`, edit `links`, or
   swap the `actions` slot in Controls to explore layouts.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks,
    actions: <Button size="sm">Get Started</Button>,
  },
};

/** @summary Nav links routed through an injected link component for client-side routing */
export const WithLinkComponent: Story = {
  args: {
    logo: <LogoPlaceholder />,
    links: sampleLinks,
    actions: <Button size="sm">Get Started</Button>,
    linkComponent: MockLink,
  },
};
