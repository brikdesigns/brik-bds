import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceTag } from './ServiceTag';
import { categoryConfig } from './ServiceBadge';
import type { ServiceCategory } from './ServiceBadge';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ServiceTag> = {
  title: 'Components/Indicator/service-tag',
  component: ServiceTag,
  tags: ['surface-web'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    category: {
      control: 'select',
      options: ['brand', 'marketing', 'information', 'product', 'service'],
    },
    variant: {
      control: 'select',
      options: ['text', 'icon-text', 'icon'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceTag>;

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
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Shared data ─────────────────────────────────────────────── */

const categories = Object.keys(categoryConfig) as ServiceCategory[];

// One representative service per category for icon-text and icon stories
const categoryServices: Record<ServiceCategory, { serviceName: string; label: string }> = {
  brand:       { serviceName: 'Brand Identity Bundle',                         label: 'Brand Design' },
  marketing:   { serviceName: 'Custom Standard Web Development and Design',    label: 'Marketing Design' },
  information: { serviceName: 'Information Design',                            label: 'Information Design' },
  product:     { serviceName: 'Product Design Systems',                        label: 'Product Design' },
  service:     { serviceName: 'Digital File Organization',                     label: 'Back Office' },
};

// Full service list for catalog stories
const allServices: Record<ServiceCategory, { serviceName: string; label: string }[]> = {
  brand: [
    { serviceName: 'Brand Business Card',                                    label: 'Business Card' },
    { serviceName: 'Brand Identity Bundle',                                  label: 'Brand Design' },
    { serviceName: 'Brand Email Signature',                                  label: 'Email Signature' },
    { serviceName: 'Brand Guidelines',                                       label: 'Guidelines' },
    { serviceName: 'Brand Listings',                                         label: 'Listings' },
    { serviceName: 'Premium Logo Design',                                    label: 'Logo' },
    { serviceName: 'Brand Stationary',                                       label: 'Stationary' },
  ],
  marketing: [
    { serviceName: 'Comprehensive Marketing Audit & Consultation',           label: 'Consulting' },
    { serviceName: 'Marketing Design',                                       label: 'Design' },
    { serviceName: 'Email Drip Campaign (Up to 6 Emails)',                   label: 'Email' },
    { serviceName: 'Marketing Email Signature',                              label: 'Email Signature' },
    { serviceName: 'Landing Pages',                                          label: 'Landing Pages' },
    { serviceName: 'Social Media Graphic Designs',                           label: 'Social Graphics' },
    { serviceName: 'Swag and Merchandise Design',                            label: 'Swag' },
    { serviceName: 'Custom Standard Web Development and Design',             label: 'Web Design' },
    { serviceName: 'Patient Experience Mapping',                             label: 'Patient Experience' },
    { serviceName: 'Website Experience Mapping',                             label: 'Website Experience' },
  ],
  information: [
    { serviceName: 'Digital Design',                                         label: 'Digital Design' },
    { serviceName: 'Infographics',                                           label: 'Infographics' },
    { serviceName: 'Intake Form',                                            label: 'Intake Form' },
    { serviceName: 'Layout Design',                                          label: 'Layout Design' },
    { serviceName: 'Print Design',                                           label: 'Print Design' },
    { serviceName: 'Sales Materials',                                        label: 'Sales Materials' },
    { serviceName: 'Signage',                                                label: 'Signage' },
    { serviceName: 'Welcome Kit',                                            label: 'Welcome Kit' },
    { serviceName: 'Information Design',                                     label: 'Information Design' },
  ],
  product: [
    { serviceName: 'Product App Design',                                     label: 'App Design' },
    { serviceName: 'Product Content Design',                                 label: 'Content Design' },
    { serviceName: 'Product Design Systems',                                 label: 'Design Systems' },
    { serviceName: 'Product Design',                                         label: 'Design' },
    { serviceName: 'Product Enterprise Design',                              label: 'Enterprise Design' },
  ],
  service: [
    { serviceName: 'Software and Subscription Audit',                        label: 'Audit' },
    { serviceName: 'Software Automation Setup',                              label: 'Automated Workflow' },
    { serviceName: 'Automated Workflow and AI Integration',                  label: 'Automation & AI' },
    { serviceName: 'Standard Operating Procedures (SOP) Creation',          label: 'Business Solutions' },
    { serviceName: 'Back Office Consulting',                                 label: 'Consulting' },
    { serviceName: 'CRM Setup and Data Cleanup',                             label: 'CRM & Data' },
    { serviceName: 'Back Office Customer Support',                           label: 'Customer Support' },
    { serviceName: 'Back Office Design',                                     label: 'Design' },
    { serviceName: 'Digital File Organization',                              label: 'File Organization' },
    { serviceName: 'Customer Journey Mapping',                               label: 'Journey Mapping' },
    { serviceName: 'Back Office Software Audit',                             label: 'Software Audit' },
    { serviceName: 'Back Office SOP Creation',                               label: 'SOP Creation' },
    { serviceName: 'Back Office Training Setup',                             label: 'Training Setup' },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    category: 'marketing',
    variant: 'icon-text',
    size: 'md',
    label: 'Marketing Design',
    serviceName: 'Custom Standard Web Development and Design',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All display variants × all categories × sizes
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Text — all categories</SectionLabel>
        <Row>
          {categories.map((cat) => (
            <ServiceTag key={cat} category={cat} label={categoryConfig[cat].label} />
          ))}
        </Row>
      </div>

      <div>
        <SectionLabel>Text — sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {categories.map((cat) => (
                <ServiceTag key={cat} category={cat} size={size} />
              ))}
            </Row>
          ))}
        </Stack>
      </div>

      <div>
        <SectionLabel>Icon + text — all categories</SectionLabel>
        <Row>
          {categories.map((cat) => (
            <ServiceTag
              key={cat}
              category={cat}
              variant="icon-text"
              label={categoryServices[cat].label}
              serviceName={categoryServices[cat].serviceName}
            />
          ))}
        </Row>
      </div>

      <div>
        <SectionLabel>Icon + text — sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {categories.map((cat) => (
                <ServiceTag
                  key={cat}
                  category={cat}
                  variant="icon-text"
                  size={size}
                  label={categoryServices[cat].label}
                  serviceName={categoryServices[cat].serviceName}
                />
              ))}
            </Row>
          ))}
        </Stack>
      </div>

      <div>
        <SectionLabel>Icon only — all categories</SectionLabel>
        <Row>
          {categories.map((cat) => (
            <ServiceTag
              key={cat}
              category={cat}
              variant="icon"
              serviceName={categoryServices[cat].serviceName}
            />
          ))}
        </Row>
      </div>

      <div>
        <SectionLabel>Icon only — sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size}>
              {categories.map((cat) => (
                <ServiceTag
                  key={cat}
                  category={cat}
                  variant="icon"
                  size={size}
                  serviceName={categoryServices[cat].serviceName}
                />
              ))}
            </Row>
          ))}
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. ALL SERVICES — Complete icon-text catalog by category
   ═══════════════════════════════════════════════════════════════ */

