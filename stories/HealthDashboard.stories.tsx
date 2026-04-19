import { useState, useEffect, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardFrame, DashboardSection } from './_components/DashboardFrame';

// ─── Types ──────────────────────────────────────────────────────────

interface HealthData {
  generatedAt: string;
  health: {
    completeness: {
      pct: number;
      complete: number;
      total: number;
      gaps: { name: string; missing: string[] }[];
    };
    adoption?: {
      consumers: { name: string; adopted: number; total: number; adoptedPct: number }[];
    };
    bundle?: { totalHuman: string; files: { name: string; sizeHuman: string }[] };
    deps?: { total: number; major: { name: string; current: string; latest: string }[] };
  };
  lint: {
    errors: number;
    warnings: number;
    totalFiles: number;
    totalTokens: number;
  };
  grid: {
    spatialPct: number;
    spatialOnGrid: number;
    spatialTotal: number;
    categories: { name: string; pct: number; onGrid: number; total: number; offGrid: number }[];
  };
  coverage: {
    totalDefined: number;
    totalUsed: number;
    totalOrphaned: number;
    usagePct: number;
  };
}

// ─── Styles ─────────────────────────────────────────────────────────

const card: CSSProperties = {
  padding: 'var(--padding-lg)',
  backgroundColor: 'var(--surface-primary)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border-muted)', // bds-lint-ignore — card border
};

const metric: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-lg)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  color: 'var(--text-primary)',
};

const metricLabel: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  color: 'var(--text-muted)',
};

const badge = (pass: boolean): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px', // bds-lint-ignore — badge padding
  borderRadius: 'var(--border-radius-sm)',
  fontSize: 'var(--body-xs)',
  fontFamily: 'var(--font-family-label)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  backgroundColor: pass ? 'var(--color-system-green)' : 'var(--color-system-red)',
  color: '#fff', // bds-lint-ignore — badge text always white
});

// ─── Components ─────────────────────────────────────────────────────

function MetricCard({ value, label, status }: { value: string; label: string; status?: 'good' | 'warn' | 'bad' }) {
  const color = status === 'good' ? 'var(--color-system-green)' : status === 'bad' ? 'var(--color-system-red)' : 'var(--text-primary)';
  return (
    <div style={card}>
      <div style={{ ...metric, color }}>{value}</div>
      <div style={metricLabel}>{label}</div>
    </div>
  );
}

function CompletenessGrid({ gaps }: { gaps: { name: string; missing: string[] }[] }) {
  if (gaps.length === 0) return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)' }}>All components complete</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>{/* bds-lint-ignore */}
          <th style={{ textAlign: 'left', padding: 'var(--gap-xs)', color: 'var(--text-secondary)' }}>Component</th>
          <th style={{ textAlign: 'left', padding: 'var(--gap-xs)', color: 'var(--text-secondary)' }}>Missing</th>
        </tr>
      </thead>
      <tbody>
        {gaps.map(g => (
          <tr key={g.name} style={{ borderBottom: '1px solid var(--border-muted)' }}>{/* bds-lint-ignore */}
            <td style={{ padding: 'var(--gap-xs)', color: 'var(--text-primary)' }}>{g.name}</td>
            <td style={{ padding: 'var(--gap-xs)' }}>
              {g.missing.map(m => <span key={m} style={{ ...badge(false), marginRight: 'var(--gap-xs)' }}>{m}</span>)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────

function HealthDashboard() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/health-data.json')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Health data not found. Run: node scripts/build-health-data.js'));
  }, []);

  if (error) {
    return (
      <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', color: 'var(--text-secondary)' }}>
        <p>{error}</p>
      </div>
    );
  }
  if (!data) {
    return <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', color: 'var(--text-muted)' }}>Loading health data...</div>;
  }

  const h = data.health;
  const completePct = h.completeness?.pct ?? 0;
  const gridPct = data.grid?.spatialPct ?? 0;
  const coveragePct = data.coverage?.usagePct ?? 0;

  return (
    <DashboardFrame
      title="Health Dashboard"
      subtitle={`Generated ${new Date(data.generatedAt).toLocaleString()}`}
    >
      <DashboardSection title="Summary">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--gap-md)' }}>
          <MetricCard
            value={`${completePct}%`}
            label={`Completeness (${h.completeness?.complete}/${h.completeness?.total})`}
            status={completePct >= 95 ? 'good' : completePct >= 80 ? 'warn' : 'bad'}
          />
          <MetricCard
            value={`${data.lint.errors}/${data.lint.warnings}`}
            label="Lint errors / warnings"
            status={data.lint.errors === 0 ? 'good' : 'bad'}
          />
          <MetricCard
            value={`${gridPct}%`}
            label={`Grid compliance (${data.grid?.spatialOnGrid}/${data.grid?.spatialTotal})`}
            status={gridPct >= 90 ? 'good' : gridPct >= 75 ? 'warn' : 'bad'}
          />
          <MetricCard
            value={`${coveragePct}%`}
            label={`Token usage (${data.coverage?.totalUsed}/${data.coverage?.totalDefined})`}
            status={coveragePct >= 50 ? 'good' : 'warn'}
          />
        </div>
      </DashboardSection>

      {h.completeness?.gaps && h.completeness.gaps.length > 0 && (
        <DashboardSection title="Incomplete components">
          <CompletenessGrid gaps={h.completeness.gaps} />
        </DashboardSection>
      )}

      {data.grid?.categories && (
        <DashboardSection title="Grid compliance by category">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-sm)' }}>
            {data.grid.categories.map(cat => (
              <div key={cat.name} style={{ ...card, padding: 'var(--padding-sm)' }}>
                <div style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>{cat.name}</div>
                <div style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-sm)', color: cat.offGrid === 0 ? 'var(--color-system-green)' : 'var(--text-primary)' }}>
                  {cat.pct}% <span style={{ fontSize: 'var(--body-xs)', color: 'var(--text-muted)' }}>({cat.onGrid}/{cat.total})</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
        {h.bundle && !('error' in h.bundle) && (
          <DashboardSection title="Bundle size">
            <div style={{ ...card, padding: 'var(--padding-sm)' }}>
              <div style={metric}>{h.bundle.totalHuman}</div>
            </div>
          </DashboardSection>
        )}
        {h.deps && (
          <DashboardSection title="Dependencies">
            <div style={{ ...card, padding: 'var(--padding-sm)' }}>
              <div style={metric}>{h.deps.total} outdated</div>
              <div style={metricLabel}>{h.deps.major?.length ?? 0} major version bumps</div>
            </div>
          </DashboardSection>
        )}
      </div>
    </DashboardFrame>
  );
}

// ─── Meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof HealthDashboard> = {
  title: 'Overview/Health/Health Dashboard',
  component: HealthDashboard,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HealthDashboard>;

export const Default: Story = {};
