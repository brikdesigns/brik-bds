import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { MultiSelect } from './MultiSelect';

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

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/Form/multi-select',
  component: MultiSelect,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

/* ─── Shared data ─────────────────────────────────────── */

const serviceOptions = [
  { label: 'Brand Design', value: 'brand', icon: <Icon icon="ph:paint-brush" /> },
  { label: 'Marketing', value: 'marketing', icon: <Icon icon="ph:megaphone" /> },
  { label: 'Information Design', value: 'information', icon: <Icon icon="ph:info" /> },
  { label: 'Product Design', value: 'product', icon: <Icon icon="ph:cube" /> },
  { label: 'Service Design', value: 'service', icon: <Icon icon="ph:gear" /> },
];

const skillOptions = [
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Tailwind CSS', value: 'tailwind' },
  { label: 'Figma', value: 'figma' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'PostgreSQL', value: 'postgres' },
  { label: 'GraphQL', value: 'graphql' },
];

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Service lines',
    placeholder: 'Select service lines...',
    options: serviceOptions,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, pre-selected, disabled, error
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  args: { options: serviceOptions },
  render: () => {
    const [smValues, setSmValues] = useState<string[]>(['brand']);
    const [mdValues, setMdValues] = useState<string[]>(['brand', 'marketing']);
    const [lgValues, setLgValues] = useState<string[]>(['brand', 'marketing', 'product']);
    const [errorValues, setErrorValues] = useState<string[]>([]);

    return (
      <Stack>
        <div>
          <SectionLabel>Sizes</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <MultiSelect label="Small" size="sm" placeholder="Select..." options={serviceOptions} value={smValues} onChange={setSmValues} />
            <MultiSelect label="Medium (default)" size="md" placeholder="Select..." options={serviceOptions} value={mdValues} onChange={setMdValues} />
            <MultiSelect label="Large" size="lg" placeholder="Select..." options={serviceOptions} value={lgValues} onChange={setLgValues} />
          </Stack>
        </div>

        <div>
          <SectionLabel>States</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <MultiSelect label="Disabled" placeholder="Select..." options={serviceOptions} value={['brand', 'marketing']} disabled />
            <MultiSelect
              label="With error"
              placeholder="Select at least one..."
              options={serviceOptions}
              value={errorValues}
              onChange={setErrorValues}
              error={errorValues.length === 0 ? 'Please select at least one service' : undefined}
            />
          </Stack>
        </div>
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Form with multi-select fields
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  args: { options: serviceOptions },
  render: () => {
    const [services, setServices] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>(['react', 'typescript']);

    return (
      <Stack>
        <div>
          <SectionLabel>Project intake form</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <MultiSelect
              label="Service lines"
              placeholder="Select service lines..."
              options={serviceOptions}
              value={services}
              onChange={setServices}
              helperText="Choose all services that apply"
            />
            <MultiSelect
              label="Required skills"
              placeholder="Add skills..."
              options={skillOptions}
              value={skills}
              onChange={setSkills}
              helperText="Select all that apply"
            />
          </Stack>
        </div>
      </Stack>
    );
  },
};
