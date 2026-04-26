interface ScaleProps {
  title?: string;
  /** Map of step name → value (e.g. `{ "100": "4px", "200": "8px" }`). */
  scale: Record<string, string>;
  /** Token-name prefix for display labels (e.g. `--border-radius`). */
  prefix: string;
}

/**
 * Grid of squares with progressively rounded corners. Visualizes the
 * border-radius primitive scale. Sorted by numeric value ascending — pill
 * and circle land at the end.
 */
export function BorderRadiusPreview({ title, scale }: ScaleProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div className="my-6">
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '16px',
        }}
      >
        {entries.map(([step, value]) => (
          <div key={step} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                backgroundColor: 'var(--background-brand-primary, #e35335)',
                borderRadius: value,
                margin: '0 auto 8px',
                opacity: 0.85,
              }}
            />
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary, #111827)',
              }}
            >
              {step}
            </div>
            <code
              style={{
                fontSize: '11px',
                color: 'var(--text-muted, #6b7280)',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              }}
            >
              {value}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontal border-width preview rows. Each row shows token name, a sample
 * line at the actual width, and the value.
 */
export function BorderWidthPreview({ title, scale, prefix }: ScaleProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div className="my-6">
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div className="flex flex-col gap-2">
        {entries.map(([step, value]) => (
          <div key={step} className="flex items-center gap-4 py-1">
            <code
              className="text-xs"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                width: '180px',
                flexShrink: 0,
                color: 'var(--text-muted, #6b7280)',
              }}
            >
              {prefix}-{step}
            </code>
            <div
              style={{
                width: '200px',
                height: 0,
                borderTop: `${value} solid var(--border-brand-primary, #e35335)`,
                flexShrink: 0,
              }}
            />
            <span
              className="text-xs"
              style={{
                color: 'var(--text-secondary, #374151)',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ShadowScaleProps {
  title?: string;
  scale: Record<string, string>;
  prefix: string;
  /** Which shadow axis this scale represents. Drives the box-shadow composition. */
  label: 'blur' | 'spread' | 'offset';
}

/**
 * Grid of squares each rendering a synthetic shadow at the scale step's value.
 * The label prop drives whether the value goes into blur, spread, or offset.
 * For composed semantic tokens (--shadow-sm, --shadow-md, etc.) use a markdown
 * table — those aren't on a single-axis scale.
 */
export function ShadowScale({ title, scale, prefix, label }: ShadowScaleProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div className="my-6">
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '16px',
        }}
      >
        {entries.map(([step, value]) => {
          const px = parseFloat(value);
          const shadow =
            label === 'blur'
              ? `0 4px ${px}px rgba(0,0,0,0.15)`
              : label === 'spread'
                ? `0 0 0 ${px}px rgba(0,0,0,0.1)`
                : `0 ${px}px 8px rgba(0,0,0,0.15)`;

          return (
            <div key={step} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--surface-primary, #ffffff)',
                  borderRadius: '4px',
                  boxShadow: shadow,
                  margin: '16px auto',
                }}
              />
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #111827)',
                }}
              >
                {prefix}-{step}
              </div>
              <code
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted, #6b7280)',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                }}
              >
                {value}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}
