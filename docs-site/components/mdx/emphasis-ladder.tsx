import type { ReactNode } from 'react';

interface Rung {
  /** The variant or option name. */
  label: string;
  /** Live element to display in the rung. Usually a BDS component. */
  example: ReactNode;
  /** When to reach for this rung. One sentence. */
  use: string;
}

interface EmphasisLadderProps {
  /** Top-of-ladder caption. e.g. "highest emphasis →  lowest" */
  caption?: string;
  /** Ordered list of rungs, highest-emphasis first. */
  rungs: Rung[];
}

/**
 * Visualizes an ordered ladder of variants from highest emphasis to lowest.
 * Used for Button (primary → outline → secondary → ghost), alert variants,
 * card surfaces, etc. The rung order is meaningful — agents and humans should
 * pick top-down based on the action's importance.
 */
export function EmphasisLadder({ caption, rungs }: EmphasisLadderProps) {
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-fd-border">
      {caption && (
        <div className="border-b border-fd-border bg-fd-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
          {caption}
        </div>
      )}
      <div className="divide-y divide-fd-border">
        {rungs.map((rung, i) => (
          <div
            key={rung.label}
            className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,2fr)] items-center gap-4 px-4 py-3"
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                background: 'var(--surface-subtle, #f3f4f6)',
                color: 'var(--text-secondary, #6b7280)',
              }}
            >
              {i + 1}
            </div>
            <div className="flex items-center gap-3">
              {rung.example}
              <code className="text-xs text-fd-muted-foreground">{rung.label}</code>
            </div>
            <p className="m-0 text-sm text-fd-muted-foreground">{rung.use}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
