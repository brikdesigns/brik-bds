import { DataViewShell, BoardSkeleton, type DataViewProps } from './DataView';

/**
 * BoardView — loading / empty / error shell around a `Board`. A thin wrapper
 * that owns only those three states; the `Board` (with its `BoardColumn`
 * children) is passed as `children`.
 *
 * @example
 * ```tsx
 * <BoardView
 *   loading={isLoading}
 *   error={error?.message}
 *   empty={columns.length === 0}
 *   emptyState={{ title: 'No lanes yet', description: 'Add a column to get started.' }}
 * >
 *   <Board>
 *     <BoardColumn title="To do" count={3}>…</BoardColumn>
 *   </Board>
 * </BoardView>
 * ```
 *
 * @summary Loading/empty/error shell around a Board.
 */
export function BoardView(props: DataViewProps) {
  return <DataViewShell defaultSkeleton={<BoardSkeleton />} {...props} />;
}

export default BoardView;
