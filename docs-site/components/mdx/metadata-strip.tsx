import type { ReactNode } from 'react';

interface MetadataItem {
  label: string;
  value: ReactNode;
}

interface MetadataStripProps {
  items: MetadataItem[];
}

/**
 * Compact "label · value" strip for page-header metadata. Used at the top of
 * industry packs (Version · Last reviewed · Cadence), voice patterns, and
 * other content-system pages where versioning is load-bearing.
 *
 * Stays tight — one line on desktop, wraps gracefully on mobile.
 */
export function MetadataStrip({ items }: MetadataStripProps) {
  return (
    <div
      className="my-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-fd-border px-3 py-2 text-sm"
      style={{ background: 'var(--surface-subtle, #fafafa)' }}
    >
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-baseline gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
            {item.label}
          </span>
          <span className="font-mono text-sm text-fd-foreground">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
