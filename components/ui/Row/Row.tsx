import { Stack, type StackProps } from '../Stack';

export interface RowProps extends Omit<StackProps, 'orientation' | 'direction' | 'wrap'> {}

/**
 * Row — a single horizontal line of items that never wraps.
 *
 * A named Layout for the most common horizontal shape: an icon beside a
 * label, a value beside a unit, a title beside a trailing action. Row is
 * `Stack orientation="horizontal"` with row-shaped defaults (`gap="sm"`,
 * `align="center"`), so it shares Stack's classes and gap scale.
 *
 * Row never wraps — items shrink or overflow instead. When items should
 * flow onto a second line as space runs out (tags, button groups, filter
 * pills), use `Cluster`, which always wraps.
 *
 * @example
 * ```tsx
 * <Row gap="sm">
 *   <Icon icon="ph:map-pin" />
 *   <span>Denver, CO</span>
 * </Row>
 *
 * <Row justify="between">
 *   <h3>Invoices</h3>
 *   <Button size="sm">New invoice</Button>
 * </Row>
 * ```
 *
 * @summary A single horizontal line of items that never wraps.
 */
export function Row({ gap = 'sm', align = 'center', ...props }: RowProps) {
  return <Stack orientation="horizontal" gap={gap} align={align} {...props} />;
}

export default Row;
