import type { ReactNode } from 'react';

interface AnatomyPart {
  /** Numeric label that appears on the diagram. */
  number: number;
  /** The named part. */
  name: string;
  /** What this part is responsible for. */
  description: string;
  /** Optional — mark this part as required. */
  required?: boolean;
}

interface ComponentAnatomyProps {
  /** Live render of the component to label. */
  children: ReactNode;
  /** Ordered list of parts; numbers should match callouts in `children` if you place them. */
  parts: AnatomyPart[];
}

/**
 * Side-by-side: live component preview (left) + numbered parts list (right).
 * Replaces ASCII-art anatomy diagrams. Authors place numeric callouts in the
 * preview JSX (small badge components or absolutely-positioned dots) that
 * correspond to entries in `parts`.
 *
 * Goal: agents and humans can see what gets called what without the diagram
 * silently rotting against component changes — because the diagram IS the
 * component, rendered live.
 */
export function ComponentAnatomy({ children, parts }: ComponentAnatomyProps) {
  return (
    <div className="my-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div
        className="flex items-center justify-center rounded-lg border border-fd-border p-8"
        style={{ background: 'var(--surface-subtle, #fafafa)' }}
      >
        {children}
      </div>
      <ol className="m-0 flex flex-col gap-2 p-0">
        {parts.map((part) => (
          <li
            key={part.number}
            className="flex gap-3 rounded-md border border-fd-border bg-fd-card p-3"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                background: 'var(--background-brand-primary, #111827)',
                color: 'var(--text-on-color-dark, #ffffff)',
              }}
            >
              {part.number}
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                {part.name}
                {part.required && (
                  <span className="rounded bg-fd-muted px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-fd-muted-foreground">
                    required
                  </span>
                )}
              </div>
              <p className="m-0 text-sm text-fd-muted-foreground">
                {part.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
