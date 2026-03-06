import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceBadge, categoryConfig } from './ServiceBadge';
import type { ServiceCategory, ServiceBadgeSize } from './ServiceBadge';

const meta: Meta<typeof ServiceBadge> = {
  title: 'Components/Indicator/service-badge',
  component: ServiceBadge,
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

export const Default: Story = {
  args: {
    category: 'marketing',
    size: 'md',
    serviceName: 'Custom Standard Web Development and Design',
  },
};

// --- Category variants ---

export const Brand: Story = {
  args: { category: 'brand', serviceName: 'Brand Identity Bundle' },
};

export const Marketing: Story = {
  args: { category: 'marketing', serviceName: 'Custom Standard Web Development and Design' },
};

export const Information: Story = {
  args: { category: 'information', serviceName: 'Information Design' },
};

export const Product: Story = {
  args: { category: 'product', serviceName: 'Product Design' },
};

export const BackOffice: Story = {
  args: { category: 'service', serviceName: 'CRM Setup and Data Cleanup' },
};

// --- All categories ---

const sampleServiceNames: Record<ServiceCategory, string> = {
  brand: 'Brand Identity Bundle',
  marketing: 'Custom Standard Web Development and Design',
  information: 'Information Design',
  product: 'Product Design',
  service: 'CRM Setup and Data Cleanup',
};

export const AllCategories: Story = {
  render: () => {
    const categories = Object.keys(categoryConfig) as ServiceCategory[];
    return (
      <div style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'center' }}>
        {categories.map((cat) => (
          <ServiceBadge key={cat} category={cat} serviceName={sampleServiceNames[cat]} />
        ))}
      </div>
    );
  },
};

// --- Sizes ---

export const AllSizes: Story = {
  render: () => {
    const sizes: ServiceBadgeSize[] = ['sm', 'md', 'lg'];
    return (
      <div style={{ display: 'flex', gap: 'var(--gap-xl)', alignItems: 'center' }}>
        {sizes.map((size) => (
          <ServiceBadge key={size} category="marketing" size={size} serviceName="Custom Standard Web Development and Design" />
        ))}
      </div>
    );
  },
};

// --- Label mode ---

export const Labels: Story = {
  render: () => {
    const categories = Object.keys(categoryConfig) as ServiceCategory[];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        {categories.map((cat) => (
          <ServiceBadge key={cat} category={cat} mode="label" size="sm" />
        ))}
      </div>
    );
  },
};

// --- Color tokens reference ---

export const ColorTokens: Story = {
  render: () => {
    const categories = Object.keys(categoryConfig) as ServiceCategory[];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
        {categories.map((cat) => {
          const config = categoryConfig[cat];
          return (
            <div
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--gap-lg)',
              }}
            >
              {/* Primary */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: `var(--_color---background--service-${cat})`,
                }}
              />
              {/* Dark */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: `var(--_color---background--service-${cat}-secondary)`,
                }}
              />
              {/* Light */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: `var(--services--${config.token}-light)`,
                  border: '1px solid var(--border-muted)',
                }}
              />
              {/* Label */}
              <span
                style={{
                  fontFamily: 'var(--font-family-label)',
                  fontSize: 'var(--label-sm)',
                  color: `var(--_color---text--service-${cat})`,
                  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px',
                  minWidth: '100px',
                }}
              >
                {config.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--body-sm)',
                  color: 'var(--text-muted)',
                }}
              >
                --services--{config.token} / {config.token}-dark / {config.token}-light
              </span>
            </div>
          );
        })}
      </div>
    );
  },
};

// --- Contextual examples ---

export const InlineWithText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
        <ServiceBadge category="marketing" size="sm" serviceName="Custom Standard Web Development and Design" />
        <span style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-md)',
          color: 'var(--text-primary)',
        }}>
          Website Design &amp; Development
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
        <ServiceBadge category="brand" size="sm" serviceName="Brand Identity Bundle" />
        <span style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-md)',
          color: 'var(--text-primary)',
        }}>
          Logo Design &amp; Brand Guidelines
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
        <ServiceBadge category="service" size="sm" serviceName="CRM Setup and Data Cleanup" />
        <span style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-md)',
          color: 'var(--text-primary)',
        }}>
          CRM Setup &amp; Data Cleanup
        </span>
      </div>
    </div>
  ),
};

// --- With icons showcase ---

export const WithIcons: Story = {
  render: () => {
    const examples: { category: ServiceCategory; serviceName: string; label: string }[] = [
      { category: 'brand', serviceName: 'Brand Identity Bundle', label: 'Brand Identity Bundle' },
      { category: 'brand', serviceName: 'Premium Logo Design', label: 'Premium Logo Design' },
      { category: 'marketing', serviceName: 'Custom Standard Web Development and Design', label: 'Web Design' },
      { category: 'marketing', serviceName: 'Email Drip Campaign (Up to 6 Emails)', label: 'Email Campaign' },
      { category: 'information', serviceName: 'Information Design', label: 'Information Design' },
      { category: 'product', serviceName: 'Product Design', label: 'Product Design' },
      { category: 'service', serviceName: 'CRM Setup and Data Cleanup', label: 'CRM Setup' },
      { category: 'service', serviceName: 'Automated Workflow and AI Integration', label: 'Automation & AI' },
      { category: 'service', serviceName: 'Software and Subscription Audit', label: 'Software Audit' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        {examples.map(({ category, serviceName, label }) => (
          <div key={serviceName} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
            <ServiceBadge category={category} serviceName={serviceName} />
            <span style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--body-md)',
              color: 'var(--text-primary)',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  },
};
