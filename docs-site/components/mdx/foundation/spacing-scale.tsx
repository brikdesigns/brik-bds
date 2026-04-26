interface SpacingScaleProps {
  title?: string;
  /** Map of step name → value (e.g. `{ "100": "4px", "200": "8px" }`). */
  scale: Record<string, string>;
  /** CSS variable prefix used to render the token name (e.g. `--space`). */
  prefix: string;
}

/**
 * Visualizes a numeric spacing scale: token name + scaled bar + value.
 * Sorted by numeric value ascending.
 */
export function SpacingScale({ title, scale, prefix }: SpacingScaleProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div className="my-6">
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div className="flex flex-col gap-1">
        {entries.map(([step, value]) => {
          const px = parseFloat(value);
          return (
            <div key={step} className="flex items-center gap-3 py-1">
              <code
                className="text-xs"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  width: '160px',
                  flexShrink: 0,
                  color: 'var(--text-muted, #6b7280)',
                }}
              >
                {prefix}-{step}
              </code>
              <div
                style={{
                  width: `${Math.min(px, 300)}px`,
                  height: '20px',
                  backgroundColor: 'var(--background-brand-primary, #e35335)',
                  borderRadius: '2px',
                  opacity: 0.7,
                  flexShrink: 0,
                }}
              />
              <span
                className="text-xs"
                style={{
                  color: 'var(--text-secondary, #374151)',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  flexShrink: 0,
                }}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SemanticSpacingProps {
  title?: string;
  /** Map of token name → reference value (e.g. `{ "padding-md": "var(--space-400)" }`). */
  tokens: Record<string, string>;
  /** CSS variable prefix used for the rendered var (e.g. `--padding`). */
  varPrefix: string;
}

/**
 * Table of semantic spacing tokens with a live preview bar showing the
 * resolved size. Used for padding-* and gap-* token tables.
 */
export function SemanticSpacing({ title, tokens, varPrefix }: SemanticSpacingProps) {
  const entries = Object.entries(tokens);

  return (
    <div className="my-6">
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-fd-border">
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
              Preview
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
              Token
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
              CSS Variable
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
              Maps to
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, value]) => {
            const fullVar = `${varPrefix}-${name.replace(/^[a-z]+-/, '')}`;
            return (
              <tr key={name} className="border-b border-fd-border">
                <td className="px-3 py-2 align-middle" style={{ width: '120px' }}>
                  <div
                    style={{
                      width: `var(${fullVar}, 16px)`,
                      maxWidth: '100px',
                      height: '16px',
                      backgroundColor: 'var(--background-brand-primary, #e35335)',
                      borderRadius: '2px',
                      opacity: 0.7,
                    }}
                  />
                </td>
                <td className="px-3 py-2 align-middle font-semibold">{name}</td>
                <td className="px-3 py-2 align-middle">
                  <code className="rounded bg-fd-muted px-1.5 py-0.5 text-xs">{fullVar}</code>
                </td>
                <td className="px-3 py-2 align-middle">
                  <code className="rounded bg-fd-muted px-1.5 py-0.5 text-xs">{value}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
