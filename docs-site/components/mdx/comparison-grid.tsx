import type { ReactNode } from 'react';

interface ComparisonItem {
  /** Component or option name. */
  title: string;
  /** Optional live preview. Renders above the prose. */
  preview?: ReactNode;
  /** One-sentence "when to reach for this." */
  whenToUse: string;
  /** Optional "don't reach for this when..." line. */
  whenNotToUse?: string;
  /** Optional code snippet to copy. */
  code?: string;
}

interface ComparisonGridProps {
  items: ComparisonItem[];
}

/**
 * Side-by-side "X vs Y vs Z" decision grid. The use-case for the moment a
 * reader/agent has to pick between adjacent components — Button vs LinkButton
 * vs IconButton, Switch vs Checkbox, AlertBanner vs Toast vs Tooltip.
 *
 * Three columns is the sweet spot. Two reads as a pair (use a table). Four+
 * gets dense — split into two grids by category.
 */
export function ComparisonGrid({ items }: ComparisonGridProps) {
  return (
    <div
      className="my-6 grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item) => (
        <div
          key={item.title}
          className="flex flex-col overflow-hidden rounded-lg border border-fd-border"
        >
          {item.preview && (
            <div
              className="flex min-h-[80px] items-center justify-center border-b border-fd-border p-4"
              style={{ background: 'var(--surface-subtle, #fafafa)' }}
            >
              {item.preview}
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2 p-4">
            <h4 className="m-0 text-sm font-semibold">{item.title}</h4>
            <p className="m-0 text-sm text-fd-muted-foreground">
              <strong className="text-fd-foreground">Use when:</strong> {item.whenToUse}
            </p>
            {item.whenNotToUse && (
              <p className="m-0 text-sm text-fd-muted-foreground">
                <strong className="text-fd-foreground">Don't:</strong> {item.whenNotToUse}
              </p>
            )}
            {item.code && (
              <pre className="m-0 mt-auto overflow-x-auto rounded bg-fd-muted px-2 py-1.5 text-xs">
                <code>{item.code}</code>
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
