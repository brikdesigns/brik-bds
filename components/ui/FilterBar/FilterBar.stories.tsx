import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FilterBar, type FilterBarProps } from './FilterBar';
import { FilterButton } from '../FilterButton';
import { FilterToggle } from '../FilterToggle';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import { DataSection } from '../DataSection';
import { PageHeader } from '../PageHeader';
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
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description:
        'Size of the bar\'s own buttons, forwarded to `actions` children with no `size`. Default `sm` — one step below `md` page-header buttons. Filter-bar buttons are never primary.',
    },
    actions: {
      control: false,
      description:
        'Action buttons (typically a `ButtonGroup`) rendered flush-right, after the filter controls. Unlike `children`, `actions` does NOT fold into the `Filters` popover on collapse — it stays reachable at any width.',
    },
    search: {
      control: false,
      description:
        'Search slot. Takes `SearchInput` props (one of `label` / `aria-label` / `aria-labelledby` is required) and renders the field at the start of the bar. Presence of the slot turns the bar into a `role="search"` landmark and mounts a `role="status"` region announcing `filtered of total`. Stays visible when the filter controls collapse. The consumer owns the query-to-rows logic; pass `value` to control the field, omit it to leave the field uncontrolled.',
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
            <Button variant="outline">Export</Button>
            <Button variant="secondary">Assign service</Button>
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

/* ═══════════════════════════════════════════════════════════════
   UNDER PAGE HEADER — hierarchy composition (a layout question, so a
   story rather than a control). The header's `md` buttons sit above
   the bar's `sm` ones; the bar's actions are never primary.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Filter bar one size below a md page header */
export const UnderPageHeader: Story = {
  args: { total: 24, filtered: 8, label: 'documents', title: 'Documents' },
  render: (args) => (
    <>
      <PageHeader
        title="Birdwell Mutlak Dentistry"
        actions={
          <ButtonGroup>
            <Button variant="primary">Upload</Button>
          </ButtonGroup>
        }
      />
      <FilterBar {...args} onClear={fn()} actions={<ButtonGroup><Button variant="outline">Export</Button></ButtonGroup>} />
    </>
  ),
};

/** @summary Verifies Clear and actions default to sm, and size overrides */
export const InteractionTestSize: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { total: 24, filtered: 8, label: 'documents' },
  render: (args) => (
    <FilterBar
      {...args}
      onClear={fn()}
      actions={<ButtonGroup><Button variant="outline">Export</Button></ButtonGroup>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Clear filters' })).toHaveClass('bds-button--size-sm');
    await expect(canvas.getByRole('button', { name: 'Export' })).toHaveClass('bds-button--size-sm');
  },
};

/* ═══════════════════════════════════════════════════════════════
   SEARCH — the `search` slot (ADR-049 § 5–6, #3103). The slot's
   presence is the axis, and it changes the bar's composition (a
   landmark, a live count, a field that outlives the collapse), so the
   three shapes below are stories rather than a Control on Default.
   Hook-driven (ADR-010 Q4): query → rows → recount → clear cannot be
   expressed as args. The consumer owns the query-to-rows logic; the
   demo filters `rows` by name in memory.
   ═══════════════════════════════════════════════════════════════ */

type SearchDemoProps = {
  args: FilterBarProps;
  /** Render the Industry + Active only controls beside the search field. */
  filters?: boolean;
  /** Pass `value` to the slot. Omitted: the field is uncontrolled. */
  controlled?: boolean;
};

function SearchDemo({ args, filters = false, controlled = true }: SearchDemoProps) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState<string | undefined>(undefined);
  const [activeOnly, setActiveOnly] = useState(false);

  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (industry && r.industry !== industry) return false;
        if (activeOnly && r.status !== 'active') return false;
        return true;
      }),
    [query, industry, activeOnly],
  );

  const handleClear = () => {
    // Uncontrolled: the bar clears the field itself, so the query is not reset here.
    if (controlled) setQuery('');
    setIndustry(undefined);
    setActiveOnly(false);
    args.onClear?.();
  };

  return (
    <FilterBar
      {...args}
      total={rows.length}
      filtered={filteredRows.length}
      activeFilterCount={(industry ? 1 : 0) + (activeOnly ? 1 : 0)}
      onClear={handleClear}
      search={{
        'aria-label': 'Search engagements',
        placeholder: 'Search engagements',
        ...(controlled ? { value: query } : {}),
        onChange: (e) => setQuery(e.target.value),
        onClear: () => setQuery(''),
      }}
    >
      {filters && (
        <>
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
        </>
      )}
    </FilterBar>
  );
}

