import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faBullhorn,
  faMobileScreen,
  faGear,
  faChalkboardUser,
  faCopy,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { FilterButton } from './FilterButton';

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

const Row = ({ children, gap = 'var(--gap-lg)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'flex-start' }}>{children}</div>
);

/* ─── Shared Data ─────────────────────────────────────── */

const categoryOptions = [
  { id: 'brand', label: 'Brand design', icon: <FontAwesomeIcon icon={faCrown} /> },
  { id: 'marketing', label: 'Marketing design', icon: <FontAwesomeIcon icon={faBullhorn} /> },
  { id: 'product', label: 'Product design', icon: <FontAwesomeIcon icon={faMobileScreen} /> },
  { id: 'service', label: 'Back office design', icon: <FontAwesomeIcon icon={faGear} /> },
  { id: 'information', label: 'Information design', icon: <FontAwesomeIcon icon={faChalkboardUser} /> },
  { id: 'templates', label: 'Templates', icon: <FontAwesomeIcon icon={faCopy} /> },
];

const regionOptions = [
  { id: 'na', label: 'North America', icon: <FontAwesomeIcon icon={faGlobe} /> },
  { id: 'eu', label: 'Europe', icon: <FontAwesomeIcon icon={faGlobe} /> },
  { id: 'apac', label: 'Asia Pacific', icon: <FontAwesomeIcon icon={faGlobe} /> },
];

const tagOptions = [
  { id: 'new', label: 'New' },
  { id: 'popular', label: 'Popular' },
  { id: 'featured', label: 'Featured' },
  { id: 'archived', label: 'Archived' },
];

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Components/Action/filter-button',
  component: FilterButton,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 360, padding: 'var(--padding-lg)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Category',
    options: categoryOptions,
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, states, text-only
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  args: { label: 'Category', options: categoryOptions },
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          <FilterButton label="Small" options={categoryOptions} size="sm" />
          <FilterButton label="Medium" options={categoryOptions} size="md" />
          <FilterButton label="Large" options={categoryOptions} size="lg" />
        </Row>
      </div>

      <div>
        <SectionLabel>Active (value selected)</SectionLabel>
        <Row>
          <FilterButton label="Category" options={categoryOptions} value="brand" size="sm" />
          <FilterButton label="Category" options={categoryOptions} value="marketing" size="md" />
          <FilterButton label="Category" options={categoryOptions} value="product" size="lg" />
        </Row>
      </div>

      <div>
        <SectionLabel>Text-only options (no icons)</SectionLabel>
        <FilterButton label="Status" options={tagOptions} />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Interactive filter bar
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  args: { label: 'Category', options: categoryOptions },
  render: () => {
    function FilterBar() {
      const [cat, setCat] = useState<string | undefined>();
      const [reg, setReg] = useState<string | undefined>();
      const [tag, setTag] = useState<string | undefined>();

      return (
        <Stack>
          <div>
            <SectionLabel>Filter bar</SectionLabel>
            <Row>
              <FilterButton label="Category" options={categoryOptions} value={cat} onChange={setCat} />
              <FilterButton label="Region" options={regionOptions} value={reg} onChange={setReg} />
              <FilterButton label="Status" options={tagOptions} value={tag} onChange={setTag} />
            </Row>
          </div>
        </Stack>
      );
    }
    return <FilterBar />;
  },
};
