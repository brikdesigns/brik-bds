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

/* ─── Sample data ─────────────────────────────────────────────── */

const sampleServiceNames: Record<ServiceCategory, string> = {
  brand: 'Brand Identity Bundle',
  marketing: 'Custom Standard Web Development and Design',
  information: 'Information Design',
  product: 'Product Design',
  service: 'CRM Setup and Data Cleanup',
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
   2. VARIANTS — Categories, sizes, modes, icons
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>All categories</SectionLabel>
        <Row>
          {categories.map((cat) => (
            <ServiceBadge key={cat} category={cat} serviceName={sampleServiceNames[cat]} />
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
      <div>
        <SectionLabel>With icons</SectionLabel>
        <Stack gap="var(--gap-md)">
          {[
            { category: 'brand' as const, serviceName: 'Brand Identity Bundle', label: 'Brand Identity Bundle' },
            { category: 'marketing' as const, serviceName: 'Email Drip Campaign (Up to 6 Emails)', label: 'Email Campaign' },
            { category: 'service' as const, serviceName: 'Automated Workflow and AI Integration', label: 'Automation & AI' },
          ].map(({ category, serviceName, label }) => (
            <div key={serviceName} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
              <ServiceBadge category={category} serviceName={serviceName} />
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)' }}>{label}</span>
            </div>
          ))}
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world usage
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
