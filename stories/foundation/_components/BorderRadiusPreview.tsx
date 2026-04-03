interface BorderRadiusPreviewProps {
  title?: string;
  scale: Record<string, string>;
  prefix: string;
}

export function BorderRadiusPreview({ title, scale }: BorderRadiusPreviewProps) {
  const entries = Object.entries(scale).sort((a, b) => {
    const aNum = parseFloat(a[1]);
    const bNum = parseFloat(b[1]);
    return aNum - bNum;
  });

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-sm, 20px)',
            marginBottom: 'var(--gap-md, 8px)',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h3>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 'var(--gap-lg, 16px)',
        }}
      >
        {entries.map(([step, value]) => (
          <div key={step} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                backgroundColor: 'var(--background-brand-primary)',
                borderRadius: value,
                margin: '0 auto 8px',
                opacity: 0.8,
              }}
            />
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {step}
            </div>
            <code
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
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

interface BorderWidthPreviewProps {
  title?: string;
  scale: Record<string, string>;
  prefix: string;
}

export function BorderWidthPreview({ title, scale, prefix }: BorderWidthPreviewProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'var(--heading-sm, 20px)',
            marginBottom: 'var(--gap-md, 8px)',
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entries.map(([step, value]) => (
          <div
            key={step}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '6px 0',
            }}
          >
            <code
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '12px',
                width: '180px',
                flexShrink: 0,
                color: 'var(--text-muted)',
              }}
            >
              {prefix}--{step}
            </code>
            <div
              style={{
                width: '200px',
                height: '0',
                borderTop: `${value} solid var(--border-brand-primary)`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
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
