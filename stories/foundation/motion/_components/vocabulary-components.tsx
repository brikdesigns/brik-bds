import { type CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// VocabTable — renders an enum value list as a styled table
// ---------------------------------------------------------------------------

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
  marginBottom: 24,
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid var(--border-muted)',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const tdStyle: CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border-muted)',
  verticalAlign: 'top',
};

const codeStyle: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  backgroundColor: 'var(--surface-secondary)',
  padding: '2px 6px',
  borderRadius: 'var(--border-radius-sm)',
  border: '1px solid var(--border-muted)',
};

export interface VocabRow {
  value: string;
  description: string;
  link?: string;
}

export function VocabTable({ rows }: { rows: VocabRow[] }) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Value</th>
          <th style={thStyle}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.value}>
            <td style={tdStyle}>
              <code style={codeStyle}>{row.value}</code>
            </td>
            <td style={tdStyle}>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
