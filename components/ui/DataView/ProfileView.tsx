import { DataViewShell, ProfileSkeleton, type DataViewProps } from './DataView';

/**
 * ProfileView — loading / empty / error shell around a read-mode
 * `DataSection` + `FieldGrid` + `Field` stack. Children-only (V1): compose the
 * sections as `children`; this wrapper owns only the three states.
 *
 * @summary Loading/empty/error shell around a read-mode profile.
 */
export function ProfileView(props: DataViewProps) {
  return <DataViewShell defaultSkeleton={<ProfileSkeleton />} {...props} />;
}

export default ProfileView;
