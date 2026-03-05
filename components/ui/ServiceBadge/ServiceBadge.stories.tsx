import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceBadge, categoryConfig } from './ServiceBadge';
import type { ServiceCategory, ServiceBadgeSize } from './ServiceBadge';

const meta: Meta<typeof ServiceBadge> = {
  title: 'Components/service-badge',
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
  },
};

// --- Category variants ---

export const Brand: Story = {
  args: { category: 'brand' },
};

export const Marketing: Story = {
  args: { category: 'marketing' },
};

export const Information: Story = {
  args: { category: 'information' },
};

export const Product: Story = {
  args: { category: 'product' },
};

export const Service: Story = {
  args: { category: 'service' },
};

// --- All categories ---

export const AllCategories: Story = {
  render: () => {
    const categories = Object.keys(categoryConfig) as ServiceCategory[];
    return (
      <div style={{ display: 'flex', gap: 'var(--_space---gap--lg)', alignItems: 'center' }}>
        {categories.map((cat) => (
          <ServiceBadge key={cat} category={cat} />
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
      <div style={{ display: 'flex', gap: 'var(--_space---gap--xl)', alignItems: 'center' }}>
        {sizes.map((size) => (
          <ServiceBadge key={size} category="marketing" size={size} />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--xl)' }}>
        {categories.map((cat) => {
          const config = categoryConfig[cat];
          return (
            <div
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--_space---gap--lg)',
              }}
            >
              {/* Primary */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--_border-radius---md)',
                  backgroundColor: `var(--_color---background--service-${cat})`,
                }}
              />
              {/* Dark */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--_border-radius---md)',
                  backgroundColor: `var(--_color---background--service-${cat}-secondary)`,
                }}
              />
              {/* Light */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--_border-radius---md)',
                  backgroundColor: `var(--services--${config.token}-light)`,
                  border: '1px solid var(--_color---border--muted)',
                }}
              />
              {/* Label */}
              <span
                style={{
                  fontFamily: 'var(--_typography---font-family--label)',
                  fontSize: 'var(--_typography---label--sm)',
                  color: `var(--_color---text--service-${cat})`,
                  fontWeight: 'var(--font-weight--semi-bold)' as unknown as number,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px',
                  minWidth: '100px',
                }}
              >
                {config.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--_typography---font-family--body)',
                  fontSize: 'var(--_typography---body--sm)',
                  color: 'var(--_color---text--muted)',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--_space---gap--md)' }}>
        <ServiceBadge category="marketing" size="sm" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
          color: 'var(--_color---text--primary)',
        }}>
          Website Design &amp; Development
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--_space---gap--md)' }}>
        <ServiceBadge category="brand" size="sm" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
          color: 'var(--_color---text--primary)',
        }}>
          Logo Design &amp; Brand Guidelines
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--_space---gap--md)' }}>
        <ServiceBadge category="service" size="sm" />
        <span style={{
          fontFamily: 'var(--_typography---font-family--body)',
          fontSize: 'var(--_typography---body--md-base)',
          color: 'var(--_color---text--primary)',
        }}>
          CRM Setup &amp; Data Cleanup
        </span>
      </div>
    </div>
  ),
};
