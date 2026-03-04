interface ShadowScaleProps {
  title?: string;
  scale: Record<string, string>;
  prefix: string;
  label: string;
}

export function ShadowScale({ title, scale, prefix, label }: ShadowScaleProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div style={{ marginBottom: 'var(--_space---xl, 32px)' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--_typography---font-family--heading)',
            fontSize: 'var(--_typography---heading--small, 20px)',
            marginBottom: 'var(--_space---gap--md, 8px)',
            color: 'var(--_color---text--primary)',
          }}
        >
          {title}
        </h3>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 'var(--_space---gap--lg, 16px)',
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
                  backgroundColor: 'var(--_color---surface--primary)',
                  borderRadius: 'var(--_border-radius---md, 4px)',
                  boxShadow: shadow,
                  margin: '16px auto',
                }}
              />
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--_color---text--primary)',
                }}
              >
                {prefix}--{step}
              </div>
              <code
                style={{
                  fontSize: '11px',
                  color: 'var(--_color---text--muted)',
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
