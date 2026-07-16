import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { ButtonGroup } from '../ButtonGroup';
import { type ButtonSize } from '../Button';
import { bdsClass } from '../../utils';
import './PageHeaderActions.css';

export interface PageHeaderActionsProps {
  /**
   * The main call-to-action — the single highest-emphasis action
   * (`Button variant="primary"` or an equivalent wrapper). Rendered
   * far right, closest to the reading-end / thumb.
   */
  primary?: ReactNode;
  /**
   * Lower-emphasis actions (`outline` / `secondary` / `ghost`). Rendered
   * between the destructive and primary slots. Accepts one element or a
   * Fragment of several.
   */
  secondary?: ReactNode;
  /**
   * Destructive action (`Button variant="destructive"` or an equivalent
   * wrapper). Rendered far left, visually separated from the affirmative
   * actions so it is never adjacent to the primary.
   */
  destructive?: ReactNode;
  /**
   * Shared button size applied to every slotted element that does not set
   * its own `size`. Default `md` — the canonical page-header action size
   * (see the component-build standard § Button sizing). This is what makes
   * the group size-consistent: consumers stop hand-picking mismatched sizes.
   */
  size?: ButtonSize;
  className?: string;
}

/**
 * PageHeaderActions — structured action hierarchy for the {@link PageHeader}
 * `actions` slot.
 *
 * Replaces the hand-composed `<div style={{ display: 'flex', gap }}>` that
 * every consumer improvised into `actions` — that pattern let each surface
 * pick its own ordering and mix button sizes side by side (BACKLOG-638).
 * This primitive fixes the hierarchy once:
 *
 * - **Ordering** — `destructive` (far left) · `secondary` · `primary` (far
 *   right). The primary always lands at the reading-end; the destructive is
 *   held away from it.
 * - **Spacing + alignment** — composed on {@link ButtonGroup} (`align="end"`),
 *   the canonical action-row treatment.
 * - **Size** — a single `size` (default `md`) is injected into every slotted
 *   element that does not already set one, so a group can't render a `sm`
 *   next to an `lg`.
 *
 * Slots accept rendered elements (a raw `<Button>` or a consumer wrapper like
 * `<DeleteCompanyButton>`), so it fits both catalog buttons and app-specific
 * action components. Non-breaking: `PageHeader`'s `actions` prop still accepts
 * any `ReactNode` — pass a `PageHeaderActions` when you want the enforced
 * hierarchy.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Acme Corp"
 *   actions={
 *     <PageHeaderActions
 *       destructive={<Button variant="destructive">Delete</Button>}
 *       secondary={<Button variant="outline">Edit</Button>}
 *       primary={<Button variant="primary">New Proposal</Button>}
 *     />
 *   }
 * />
 * ```
 *
 * @summary Structured primary / secondary / destructive action group for PageHeader
 */
export function PageHeaderActions({
  primary,
  secondary,
  destructive,
  size = 'md',
  className,
}: PageHeaderActionsProps) {
  // Inject the shared `size` into any slotted element that hasn't set its
  // own — the child's explicit `size` always wins. Custom wrapper components
  // that don't consume `size` simply ignore the extra prop.
  const withSize = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (!isValidElement(child)) return child;
      const props = child.props as { size?: ButtonSize };
      if (props.size !== undefined) return child;
      return cloneElement(child, { size } as Partial<typeof props>);
    });

  const hasAny = primary != null || secondary != null || destructive != null;
  if (!hasAny) return null;

  return (
    <ButtonGroup align="end" className={bdsClass('bds-page-header-actions', className)}>
      {destructive != null && withSize(destructive)}
      {secondary != null && withSize(secondary)}
      {primary != null && withSize(primary)}
    </ButtonGroup>
  );
}

export default PageHeaderActions;