const searchArgs = {
  title: 'Engagements',
  label: 'engagements',
  clearLabel: 'Clear filters',
  activeStatus: 'brand',
  onClear: fn(),
} satisfies Partial<FilterBarProps>;

/** @summary Search field + counter, no filter controls */
export const SearchOnly: Story = {
  args: searchArgs,
  render: (args) => <SearchDemo args={args as FilterBarProps} />,
};

/** @summary Search field plus filter controls and clear-all */
export const SearchWithFilters: Story = {
  args: searchArgs,
  render: (args) => <SearchDemo args={args as FilterBarProps} filters />,
};

/* Below ~600px of own width (ADR-019) the filter controls fold into the
   `Filters (N)` popover; the search field is not a filter control and stays
   inline. The 420px container forces the collapse. */

/** @summary Below 600px: field stays inline, filters fold away */
export const SearchCollapsed: Story = {
  args: searchArgs,
  decorators: [
    (Story) => (
      <div style={{ width: 420, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <SearchDemo args={args as FilterBarProps} filters />,
};

/** @summary Verifies one search landmark, on the bar with the slot */
export const InteractionTestSearchLandmark: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <>
      <FilterBar
        title="Engagements"
        label="engagements"
        total={rows.length}
        filtered={rows.length}
        search={{ 'aria-label': 'Search engagements' }}
      />
      <FilterBar title="Documents" label="documents" total={24} filtered={24} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two bars on the page, one with the slot: exactly one landmark.
    const landmarks = canvas.getAllByRole('search');
    await expect(landmarks).toHaveLength(1);
    await expect(landmarks[0]).toHaveAccessibleName('Engagements filter bar');
    await expect(landmarks[0]).toContainElement(canvas.getByRole('searchbox'));
    // The field itself carries no landmark role.
    await expect(canvas.getByRole('searchbox')).not.toHaveAttribute('role');
    // The slot is the first thing in the bar.
    await expect(landmarks[0].firstElementChild).toContainElement(canvas.getByRole('searchbox'));
  },
};

/** @summary Verifies count follows the query, zero included */
export const InteractionTestSearchCount: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: searchArgs,
  render: (args) => <SearchDemo args={args as FilterBarProps} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');
    const status = canvas.getByRole('status');
    await expect(status).toHaveTextContent('8 of 8 engagements');
    await expect(canvas.getByLabelText('Count: 8')).toBeInTheDocument();

    await userEvent.type(input, 'acme');
    await waitFor(() => expect(status).toHaveTextContent('1 of 8 engagements'));
    await expect(canvas.getByLabelText('Count: 1')).toBeInTheDocument();

    await userEvent.type(input, 'zzz');
    await waitFor(() => expect(status).toHaveTextContent('0 of 8 engagements'));
    await expect(canvas.getByLabelText('Count: 0')).toBeInTheDocument();
    // Same node throughout: the region stays mounted so the change is announced.
    await expect(canvas.getByRole('status')).toBe(status);
  },
};

/** @summary Verifies bar onClear clears the query (both modes) */
export const InteractionTestSearchClear: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: searchArgs,
  render: (args) => (
    <>
      <div data-testid="uncontrolled">
        <SearchDemo args={args as FilterBarProps} filters controlled={false} />
      </div>
      <div data-testid="controlled">
        <SearchDemo args={args as FilterBarProps} filters controlled />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    for (const id of ['uncontrolled', 'controlled']) {
      const scope = within(within(canvasElement).getByTestId(id));
      const input = scope.getByRole('searchbox');
      await userEvent.type(input, 'zzz');
      await waitFor(() => expect(scope.getByRole('status')).toHaveTextContent('0 of 8 engagements'));
      await userEvent.click(scope.getByRole('button', { name: 'Clear filters' }));
      await waitFor(() => expect(input).toHaveValue(''));
      await waitFor(() => expect(scope.getByRole('status')).toHaveTextContent('8 of 8 engagements'));
    }
  },
};

/** @summary Verifies field stays inline below 600px, filters fold */
export const InteractionTestSearchCollapsed: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: searchArgs,
  decorators: [
    (Story) => (
      <div style={{ width: 420, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <SearchDemo args={args as FilterBarProps} filters />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Filters' })).toBeInTheDocument());
    await expect(canvas.queryByRole('button', { name: /^Industry/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('searchbox')).toBeVisible();
    await expect(canvas.getByRole('search')).toContainElement(canvas.getByRole('searchbox'));
  },
};
