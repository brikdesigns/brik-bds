import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceBadge, categoryConfig } from './ServiceBadge';
import type { ServiceCategory } from './ServiceBadge';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ServiceBadge> = {
  title: 'Components/Indicator/service-badge',
  component: ServiceBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    category: {
      control: 'select',
      options: ['brand', 'marketing', 'information', 'product', 'service'],
    },
    mode: {
      control: 'select',
      options: ['badge', 'label'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceBadge>;

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

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

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Complete service catalog ────────────────────────────────── */

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

const categories = Object.keys(categoryConfig) as ServiceCategory[];

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    category: 'marketing',
    size: 'md',
    serviceName: 'Custom Standard Web Development and Design',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, modes, category colors
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>All categories</SectionLabel>
        <Row>
          {categories.map((cat) => (
            <ServiceBadge key={cat} category={cat} serviceName={allServices[cat][0].serviceName} />
          ))}
        </Row>
      </div>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <ServiceBadge key={size} category="marketing" size={size} serviceName="Custom Standard Web Development and Design" />
          ))}
        </Row>
      </div>
      <div>
        <SectionLabel>Label mode</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {categories.map((cat) => (
                <ServiceBadge key={cat} category={cat} mode="label" size={size} />
              ))}
            </Row>
          ))}
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. ALL SERVICES — Complete icon catalog by category
   ═══════════════════════════════════════════════════════════════ */

export const AllServices: Story = {
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
                <ServiceBadge category={cat} size="lg" serviceName={serviceName} />
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

/* ═══════════════════════════════════════════════════════════════
   4. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Service list</SectionLabel>
        <Stack gap="var(--gap-md)">
          {[
            { category: 'marketing' as const, serviceName: 'Custom Standard Web Development and Design', label: 'Website Design & Development' },
            { category: 'brand' as const, serviceName: 'Brand Identity Bundle', label: 'Logo Design & Brand Guidelines' },
            { category: 'service' as const, serviceName: 'CRM Setup and Data Cleanup', label: 'CRM Setup & Data Cleanup' },
            { category: 'information' as const, serviceName: 'Print Design', label: 'Print Design & Collateral' },
            { category: 'product' as const, serviceName: 'Product Design Systems', label: 'Design Systems & Libraries' },
          ].map(({ category, serviceName, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
              <ServiceBadge category={category} size="sm" serviceName={serviceName} />
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-primary)' }}>{label}</span>
            </div>
          ))}
        </Stack>
      </div>
      <div>
        <SectionLabel>Color palette reference</SectionLabel>
        <Stack gap="var(--gap-md)">
          {categories.map((cat) => {
            const config = categoryConfig[cat];
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-lg)' }}>
                <ServiceBadge category={cat} size="lg" />
                <span style={{
                  fontFamily: 'var(--font-family-label)',
                  fontSize: 'var(--label-sm)', // bds-lint-ignore
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px',
                  minWidth: '100px',
                }}>{config.label}</span>
                <span style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-sm)', // bds-lint-ignore
                  color: 'var(--text-muted)',
                }}>--services--{config.token}</span>
              </div>
            );
          })}
        </Stack>
      </div>
    </Stack>
  ),
};
