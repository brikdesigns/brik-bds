import { useState, useEffect, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

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

const heading: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-primary)',
  margin: '0 0 var(--gap-md)',
};

const sectionLabel: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--label-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-secondary)',
  margin: '0 0 var(--gap-sm)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const card: CSSProperties = {
  padding: 'var(--padding-lg)',
  backgroundColor: 'var(--surface-primary)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border-muted)', // bds-lint-ignore
};

const metric: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-lg)',
  fontWeight: 'var(--font-weight-bold)' as unknown as number,
  color: 'var(--text-primary)',
};

const tableCell: CSSProperties = {
  padding: 'var(--gap-xs) var(--gap-sm)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  borderBottom: '1px solid var(--border-muted)', // bds-lint-ignore
  color: 'var(--text-primary)',
};

// ─── Components ─────────────────────────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ width: '100%', height: 6, backgroundColor: 'var(--background-secondary)', borderRadius: 3, overflow: 'hidden' }}>{/* bds-lint-ignore */}
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />{/* bds-lint-ignore */}
    </div>
  );
}

function TokenUsageTable({ tokens, maxCount }: { tokens: CoverageData['used']; maxCount: number }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border-muted)' }}>{/* bds-lint-ignore */}
          <th style={{ ...tableCell, textAlign: 'left', color: 'var(--text-secondary)' }}>Token</th>
          <th style={{ ...tableCell, textAlign: 'right', color: 'var(--text-secondary)', width: 60 }}>Uses</th>
          <th style={{ ...tableCell, color: 'var(--text-secondary)', width: 120 }}>Coverage</th>
          <th style={{ ...tableCell, textAlign: 'left', color: 'var(--text-secondary)' }}>Components</th>
        </tr>
      </thead>
      <tbody>
        {tokens.slice(0, 30).map(t => (
          <tr key={t.token}>
            <td style={{ ...tableCell, fontFamily: 'var(--font-family-system, monospace)', fontSize: 'var(--body-xs)' }}>{t.token}</td>
            <td style={{ ...tableCell, textAlign: 'right' }}>{t.count}</td>
            <td style={tableCell}><Bar value={t.count} max={maxCount} color="var(--color-system-green)" /></td>
            <td style={{ ...tableCell, fontSize: 'var(--body-xs)', color: 'var(--text-muted)' }}>{t.components.slice(0, 5).join(', ')}{t.components.length > 5 ? ` +${t.components.length - 5}` : ''}</td>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      {Object.entries(groups).sort((a, b) => b[1].length - a[1].length).map(([cat, toks]) => (
        <div key={cat}>
          <div style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--gap-xs)' }}>
            {cat} <span style={{ color: 'var(--text-muted)' }}>({toks.length})</span>
          </div>
          <div style={{ fontFamily: 'var(--font-family-system, monospace)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {toks.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}

function HardcodedLeaderboard({ items }: { items: CoverageData['hardcoded'] }) {
  if (items.length === 0) return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)' }}>No hardcoded values detected</div>;
  const max = items[0]?.count ?? 1;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {items.slice(0, 15).map(item => (
          <tr key={item.component}>
            <td style={{ ...tableCell, width: 180 }}>{item.component}</td>
            <td style={{ ...tableCell, textAlign: 'right', width: 50 }}>{item.count}</td>
            <td style={tableCell}><Bar value={item.count} max={max} color="var(--color-system-yellow)" /></td>
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

  if (error) return <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', color: 'var(--text-secondary)' }}>{error}</div>;
  if (!data) return <div style={{ padding: 'var(--padding-xl)', fontFamily: 'var(--font-family-body)', color: 'var(--text-muted)' }}>Loading...</div>;

  const maxCount = data.used[0]?.count ?? 1;

  return (
    <div style={{ padding: 'var(--padding-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', maxWidth: 1200 }}>
      <div>
        <h1 style={heading}>Token Coverage</h1>
        <div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', color: 'var(--text-secondary)' }}>
          {data.totalUsed} of {data.totalDefined} defined tokens referenced in component CSS ({data.usagePct}%).
          {data.totalOrphaned > 0 && ` ${data.totalOrphaned} orphaned tokens.`}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <div style={card}><div style={metric}>{data.totalDefined}</div><div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-muted)' }}>Total defined</div></div>
        <div style={card}><div style={{ ...metric, color: 'var(--color-system-green)' }}>{data.totalUsed}</div><div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-muted)' }}>Used in components</div></div>
        <div style={card}><div style={{ ...metric, color: data.totalOrphaned > 50 ? 'var(--color-system-yellow)' : 'var(--text-primary)' }}>{data.totalOrphaned}</div><div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-muted)' }}>Orphaned</div></div>
        <div style={card}><div style={{ ...metric, color: 'var(--color-system-green)' }}>{data.usagePct}%</div><div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-muted)' }}>Usage rate</div></div>
      </div>

      {/* Token usage table */}
      <div>
        <h2 style={sectionLabel}>Most-Used Tokens</h2>
        <TokenUsageTable tokens={data.used} maxCount={maxCount} />
      </div>

      {/* Hardcoded values */}
      {data.hardcoded.length > 0 && (
        <div>
          <h2 style={sectionLabel}>Hardcoded Values by Component</h2>
          <HardcodedLeaderboard items={data.hardcoded} />
        </div>
      )}

      {/* Orphaned tokens */}
      {data.orphaned.length > 0 && (
        <div>
          <h2 style={sectionLabel}>Orphaned Tokens ({data.orphaned.length})</h2>
          <div style={{ ...card, maxHeight: 400, overflowY: 'auto' }}>
            <OrphanedList tokens={data.orphaned} />
          </div>
        </div>
      )}

      {/* Undeclared references */}
      {data.undeclared && data.undeclared.length > 0 && (
        <div>
          <h2 style={sectionLabel}>Undeclared References ({data.undeclared.length})</h2>
          <div style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-sm)', color: 'var(--text-muted)', marginBottom: 'var(--gap-sm)' }}>
            Tokens used in components but not defined in figma-tokens.css or gap-fills.css
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {data.undeclared.slice(0, 20).map(u => (
                <tr key={u.token}>
                  <td style={{ ...tableCell, fontFamily: 'var(--font-family-system, monospace)', fontSize: 'var(--body-xs)' }}>{u.token}</td>
                  <td style={{ ...tableCell, color: 'var(--text-muted)' }}>{u.components.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof TokenCoverageDashboard> = {
  title: 'Overview/Token Coverage',
  component: TokenCoverageDashboard,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TokenCoverageDashboard>;

export const Default: Story = {};
