import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Server component. Renders the canonical blueprint library
 * (`@brikdesigns/bds/blueprints/library.json`) as a live catalog —
 * library metadata, coverage matrix (section type × moods), and a
 * collapsible per-blueprint details list grouped by section type.
 *
 * Reads the JSON via node:fs at SSG time. Same path-resolution pattern
 * as AtmospherePreview — process.cwd() resolves to the docs-site root
 * during both local and Netlify builds.
 */

interface Blueprint {
  key: string;
  name: string;
  section_type: string;
  industries: string[];
  moods: string[];
  layout_spec: string;
  css_hints?: string;
  source?: string;
  tier: string;
  is_active: boolean;
  version: string;
  last_reviewed: string;
  required_facts?: string[];
}

interface Library {
  version: string;
  last_reviewed: string;
  review_cadence: string;
  blueprints: Blueprint[];
}

const libraryPath = join(
  /* turbopackIgnore: true */ process.cwd(),
  'node_modules',
  '@brikdesigns',
  'bds',
  'blueprints',
  'blueprint-library.json',
);

const library: Library = JSON.parse(readFileSync(libraryPath, 'utf8'));

// Stable orderings derived from the data so cells stay consistent across renders.
const SECTION_TYPES: string[] = Array.from(
  new Set(library.blueprints.map((b) => b.section_type)),
).sort();

const MOODS: string[] = Array.from(
  new Set(library.blueprints.flatMap((b) => b.moods)),
).sort();

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  marginBottom: 24,
};
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '2px solid var(--border-muted)',
  fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid var(--border-muted)',
  verticalAlign: 'top',
};
const monoStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
};

export function BlueprintLibrary() {
  return (
    <div style={{ marginBottom: 'var(--padding-xl, 40px)' }}>
      <Metadata />
      <CoverageMatrix />
      <GroupedLibrary />
    </div>
  );
}

function Metadata() {
  const sectionTypesCovered = SECTION_TYPES.length;
  return (
    <table style={tableStyle}>
      <tbody>
        <tr>
          <td style={{ ...tdStyle, fontWeight: 600 }}>Library version</td>
          <td style={{ ...tdStyle, ...monoStyle }}>{library.version}</td>
        </tr>
        <tr>
          <td style={{ ...tdStyle, fontWeight: 600 }}>Last reviewed</td>
          <td style={tdStyle}>{library.last_reviewed}</td>
        </tr>
        <tr>
          <td style={{ ...tdStyle, fontWeight: 600 }}>Review cadence</td>
          <td style={tdStyle}>{library.review_cadence}</td>
        </tr>
        <tr>
          <td style={{ ...tdStyle, fontWeight: 600 }}>Blueprint count</td>
          <td style={tdStyle}>{library.blueprints.length}</td>
        </tr>
        <tr>
          <td style={{ ...tdStyle, fontWeight: 600 }}>Section types</td>
          <td style={tdStyle}>{sectionTypesCovered}</td>
        </tr>
      </tbody>
    </table>
  );
}

function CoverageMatrix() {
  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>Coverage matrix</h3>
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginBottom: 12,
        }}
      >
        Cell value = blueprint count for that section / mood combination.
        Empty cells (·) are gaps — opportunities to author.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Section</th>
              {MOODS.map((m) => (
                <th
                  key={m}
                  style={{
                    ...thStyle,
                    fontSize: 11,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTION_TYPES.map((section) => {
              const rowBlueprints = library.blueprints.filter(
                (b) => b.section_type === section,
              );
              return (
                <tr key={section}>
                  <td style={{ ...tdStyle, ...monoStyle }}>{section}</td>
                  {MOODS.map((m) => {
                    const count = rowBlueprints.filter((b) =>
                      b.moods.includes(m),
                    ).length;
                    return (
                      <td
                        key={m}
                        style={{
                          ...tdStyle,
                          textAlign: 'center',
                          color:
                            count === 0
                              ? 'var(--text-muted)'
                              : 'var(--text-primary)',
                          fontWeight: count > 0 ? 600 : 400,
                        }}
                      >
                        {count || '·'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupedLibrary() {
  const detailsBoxStyle: React.CSSProperties = {
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius-md, 8px)',
    padding: '12px 16px',
    marginBottom: 8,
    background: 'var(--surface-secondary)',
  };
  const summaryStyle: React.CSSProperties = {
    cursor: 'pointer',
    fontWeight: 600,
    color: 'var(--text-primary)',
  };
  const tagStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    background: 'var(--surface-primary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--border-radius-sm, 4px)',
    fontSize: 11,
    marginRight: 6,
    marginBottom: 4,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: 'var(--text-secondary)',
  };

  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>Library</h3>
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginBottom: 16,
        }}
      >
        Grouped by section type. Expand any blueprint for moods, industries,
        layout spec, and CSS hints.
      </p>

      {SECTION_TYPES.map((section) => {
        const entries = library.blueprints.filter(
          (b) => b.section_type === section,
        );
        if (entries.length === 0) return null;

        return (
          <div key={section} style={{ marginBottom: 32 }}>
            <h4
              style={{
                marginBottom: 8,
                textTransform: 'capitalize',
                fontSize: 16,
              }}
            >
              {section.replace(/_/g, ' ')}{' '}
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  fontSize: 13,
                }}
              >
                ({entries.length})
              </span>
            </h4>

            {entries.map((bp) => (
              <details key={bp.key} style={detailsBoxStyle}>
                <summary style={summaryStyle}>
                  {bp.name}
                  <code
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                    }}
                  >
                    {bp.key}
                  </code>
                  {!bp.is_active && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: 'var(--text-error, #c00)',
                      }}
                    >
                      inactive
                    </span>
                  )}
                </summary>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <strong>Moods:</strong>{' '}
                    {bp.moods.map((m) => (
                      <code key={m} style={tagStyle}>
                        {m}
                      </code>
                    ))}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <strong>Industries:</strong>{' '}
                    {bp.industries.map((i) => (
                      <code key={i} style={tagStyle}>
                        {i}
                      </code>
                    ))}
                  </div>

                  {bp.required_facts && bp.required_facts.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <strong>Required facts:</strong>{' '}
                      {bp.required_facts.map((f) => (
                        <code key={f} style={tagStyle}>
                          {f}
                        </code>
                      ))}
                    </div>
                  )}

                  <div style={{ marginBottom: 10 }}>
                    <strong>Layout spec:</strong>
                    <p
                      style={{
                        margin: '4px 0 0',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {bp.layout_spec}
                    </p>
                  </div>

                  {bp.css_hints && (
                    <details style={{ marginBottom: 10 }}>
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontSize: 12,
                          color: 'var(--text-muted)',
                        }}
                      >
                        CSS hints
                      </summary>
                      <pre
                        style={{
                          fontSize: 11,
                          background: 'var(--surface-primary)',
                          padding: 10,
                          borderRadius: 'var(--border-radius-sm, 4px)',
                          border: '1px solid var(--border-muted)',
                          overflow: 'auto',
                          marginTop: 6,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {bp.css_hints}
                      </pre>
                    </details>
                  )}

                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-muted)',
                    }}
                  >
                    <strong>Tier:</strong> {bp.tier}
                    {bp.source && (
                      <>
                        {' '}
                        · <strong>Source:</strong> {bp.source}
                      </>
                    )}
                    {' '}· <strong>v{bp.version}</strong> · reviewed{' '}
                    {bp.last_reviewed}
                  </div>
                </div>
              </details>
            ))}
          </div>
        );
      })}
    </div>
  );
}
