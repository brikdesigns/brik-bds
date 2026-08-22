import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FilterBar } from './FilterBar';
import { FilterButton } from '../FilterButton';
import { FilterToggle } from '../FilterToggle';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import { DataSection } from '../DataSection';
import type { CounterTone } from '../Counter';

/* ─── Counter tone options for the activeStatus Control ─────────
   Mirrors `CounterTone` from ../Counter exactly. The `satisfies`
   cast catches drift if Counter adds / renames tones.
   ─────────────────────────────────────────────────────────────── */
const counterToneOptions = [
  'brand',
  'positive',
  'negative',
  'warning',
  'info',
  'neutral',
] satisfies CounterTone[];

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
  title: 'Components/filter-bar',
  component: FilterBar,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  decorators: [
    // 1200px container matches a typical desktop list/table viewport — Table
    // ships fluid (`width: 100%`) and FilterBar sits above it. The constraint
    // is only on the story canvas, not the component itself; consumers
    // control the width via their layout.
    (Story) => <div style={{ width: '100%', maxWidth: 1200, minHeight: 280 }}><Story /></div>,
  ],
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional section heading rendered at heading-sm inline with the counter.',
    },
    titleAs: {
      control: 'inline-radio',
      options: ['h2', 'h3'],
      description:
        'HTML element for the title. Default `h2` — one collection sibling of the page\'s `<h1>`. Pick `h3` only when the bar nests under an existing `<h2>`, e.g. a collection tab inside a record page.',
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
      options: counterToneOptions,
      description:
        'Counter status when a filter is active. Default `brand` — gives the count a brand-color pill while filtered. ' +
        '`success` / `error` / `warning` / `progress` convey semantic meaning about the filtered set (e.g. error status when filtering to error rows). ' +
        '**`neutral` defeats the active-state visual** — the counter becomes indistinguishable from the inactive state, so it\'s rarely the right choice but supported for API completeness.',
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
      description:
        'FilterButton / FilterToggle children rendered to the right of the title + counter. Story injects industry + active-only filters. Optional — omit them and the controls row is dropped rather than left empty (see the NoFilters story).',
    },
    onClear: {
      action: 'cleared',
      description: 'Callback to clear all filters. When provided, a ghost "Clear filters" button appears while filtered < total.',
    },
    activeFilterCount: {
      control: false,
      description: 'Number of currently-active filters. Drives the `Filters (N)` label when the bar collapses on narrow own-widths (ADR-019). Story computes this from the hook-filtered subset.',
    },
    actions: {
      control: false,
      description:
        'Action buttons (typically a `ButtonGroup`) rendered flush-right, after the filter controls. Unlike `children`, `actions` does NOT fold into the `Filters` popover on collapse — it stays reachable at any width.',
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

/* ═══════════════════════════════════════════════════════════════
   NO FILTERS — a collection with no filterable axes. `children` is
   optional, so this shape is a FilterBar and not a hand-rolled
   heading row: no controls slot, no `Filters` popover on collapse,
   and `actions` picks up the flush-right auto margin the absent
   controls row would otherwise have carried.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Title + counter only — no filter children, no empty slot */
export const NoFilters: Story = {
  args: {
    title: 'Brand assets',
    label: 'assets',
    total: rows.length,
    filtered: rows.length,
  },
  render: (args) => (
    <FilterBar
      {...args}
      actions={
        <ButtonGroup align="end">
          <Button variant="primary" size="md">
            Upload
          </Button>
        </ButtonGroup>
      }
    />
  ),
};

/* ═══════════════════════════════════════════════════════════════
   NESTED HEADING — `titleAs="h3"`. A collection nested inside a
   record section that already owns the `<h2>` has to step down a
   level, or the document outline skips. The wrapping `DataSection`
   is the real-world case, not scaffolding: it renders the `<h2>`
   this bar nests under. Purely semantic — both render at
   `heading-sm`, which is exactly why the level cannot be inferred
   from the rendered output.
   ═══════════════════════════════════════════════════════════════ */

/** @summary titleAs="h3" for a collection nested in a DataSection */
export const NestedHeading: Story = {
  args: {
    title: 'Engagements',
    titleAs: 'h3',
    label: 'engagements',
    total: rows.length,
    filtered: rows.length,
  },
  render: (args) => (
    <DataSection title="Acme Co" subtitle="Client record">
      <FilterBar {...args}>
        <FilterButton
          label="Industry"
          options={industryOptions}
          value={undefined}
          onChange={() => {}}
        />
      </FilterBar>
    </DataSection>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   COLLAPSED — narrow own-width. Below ~600px of its OWN width (via
   ResizeObserver, ADR-019) the controls collapse into a `Filters (N)`
   popover so they never wrap. The 420px container forces the collapse;
   the component reacts to its own box, not the viewport. `activeFilterCount`
   drives the count on the trigger.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Narrow own-width collapses controls into a Filters popover */
export const Collapsed: Story = {
  args: {
    title: 'Engagements',
    label: 'engagements',
    clearLabel: 'Clear filters',
    activeStatus: 'brand',
    onClear: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [industry, setIndustry] = useState<string | undefined>('saas');
    const [activeOnly, setActiveOnly] = useState(true);

    const filteredRows = useMemo(
      () =>
        rows.filter((r) => {
          if (industry && r.industry !== industry) return false;
          if (activeOnly && r.status !== 'active') return false;
          return true;
        }),
      [industry, activeOnly],
    );

    const activeFilterCount = (industry ? 1 : 0) + (activeOnly ? 1 : 0);

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
        activeFilterCount={activeFilterCount}
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

/* ═══════════════════════════════════════════════════════════════
   WITH ACTIONS — a primary/secondary ButtonGroup flush-right of the
   filter controls. Unlike `children`, `actions` is exempt from the
   narrow-own-width collapse (ADR-019): shrink the canvas below ~600px
   and the filter controls fold into the `Filters (N)` popover while
   the ButtonGroup stays put, so a primary action (e.g. "Assign
   service") is never hidden behind a popover trigger.
   ═══════════════════════════════════════════════════════════════ */

/** @summary ButtonGroup flush-right, exempt from collapse */
export const WithActions: Story = {
  args: {
    title: 'Engagements',
    label: 'engagements',
    clearLabel: 'Clear filters',
    activeStatus: 'brand',
    onClear: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
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

    const activeFilterCount = (industry ? 1 : 0) + (activeOnly ? 1 : 0);

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
        activeFilterCount={activeFilterCount}
        onClear={handleClear}
        actions={
          <ButtonGroup align="end">
            <Button variant="outline" size="md">
              Export
            </Button>
            <Button variant="primary" size="md">
              Assign service
            </Button>
          </ButtonGroup>
        }
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
