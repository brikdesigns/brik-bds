import { DataViewShell, ListSkeleton, type DataViewProps } from './DataView';

/**
 * ListView — loading / empty / error shell around a `CardList` /
 * `InteractiveListItem` stack. The list is passed as `children`.
 *
 * @summary Loading/empty/error shell around a list.
 */
export function ListView(props: DataViewProps) {
  return <DataViewShell defaultSkeleton={<ListSkeleton />} {...props} />;
}

export default ListView;
