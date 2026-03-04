interface TypographyScaleProps {
  title?: string;
  scale: Record<string, string>;
  prefix: string;
}

export function TypographyScale({ title, scale, prefix }: TypographyScaleProps) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map(([step, value]) => (
          <div
            key={step}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '16px',
              padding: '6px 0',
              borderBottom: '1px solid var(--_color---border--muted, #e0e0e0)',
            }}
          >
            <code
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '12px',
                width: '140px',
                flexShrink: 0,
                color: 'var(--_color---text--muted)',
              }}
            >
              {prefix}--{step}
            </code>
            <span
              style={{
                fontSize: value,
                lineHeight: 1.2,
                fontFamily: 'var(--_typography---font-family--body)',
                color: 'var(--_color---text--primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '400px',
              }}
            >
              {parseFloat(value) > 60 ? 'Ag' : 'The quick brown fox'}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--_color---text--muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                flexShrink: 0,
                marginLeft: 'auto',
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

interface FontFamilyShowcaseProps {
  families: Array<{ name: string; cssVar: string; value: string }>;
}

export function FontFamilyShowcase({ families }: FontFamilyShowcaseProps) {
  return (
    <div style={{ marginBottom: 'var(--_space---xl, 32px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg, 16px)' }}>
        {families.map((f) => (
          <div
            key={f.cssVar}
            style={{
              padding: 'var(--_space---md, 16px)',
              backgroundColor: 'var(--_color---surface--secondary)',
              borderRadius: 'var(--_border-radius---md, 4px)',
              border: '1px solid var(--_color---border--muted)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--_color---text--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              {f.name}
            </div>
            <div
              style={{
                fontFamily: `var(${f.cssVar})`,
                fontSize: '28px',
                color: 'var(--_color---text--primary)',
                marginBottom: '4px',
              }}
            >
              ABCDEFGHIJKLM abcdefghijklm 0123456789
            </div>
            <code
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '11px',
                color: 'var(--_color---text--muted)',
              }}
            >
              {f.cssVar} → {f.value}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SemanticTypographyTableProps {
  title?: string;
  tokens: Record<string, string>;
  category: string;
}

export function SemanticTypographyTable({ title, tokens, category }: SemanticTypographyTableProps) {
  const entries = Object.entries(tokens).filter(([name]) => name.startsWith(category));

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map(([name, value]) => {
          const cssVar = `--_typography---${name}`;
          return (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '16px',
                padding: '8px 0',
                borderBottom: '1px solid var(--_color---border--muted, #e0e0e0)',
              }}
            >
              <code
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '12px',
                  width: '200px',
                  flexShrink: 0,
                  color: 'var(--_color---text--muted)',
                }}
              >
                {cssVar}
              </code>
              <span
                style={{
                  fontSize: `var(${cssVar})`,
                  lineHeight: 1.3,
                  fontFamily: 'var(--_typography---font-family--body)',
                  color: 'var(--_color---text--primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                The quick brown fox
              </span>
              <code
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '11px',
                  color: 'var(--_color---text--muted)',
                  flexShrink: 0,
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

interface FontWeightShowcaseProps {
  weights: Record<string, string>;
}

export function FontWeightShowcase({ weights }: FontWeightShowcaseProps) {
  const entries = Object.entries(weights).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));

  return (
    <div style={{ marginBottom: 'var(--_space---xl, 32px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map(([name, value]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '16px',
              padding: '6px 0',
              borderBottom: '1px solid var(--_color---border--muted, #e0e0e0)',
            }}
          >
            <code
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '12px',
                width: '200px',
                flexShrink: 0,
                color: 'var(--_color---text--muted)',
              }}
            >
              --font-weight--{name}
            </code>
            <span
              style={{
                fontWeight: parseInt(value) as unknown as number,
                fontSize: '18px',
                fontFamily: 'var(--_typography---font-family--body)',
                color: 'var(--_color---text--primary)',
              }}
            >
              The quick brown fox ({value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
