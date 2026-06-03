import { type ReactNode } from 'react';
import { Banner } from '../Banner';
import { EmptyState } from '../EmptyState';
import { Skeleton } from '../Skeleton';
import { Stack } from '../Stack';
import './DataView.css';

/** Structured empty-state copy. Pass a `ReactNode` instead for full control. */
export interface DataViewEmptyConfig {
  title: string;
  description?: string;
  buttonProps?: {
    children: ReactNode;
    onClick?: () => void;
    iconBefore?: ReactNode;
    iconAfter?: ReactNode;
  };
}

export type DataViewEmpty = DataViewEmptyConfig | ReactNode;

/**
 * Shared prop surface for every `*View`. A view renders exactly one of four
 * states, in precedence order: **error → loading → empty → content**.
 */
export interface DataViewProps {
  /** Render the loading skeleton instead of `children`. */
  loading?: boolean;
  /**
   * When set (non-empty string), render an error `Banner` (`tone="error"`)
   * instead of `children`. Fail loud — never silently swallow.
   */
  error?: string | null;
  /** Title for the error banner. Default `"Couldn't load"`. */
  errorTitle?: string;
  /** When `true` (and not loading/error), render the empty state. */
  empty?: boolean;
  /** Empty-state copy. An object renders `<EmptyState>`; a `ReactNode` renders as-is. */
  emptyState?: DataViewEmpty;
  /** Override the default loading skeleton for this view. */
  skeleton?: ReactNode;
  /** The data display — `Table`, `CardList`, a `DataSection` stack, etc. */
  children: ReactNode;
}

function isEmptyConfig(value: DataViewEmpty): value is DataViewEmptyConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    typeof (value as DataViewEmptyConfig).title === 'string'
  );
}

/**
 * Internal state resolver shared by every `*View`. Re-exported only within
 * the DataView module (not from the package index) — consumers use the named
 * wrappers `TableView` / `ListView` / `ProfileView`.
 */
export function DataViewShell({
  loading,
  error,
  errorTitle = "Couldn't load",
  empty,
  emptyState,
  skeleton,
  defaultSkeleton,
  children,
}: DataViewProps & { defaultSkeleton: ReactNode }) {
  if (error) {
    return <Banner tone="error" title={errorTitle} description={error} />;
  }
  if (loading) {
    return <>{skeleton ?? defaultSkeleton}</>;
  }
  if (empty) {
    if (emptyState === undefined) return null;
    return isEmptyConfig(emptyState) ? (
      <EmptyState
        title={emptyState.title}
        description={emptyState.description}
        buttonProps={emptyState.buttonProps}
      />
    ) : (
      <>{emptyState}</>
    );
  }
  return <>{children}</>;
}

/* ─── Default skeletons ──────────────────────────────────────────
   Generic placeholders sized to the display shape. Consumers override
   via the `skeleton` prop when they want a higher-fidelity match. */

export function TableSkeleton() {
  return (
    <Stack gap="sm" className="bds-data-view__skeleton" aria-hidden="true">
      <Skeleton variant="rectangular" height={40} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={52} />
      ))}
    </Stack>
  );
}

export function ListSkeleton() {
  return (
    <Stack gap="sm" className="bds-data-view__skeleton" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={64} />
      ))}
    </Stack>
  );
}

export function ProfileSkeleton() {
  return (
    <Stack gap="xl" className="bds-data-view__skeleton" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, section) => (
        <Stack key={section} gap="sm">
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="rectangular" height={88} />
        </Stack>
      ))}
    </Stack>
  );
}

/* The named views live in their own files (`TableView.tsx`, `ListView.tsx`,
   `ProfileView.tsx`) — distinct components, not one polymorphic `variant` —
   each a thin shell over `DataViewShell` with its display-shaped skeleton. */
