import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FilterBar } from './FilterBar';
import { FilterButton } from '../FilterButton';
import { FilterToggle } from '../FilterToggle';

/* ─── Sample data ─────────────────────────────────────────────── */

type Row = { id: string; name: string; industry: string; status: 'active' | 'inactive' };

const rows: Row[] = [
  { id: '1', name: 'Acme Co', industry: 'saas', status: 'active' },
  { id: '2', name: 'Beacon Health', industry: 'healthcare', status: 'active' },
  { id: '3', name: 'Cedar Finance', industry: 'finance', status: 'active' },
  { id: '4', name: 'Dawn Labs', industry: 'saas', status: 'inactive' },
  { id: '5', name: 'Evergreen Legal', industry: 'legal', status: 'active' },
  { id: '6', name: 'Fig Studio', industry: 'creative', status: 'inactive' },
  { id: '7', name: 'Gridline', industry: 'saas', status: 'active' },
  { id: '8', name: 'Harbor & Co', industry: 'legal', status: 'active' },
];

const industryOptions = [
  { id: 'saas', label: 'SaaS' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'finance', label: 'Finance' },
  { id: 'legal', label: 'Legal' },
  { id: 'creative', label: 'Creative' },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof FilterBar> = {
  title: 'Components/Action/filter-bar',
  component: FilterBar,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ minHeight: 280 }}><Story /></div>],
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional section heading rendered at heading-sm inline with the counter.',
    },
    label: {
      control: 'text',
      description: 'Plural entity label used in the aria-label fallback (e.g. "companies", "tasks").',
    },
    clearLabel: {
      control: 'text',
      description: 'Label for the clear button. Default `"Clear filters"`.',
    },
    activeStatus: {
      control: 'select',
      options: ['brand', 'positive', 'warning', 'negative', 'neutral'],
      description: 'Counter status when a filter is active. Default `brand` — gives the count a brand-color pill while filtered.',
    },
    total: {
      control: false,
      description: 'Total count before filtering. Story drives this from `rows.length`.',
    },
    filtered: {
      control: false,
      description: 'Count after filtering. Story computes this from the hook-filtered subset.',
    },
    children: {
      control: false,
      description: 'FilterButton / FilterToggle children rendered to the right of the title + counter. Story injects industry + active-only filters.',
    },
    onClear: {
      action: 'cleared',
      description: 'Callback to clear all filters. When provided, a ghost "Clear filters" button appears while filtered < total.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — full composition (bar + FilterButton + FilterToggle +
   clear-all). Hook-driven because FilterBar's defining behavior is
   interactive filtering with live counter updates. This is Q4
   irreducible per ADR-010 — args alone can't express the filter →
   recount → clear-button-appears cycle. The Default story IS the
   canonical use case; no separate Patterns story needed.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Heading + counter + filter children + clear-all */
export const Default: Story = {
  args: {
    title: 'Engagements',
    label: 'engagements',
    clearLabel: 'Clear filters',
    activeStatus: 'brand',
    onClear: fn(),
  },
  render: (args) => {
    const [industry, setIndustry] = useState<string | undefined>(undefined);
    const [activeOnly, setActiveOnly] = useState(false);

    const filteredRows = useMemo(
      () =>
        rows.filter((r) => {
          if (industry && r.industry !== industry) return false;
          if (activeOnly && r.status !== 'active') return false;
          return true;
        }),
      [industry, activeOnly],
    );

    const handleClear = () => {
      setIndustry(undefined);
      setActiveOnly(false);
      args.onClear?.();
    };

    return (
      <FilterBar
        {...args}
        total={rows.length}
        filtered={filteredRows.length}
        onClear={handleClear}
      >
        <FilterButton
          label="Industry"
          options={industryOptions}
          value={industry}
          onChange={setIndustry}
        />
        <FilterToggle
          label="Active only"
          active={activeOnly}
          onToggle={() => setActiveOnly((prev) => !prev)}
        />
      </FilterBar>
    );
  },
};
