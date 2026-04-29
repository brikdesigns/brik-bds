import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceTag } from './ServiceTag';
import { categoryConfig } from './ServiceBadge';
import type { ServiceCategory } from './ServiceBadge';

/**
 * ServiceTag — Brik service-category indicator. Encodes the 5-category service
 * taxonomy (brand / marketing / information / product / service) with consistent
 * icon + color treatment across `text`, `icon-text`, and `icon` variants.
 * @summary Brik service-category indicator
 */
const meta: Meta<typeof ServiceTag> = {
  title: 'Components/Indicator/service-tag',
  component: ServiceTag,
  parameters: { layout: 'centered' },
  argTypes: {
    category: { control: 'select', options: ['brand', 'marketing', 'information', 'product', 'service'] },
    variant: { control: 'select', options: ['text', 'icon-text', 'icon'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceTag>;

const categories = Object.keys(categoryConfig) as ServiceCategory[];

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const allServices: Record<ServiceCategory, { serviceName: string; label: string }[]> = {
  brand: [
    { serviceName: 'Brand Business Card', label: 'Business Card' },
    { serviceName: 'Brand Identity Bundle', label: 'Brand Design' },
    { serviceName: 'Brand Email Signature', label: 'Email Signature' },
    { serviceName: 'Brand Guidelines', label: 'Guidelines' },
    { serviceName: 'Brand Listings', label: 'Listings' },
    { serviceName: 'Premium Logo Design', label: 'Logo' },
    { serviceName: 'Brand Stationary', label: 'Stationary' },
  ],
  marketing: [
    { serviceName: 'Comprehensive Marketing Audit & Consultation', label: 'Consulting' },
    { serviceName: 'Marketing Design', label: 'Design' },
    { serviceName: 'Email Drip Campaign (Up to 6 Emails)', label: 'Email' },
    { serviceName: 'Marketing Email Signature', label: 'Email Signature' },
    { serviceName: 'Landing Pages', label: 'Landing Pages' },
    { serviceName: 'Social Media Graphic Designs', label: 'Social Graphics' },
    { serviceName: 'Swag and Merchandise Design', label: 'Swag' },
    { serviceName: 'Custom Standard Web Development and Design', label: 'Web Design' },
    { serviceName: 'Patient Experience Mapping', label: 'Patient Experience' },
    { serviceName: 'Website Experience Mapping', label: 'Website Experience' },
  ],
  information: [
    { serviceName: 'Digital Design', label: 'Digital Design' },
    { serviceName: 'Infographics', label: 'Infographics' },
    { serviceName: 'Intake Form', label: 'Intake Form' },
    { serviceName: 'Layout Design', label: 'Layout Design' },
    { serviceName: 'Print Design', label: 'Print Design' },
    { serviceName: 'Sales Materials', label: 'Sales Materials' },
    { serviceName: 'Signage', label: 'Signage' },
    { serviceName: 'Welcome Kit', label: 'Welcome Kit' },
    { serviceName: 'Information Design', label: 'Information Design' },
  ],
  product: [
    { serviceName: 'Product App Design', label: 'App Design' },
    { serviceName: 'Product Content Design', label: 'Content Design' },
    { serviceName: 'Product Design Systems', label: 'Design Systems' },
    { serviceName: 'Product Design', label: 'Design' },
    { serviceName: 'Product Enterprise Design', label: 'Enterprise Design' },
  ],
  service: [
    { serviceName: 'Software and Subscription Audit', label: 'Audit' },
    { serviceName: 'Software Automation Setup', label: 'Automated Workflow' },
    { serviceName: 'Automated Workflow and AI Integration', label: 'Automation & AI' },
    { serviceName: 'Standard Operating Procedures (SOP) Creation', label: 'Business Solutions' },
    { serviceName: 'Back Office Consulting', label: 'Consulting' },
    { serviceName: 'CRM Setup and Data Cleanup', label: 'CRM & Data' },
    { serviceName: 'Back Office Customer Support', label: 'Customer Support' },
    { serviceName: 'Back Office Design', label: 'Design' },
    { serviceName: 'Digital File Organization', label: 'File Organization' },
    { serviceName: 'Customer Journey Mapping', label: 'Journey Mapping' },
    { serviceName: 'Back Office Software Audit', label: 'Software Audit' },
    { serviceName: 'Back Office SOP Creation', label: 'SOP Creation' },
    { serviceName: 'Back Office Training Setup', label: 'Training Setup' },
  ],
};

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    category: 'marketing',
    variant: 'icon-text',
    size: 'md',
    label: 'Marketing Design',
    serviceName: 'Custom Standard Web Development and Design',
  },
};

/* ─── Category axis ──────────────────────────────────────────── */

/** All five service categories side-by-side. ADR-006 axis-gallery exception.
 *  @summary All categories rendered together */
export const Categories: Story = {
  render: () => (
    <Row>
      {categories.map((cat) => (
        <ServiceTag key={cat} category={cat} label={categoryConfig[cat].label} />
      ))}
    </Row>
  ),
};

/* ─── Variant axis ───────────────────────────────────────────── */

/** Three display variants for one category — text, icon-text, icon-only.
 *  @summary All display variants for one category */
export const Variants: Story = {
  render: () => (
    <Row>
      <ServiceTag category="marketing" variant="text" label="Marketing Design" />
      <ServiceTag category="marketing" variant="icon-text" label="Marketing Design" serviceName="Custom Standard Web Development and Design" />
      <ServiceTag category="marketing" variant="icon" serviceName="Custom Standard Web Development and Design" />
    </Row>
  ),
};

/* ─── Size axis ──────────────────────────────────────────────── */

/** All three sizes side-by-side.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  render: () => (
    <Row>
      <ServiceTag category="brand" variant="icon-text" size="sm" label="Brand Design" serviceName="Brand Identity Bundle" />
      <ServiceTag category="brand" variant="icon-text" size="md" label="Brand Design" serviceName="Brand Identity Bundle" />
      <ServiceTag category="brand" variant="icon-text" size="lg" label="Brand Design" serviceName="Brand Identity Bundle" />
    </Row>
  ),
};

/* ─── Service catalog (designer reference) ───────────────────── */

/** Full Brik service catalog rendered as `icon-text`. Acts as a designer
 *  reference — every service the agency offers, grouped by category. Render
 *  is required for the catalog grid layout.
 *  @summary Full service catalog reference */
export const AllServices: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Stack>
      {categories.map((cat) => (
        <div key={cat}>
          <SectionLabel>{`${categoryConfig[cat].label} (${allServices[cat].length})`}</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 'var(--gap-md)',
          }}>
            {allServices[cat].map(({ serviceName, label }) => (
              <ServiceTag
                key={serviceName}
                category={cat}
                variant="icon-text"
                size="md"
                label={label}
                serviceName={serviceName}
              />
            ))}
          </div>
        </div>
      ))}
    </Stack>
  ),
};

/** Same catalog as above, but rendered as icon-only with adjacent labels —
 *  use this view to confirm icon glyph clarity at small sizes.
 *  @summary Service catalog as icon-only */
export const AllServicesIcon: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Stack>
      {categories.map((cat) => (
        <div key={cat}>
          <SectionLabel>{`${categoryConfig[cat].label} (${allServices[cat].length})`}</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 'var(--gap-lg)',
          }}>
            {allServices[cat].map(({ serviceName, label }) => (
              <div key={serviceName} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
                <ServiceTag category={cat} variant="icon" size="lg" serviceName={serviceName} />
                <span style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-sm)', // bds-lint-ignore
                  color: 'var(--text-primary)',
                }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Stack>
  ),
};
