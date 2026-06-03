import { DataViewShell, TableSkeleton, type DataViewProps } from './DataView';

/**
 * TableView — loading / empty / error shell around a `Table`. A thin wrapper
 * that owns only those three states; the `Table` is passed as `children`.
 *
 * @example
 * ```tsx
 * <TableView
 *   loading={isLoading}
 *   error={error?.message}
 *   empty={rows.length === 0}
 *   emptyState={{ title: 'No services yet', description: 'Add one to get started.' }}
 * >
 *   <Table>…</Table>
 * </TableView>
 * ```
 *
 * @summary Loading/empty/error shell around a Table.
 */
export function TableView(props: DataViewProps) {
  return <DataViewShell defaultSkeleton={<TableSkeleton />} {...props} />;
}

export default TableView;
