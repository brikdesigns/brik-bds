import { useState, useEffect, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardFrame, DashboardSection } from './_components/DashboardFrame';

// ─── Types ──────────────────────────────────────────────────────────

interface CoverageData {
  totalDefined: number;
  totalUsed: number;
  totalOrphaned: number;
  usagePct: number;
  used: { token: string; components: string[]; count: number }[];
  orphaned: string[];
  undeclared: { token: string; components: string[] }[];
  hardcoded: { component: string; count: number }[];
}

// ─── Styles ─────────────────────────────────────────────────────────

const card: CSSProperties = {
  padding: 'var(--bds-padding-lg)',
  backgroundColor: 'var(--bds-surface-primary)',
  borderRadius: 'var(--bds-border-radius-md)',
  border: '1px solid var(--bds-border-muted)',
};

const metric: CSSProperties = {
  fontFamily: 'var(--bds-font-family-heading)',
  fontSize: 'var(--bds-heading-lg)',
  fontWeight: 'var(--bds-font-weight-bold)' as unknown as number,
  color: 'var(--bds-text-primary)',
};

const tableCell: CSSProperties = {
  padding: 'var(--bds-gap-xs) var(--bds-gap-sm)',
  fontFamily: 'var(--bds-font-family-body)',
  fontSize: 'var(--bds-body-sm)',
  borderBottom: '1px solid var(--bds-border-muted)',
  color: 'var(--bds-text-primary)',
};

// ─── Components ─────────────────────────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ width: '100%', height: 6, backgroundColor: 'var(--bds-background-secondary)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
    </div>
  );
}

