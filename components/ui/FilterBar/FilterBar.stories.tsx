import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect } from 'storybook/test';
import { FilterBar } from './FilterBar';
import { FilterButton } from '../FilterButton';
import { FilterToggle } from '../FilterToggle';

/* ─── Shared Fixtures ─────────────────────────────────── */

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

const statusOptions = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Components/Action/filter-bar',
  component: FilterBar,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', minHeight: 200, padding: 'var(--padding-lg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, no filter applied; counter neutral
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    title: 'Companies',
    total: rows.length,
    filtered: rows.length,
    label: 'companies',
    children: (
      <>
        <FilterButton label="Industry" options={industryOptions} />
        <FilterButton label="Status" options={statusOptions} />
      </>
    ),
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. FILTERED — Filter active; counter switches to brand + Clear button
   ═══════════════════════════════════════════════════════════════ */

/** @summary Filtered */
export const Filtered: Story = {
  args: {
    title: 'Companies',
    total: rows.length,
    filtered: 3,
    label: 'companies',
    onClear: fn(),
    children: (
      <>
        <FilterButton label="Industry" options={industryOptions} value="saas" />
        <FilterButton label="Status" options={statusOptions} />
      </>
    ),
  },
  play: async ({ canvas, args }) => {
    const clearBtn = await canvas.findByRole('button', { name: /clear filters/i });
    await clearBtn.click();
    await expect(args.onClear).toHaveBeenCalled();
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. NO TITLE — Counter leads when title is omitted
   ═══════════════════════════════════════════════════════════════ */

/** @summary No title */
export const NoTitle: Story = {
  args: {
    total: rows.length,
    filtered: rows.length,
    label: 'companies',
    children: (
      <>
        <FilterButton label="Industry" options={industryOptions} />
        <FilterButton label="Status" options={statusOptions} />
      </>
    ),
  },
};

/* ═══════════════════════════════════════════════════════════════
   4. NO CLEAR — onClear omitted so no button appears when filtered
   ═══════════════════════════════════════════════════════════════ */

/** @summary No clear */
export const NoClear: Story = {
  args: {
    title: 'Companies',
    total: rows.length,
    filtered: 2,
    label: 'companies',
    children: (
      <>
        <FilterButton label="Industry" options={industryOptions} value="legal" />
      </>
    ),
  },
};

/* ═══════════════════════════════════════════════════════════════
   5. PATTERNS — Full table + filter wiring (real-world composition)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  args: {
    title: 'Companies',
    total: rows.length,
    filtered: rows.length,
    label: 'companies',
    children: null,
  },
  render: () => {
    function Demo() {
      const [industry, setIndustry] = useState<string | undefined>();
      const [status, setStatus] = useState<string | undefined>();

      const filtered = useMemo(() => {
        return rows.filter((r) => {
          if (industry && r.industry !== industry) return false;
          if (status && r.status !== status) return false;
          return true;
        });
      }, [industry, status]);

      const clearFilters = () => {
        setIndustry(undefined);
        setStatus(undefined);
      };

      return (
        <div>
          <FilterBar
            title="Companies"
            total={rows.length}
            filtered={filtered.length}
            label="companies"
            onClear={clearFilters}
          >
            <FilterButton
              label="Industry"
              options={industryOptions}
              value={industry}
              onChange={setIndustry}
            />
            <FilterButton
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            <FilterToggle
              label="Active only"
              active={status === 'active'}
              onToggle={() => setStatus(status === 'active' ? undefined : 'active')}
            />
          </FilterBar>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 'var(--padding-sm)', borderBottom: '1px solid var(--border-muted)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: 'var(--padding-sm)', borderBottom: '1px solid var(--border-muted)' }}>Industry</th>
                <th style={{ textAlign: 'left', padding: 'var(--padding-sm)', borderBottom: '1px solid var(--border-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 'var(--padding-sm)', borderBottom: '1px solid var(--border-muted)' }}>{r.name}</td>
                  <td style={{ padding: 'var(--padding-sm)', borderBottom: '1px solid var(--border-muted)', textTransform: 'capitalize' }}>{r.industry}</td>
                  <td style={{ padding: 'var(--padding-sm)', borderBottom: '1px solid var(--border-muted)', textTransform: 'capitalize' }}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <Demo />;
  },
};
