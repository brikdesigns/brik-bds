import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Select } from './Select';

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

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Sample Data ─────────────────────────────────────────────── */

const basicOptions = [
  { label: 'First choice', value: 'first' },
  { label: 'Second choice', value: 'second' },
  { label: 'Third choice', value: 'third' },
];

const groupedOptions = [
  {
    label: 'United States',
    options: [
      { label: 'New York', value: 'ny' },
      { label: 'San Francisco', value: 'sf' },
      { label: 'Chicago', value: 'chi' },
    ],
  },
  {
    label: 'Europe',
    options: [
      { label: 'London', value: 'lon' },
      { label: 'Paris', value: 'par' },
      { label: 'Berlin', value: 'ber' },
    ],
  },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Select> = {
  title: 'Components/Form/select',
  component: Select,
  parameters: { layout: 'padded' },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    label: 'Choice',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, icons, states, groups
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack gap="var(--gap-huge)">
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <Select size="sm" placeholder="Small" options={basicOptions} icon={<Icon icon="ph:tag" />} />
          <Select size="md" placeholder="Medium" options={basicOptions} icon={<Icon icon="ph:tag" />} />
          <Select size="lg" placeholder="Large" options={basicOptions} icon={<Icon icon="ph:tag" />} />
        </Stack>
      </div>

      <div>
        <SectionLabel>With icon and label</SectionLabel>
        <Select
          label="Company"
          placeholder="Select company..."
          options={[
            { label: 'Acme Corp', value: 'acme' },
            { label: 'Globex Inc', value: 'globex' },
            { label: 'Initech', value: 'initech' },
          ]}
          icon={<Icon icon="ph:buildings" />}
        />
      </div>

      <div>
        <SectionLabel>With default value</SectionLabel>
        <Select placeholder="Select one..." options={basicOptions} defaultValue="second" />
      </div>

      <div>
        <SectionLabel>Disabled</SectionLabel>
        <Select placeholder="Select one..." options={basicOptions} disabled />
      </div>

      <div>
        <SectionLabel>Error state</SectionLabel>
        <Select
          label="Region"
          placeholder="Select region..."
          options={[
            { label: 'North America', value: 'na' },
            { label: 'Europe', value: 'eu' },
            { label: 'Asia Pacific', value: 'apac' },
          ]}
          error="Please select a region"
          icon={<Icon icon="ph:globe" />}
        />
      </div>

      <div>
        <SectionLabel>Option groups</SectionLabel>
        <Select
          label="Location"
          placeholder="Select a city..."
          options={groupedOptions}
          icon={<Icon icon="ph:globe" />}
        />
      </div>

      <div>
        <SectionLabel>Compact (fullWidth=false)</SectionLabel>
        <Select placeholder="Compact..." options={basicOptions} fullWidth={false} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world compositions
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Stack gap="var(--gap-huge)">
      {/* Form layout */}
      <div>
        <SectionLabel>Form layout</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--padding-lg)' }}>
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <Select
              label="Country"
              placeholder="Select country..."
              options={[
                { label: 'United States', value: 'us' },
                { label: 'Canada', value: 'ca' },
                { label: 'United Kingdom', value: 'uk' },
                { label: 'Australia', value: 'au' },
              ]}
              icon={<Icon icon="ph:globe" />}
            />
          </div>
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <Select
              label="Industry"
              placeholder="Select industry..."
              options={[
                { label: 'Technology', value: 'tech' },
                { label: 'Healthcare', value: 'healthcare' },
                { label: 'Finance', value: 'finance' },
                { label: 'Education', value: 'education' },
              ]}
              icon={<Icon icon="ph:buildings" />}
            />
          </div>
        </div>
      </div>

      {/* Constrained width */}
      <div>
        <SectionLabel>Constrained container</SectionLabel>
        <div style={{ maxWidth: '320px' }}>
          <Select
            label="Role"
            placeholder="Select role..."
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Editor', value: 'editor' },
              { label: 'Viewer', value: 'viewer' },
            ]}
            helperText="Choose the permission level for this user"
          />
        </div>
      </div>
    </Stack>
  ),
};