/** @summary All services */
export const AllServices: Story = {
  name: 'All services (icon-text)',
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

/* ═══════════════════════════════════════════════════════════════
   4. ALL SERVICES — Complete icon catalog by category
   ═══════════════════════════════════════════════════════════════ */

/** @summary All services icon */
export const AllServicesIcon: Story = {
  name: 'All services (icon)',
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

/* ═══════════════════════════════════════════════════════════════
   5. PATTERNS — Real-world usage contexts
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Table cell — service line</SectionLabel>
        <div style={{
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          overflow: 'hidden',
          width: '500px',
        }}>
          {[
            { category: 'marketing' as const, name: 'Website Design & Development',  label: 'Marketing Design' },
            { category: 'brand' as const,     name: 'Logo Design & Brand Guidelines', label: 'Brand' },
            { category: 'service' as const,   name: 'CRM Setup & Data Cleanup',       label: 'Back Office' },
            { category: 'information' as const, name: 'Print Collateral',             label: 'Information Design' },
            { category: 'product' as const,   name: 'Design Systems & Libraries',     label: 'Product Design' },
          ].map(({ category, name, label }, i) => (
            <div key={name} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--padding-sm) var(--padding-md)',
              borderTop: i > 0 ? '1px solid var(--border-secondary)' : undefined,
            }}>
              <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-primary)' }}>
                {name}
              </span>
              <ServiceTag category={category} label={label} size="sm" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Table cell — icon + service name</SectionLabel>
        <div style={{
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          overflow: 'hidden',
          width: '500px',
        }}>
          {[
            { category: 'marketing' as const,   serviceName: 'Custom Standard Web Development and Design', label: 'Website Design & Development' },
            { category: 'brand' as const,        serviceName: 'Brand Identity Bundle',                     label: 'Brand Identity Bundle' },
            { category: 'service' as const,      serviceName: 'CRM Setup and Data Cleanup',                label: 'CRM Setup & Data Cleanup' },
            { category: 'information' as const,  serviceName: 'Print Design',                              label: 'Print Collateral' },
            { category: 'product' as const,      serviceName: 'Product Design Systems',                    label: 'Design Systems' },
          ].map(({ category, serviceName, label }, i) => (
            <div key={label} style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--padding-sm) var(--padding-md)',
              borderTop: i > 0 ? '1px solid var(--border-secondary)' : undefined,
            }}>
              <ServiceTag
                category={category}
                variant="icon-text"
                size="sm"
                label={label}
                serviceName={serviceName}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Service list with icon badges</SectionLabel>
        <Stack gap="var(--gap-md)">
          {[
            { category: 'marketing' as const, serviceName: 'Custom Standard Web Development and Design', label: 'Website Design & Development' },
            { category: 'brand' as const, serviceName: 'Brand Identity Bundle', label: 'Logo Design & Brand Guidelines' },
            { category: 'service' as const, serviceName: 'CRM Setup and Data Cleanup', label: 'CRM Setup & Data Cleanup' },
            { category: 'information' as const, serviceName: 'Print Design', label: 'Print Design & Collateral' },
            { category: 'product' as const, serviceName: 'Product Design Systems', label: 'Design Systems & Libraries' },
          ].map(({ category, serviceName, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
              <ServiceTag category={category} variant="icon" size="sm" serviceName={serviceName} />
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
                <ServiceTag category={cat} variant="icon" size="lg" />
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
