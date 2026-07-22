import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';
import { type BdsLinkComponent } from '../NavItem';

/* Story-only stand-in for a router `Link` (Next.js / Remix). Tags the rendered
 * anchor so the injected-routing path is visible in the DOM. */
const MockLink: BdsLinkComponent = ({ href, children, ...props }) => (
  <a href={href} data-link-component="mock" {...props}>
    {children}
  </a>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/breadcrumb',
  component: Breadcrumb,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    items: {
      control: 'object',
      description:
        'Crumb trail in order. The last item renders as plain text with `aria-current="page"`; earlier items render as `<a>` when `href` is set.',
    },
    separator: {
      control: 'select',
      options: ['slash', 'chevron'],
      description: 'Visual separator between crumbs. Default `slash` (`/`); `chevron` renders `›`.',
    },
    linkComponent: {
      description:
        'Render each linked crumb with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. See ADR-012.',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
    separator: 'slash',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Q3 semantic starting points
   ═══════════════════════════════════════════════════════════════ */

/** @summary Linked crumbs routed through an injected link component for client-side routing */
export const WithLinkComponent: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Design System' },
    ],
    linkComponent: MockLink,
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Q4 irreducible: driven by an ancestor DOM attribute
      ([data-service-line]), not a component prop. Args can't express it.
   ═══════════════════════════════════════════════════════════════ */

// The breadcrumb stays scope-blind — __current reads --text-secondary
// and __separator reads --text-muted as always. When the breadcrumb
// sits inside a [data-service-line='X'] subtree, Breadcrumb.css rebinds
// those two canonical tokens to --text-service-{name} so the current
// page label + separators pick up the service-line hue. The 'service'
// slug maps to the back-office token set per the #563 rename.
// (The deprecated `[data-audience='X']` attribute still resolves — #788.)
const SERVICE_LINES = [
  { id: 'brand', label: 'Brand (yellow)' },
  { id: 'marketing', label: 'Marketing (green)' },
  { id: 'information', label: 'Information (blue)' },
  { id: 'product', label: 'Product (purple)' },
  { id: 'back-office', label: 'Back Office (orange)' },
  { id: 'service', label: 'Service — @deprecated alias of back-office (orange)' },
] as const;

/** @summary Service-line tinting via [data-service-line] cascade */
export const ServiceLineCascade: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      {SERVICE_LINES.map(({ id, label }) => (
        <div key={id} data-service-line={id}>
          <p
            style={{
              fontFamily: 'var(--font-family-label)',
              fontSize: 'var(--body-xs)', // bds-lint-ignore
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              marginBottom: 'var(--gap-md)',
              color: 'var(--text-muted)',
            }}
          >
            {`[data-service-line='${id}'] — ${label}`}
          </p>
          <Breadcrumb
            items={[
              { label: 'Home', href: '#' },
              { label: 'Services', href: '#' },
              { label: 'Detail page' },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};