function TokenUsageTable({ tokens, maxCount }: { tokens: CoverageData['used']; maxCount: number }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--bds-border-muted)' }}>
          <th style={{ ...tableCell, textAlign: 'left', color: 'var(--bds-text-secondary)' }}>Token</th>
          <th style={{ ...tableCell, textAlign: 'right', color: 'var(--bds-text-secondary)', width: 60 }}>Uses</th>
          <th style={{ ...tableCell, color: 'var(--bds-text-secondary)', width: 120 }}>Coverage</th>
          <th style={{ ...tableCell, textAlign: 'left', color: 'var(--bds-text-secondary)' }}>Components</th>
        </tr>
      </thead>
      <tbody>
        {tokens.slice(0, 30).map(t => (
          <tr key={t.token}>
            <td style={{ ...tableCell, fontFamily: 'var(--bds-font-family-system, monospace)', fontSize: 'var(--bds-body-xs)' }}>{t.token}</td>
            <td style={{ ...tableCell, textAlign: 'right' }}>{t.count}</td>
            <td style={tableCell}><Bar value={t.count} max={maxCount} color="var(--bds-color-system-green)" /></td>
            <td style={{ ...tableCell, fontSize: 'var(--bds-body-xs)', color: 'var(--bds-text-muted)' }}>{t.components.slice(0, 5).join(', ')}{t.components.length > 5 ? ` +${t.components.length - 5}` : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OrphanedList({ tokens }: { tokens: string[] }) {
  // Group by category prefix
  const groups: Record<string, string[]> = {};
  for (const t of tokens) {
    const cat = t.replace(/^--/, '').split('-')[0];
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(t);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-md)' }}>
      {Object.entries(groups).sort((a, b) => b[1].length - a[1].length).map(([cat, toks]) => (
        <div key={cat}>
          <div style={{ fontFamily: 'var(--bds-font-family-label)', fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-secondary)', marginBottom: 'var(--bds-gap-xs)' }}>
            {cat} <span style={{ color: 'var(--bds-text-muted)' }}>({toks.length})</span>
          </div>
          <div style={{ fontFamily: 'var(--bds-font-family-system, monospace)', fontSize: 'var(--bds-body-xs)', color: 'var(--bds-text-muted)', lineHeight: 1.8 }}>
            {toks.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}

function HardcodedLeaderboard({ items }: { items: CoverageData['hardcoded'] }) {
  if (items.length === 0) return <div style={{ color: 'var(--bds-text-muted)', fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-sm)' }}>No hardcoded values detected</div>;
  const max = items[0]?.count ?? 1;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {items.slice(0, 15).map(item => (
          <tr key={item.component}>
            <td style={{ ...tableCell, width: 180 }}>{item.component}</td>
            <td style={{ ...tableCell, textAlign: 'right', width: 50 }}>{item.count}</td>
            <td style={tableCell}><Bar value={item.count} max={max} color="var(--bds-color-system-yellow)" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main ───────────────────────────────────────────────────────────

function TokenCoverageDashboard() {
  const [data, setData] = useState<CoverageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/health-data.json')
      .then(r => r.json())
      .then(d => setData(d.coverage))
      .catch(() => setError('Health data not found. Run: node scripts/build-health-data.js'));
  }, []);

  if (error) return <div style={{ padding: 'var(--bds-padding-xl)', fontFamily: 'var(--bds-font-family-body)', color: 'var(--bds-text-secondary)' }}>{error}</div>;
  if (!data) return <div style={{ padding: 'var(--bds-padding-xl)', fontFamily: 'var(--bds-font-family-body)', color: 'var(--bds-text-muted)' }}>Loading...</div>;

  const maxCount = data.used[0]?.count ?? 1;

  return (
    <DashboardFrame
      title="Token Coverage"
      subtitle={
        <>
          {data.totalUsed} of {data.totalDefined} defined tokens referenced in component CSS ({data.usagePct}%).
          {data.totalOrphaned > 0 && ` ${data.totalOrphaned} orphaned tokens.`}
        </>
      }
    >
      <DashboardSection title="Summary">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--bds-gap-md)' }}>
          <div style={card}><div style={metric}>{data.totalDefined}</div><div style={{ fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-muted)' }}>Total defined</div></div>
          <div style={card}><div style={{ ...metric, color: 'var(--bds-color-system-green)' }}>{data.totalUsed}</div><div style={{ fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-muted)' }}>Used in components</div></div>
          <div style={card}><div style={{ ...metric, color: data.totalOrphaned > 50 ? 'var(--bds-color-system-yellow)' : 'var(--bds-text-primary)' }}>{data.totalOrphaned}</div><div style={{ fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-muted)' }}>Orphaned</div></div>
          <div style={card}><div style={{ ...metric, color: 'var(--bds-color-system-green)' }}>{data.usagePct}%</div><div style={{ fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-muted)' }}>Usage rate</div></div>
        </div>
      </DashboardSection>

      <DashboardSection title="Most-used tokens">
        <TokenUsageTable tokens={data.used} maxCount={maxCount} />
      </DashboardSection>

      {data.hardcoded.length > 0 && (
        <DashboardSection title="Hardcoded values by component">
          <HardcodedLeaderboard items={data.hardcoded} />
        </DashboardSection>
      )}

      {data.orphaned.length > 0 && (
        <DashboardSection title={`Orphaned tokens (${data.orphaned.length})`}>
          <div style={{ ...card, maxHeight: 400, overflowY: 'auto' }}>
            <OrphanedList tokens={data.orphaned} />
          </div>
        </DashboardSection>
      )}

      {data.undeclared && data.undeclared.length > 0 && (
        <DashboardSection
          title={`Undeclared references (${data.undeclared.length})`}
          description="Tokens used in components but not defined in figma-tokens.css or gap-fills.css."
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {data.undeclared.slice(0, 20).map(u => (
                <tr key={u.token}>
                  <td style={{ ...tableCell, fontFamily: 'var(--bds-font-family-system, monospace)', fontSize: 'var(--bds-body-xs)' }}>{u.token}</td>
                  <td style={{ ...tableCell, color: 'var(--bds-text-muted)' }}>{u.components.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardSection>
      )}
    </DashboardFrame>
  );
}

// ─── Meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof TokenCoverageDashboard> = {
  title: 'Overview/Health/Token Coverage',
  // Internal coverage dashboard — hidden from MCP discovery (#1321).
  tags: ['surface-shared', '!manifest'],
  component: TokenCoverageDashboard,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TokenCoverageDashboard>;

/** @summary Per-component token coverage and hardcoded-value counts */
export const Default: Story = {};
