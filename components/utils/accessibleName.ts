import type { ReactNode } from 'react';

/**
 * Requires a form control to carry an accessible name at the type level.
 *
 * A consumer must supply at least one of:
 *   - `label` — the visible label (rendered by the control)
 *   - `aria-label` — a non-visible name, for controls whose purpose the
 *     surrounding UI already conveys
 *   - `aria-labelledby` — the id of an element that names the control
 *
 * The other two stay optional in each branch, so `label` + `aria-describedby`
 * style combos still compile. Omitting all three is a type error.
 *
 * `Label` is the type of `label` — `string` for most controls; ToggleSwitch
 * passes `ReactNode` because its label is rich content today.
 *
 * Compose per control: `type XxxProps = XxxBaseProps & AccessibleNameProps`
 * (an interface cannot `extend` a union, so each control keeps a
 * `XxxBaseProps` interface for everything else).
 */
export type AccessibleNameProps<Label = string> =
  | {
      /** Visible label rendered with the control. One of `label`, `aria-label`, `aria-labelledby` is required. */
      label: Label;
      /** Accessible name when no visible label is rendered. */
      'aria-label'?: string;
      /** Id of the element that names the control. */
      'aria-labelledby'?: string;
    }
  | {
      /** Visible label rendered with the control. One of `label`, `aria-label`, `aria-labelledby` is required. */
      label?: Label;
      /** Accessible name when no visible label is rendered. */
      'aria-label': string;
      /** Id of the element that names the control. */
      'aria-labelledby'?: string;
    }
  | {
      /** Visible label rendered with the control. One of `label`, `aria-label`, `aria-labelledby` is required. */
      label?: Label;
      /** Accessible name when no visible label is rendered. */
      'aria-label'?: string;
      /** Id of the element that names the control. */
      'aria-labelledby': string;
    };

/**
 * Requires a Modal (dialog) to carry an accessible name: a `title`, which
 * labels the dialog automatically, or an `aria-label` for a titleless modal.
 */
export type ModalAccessibleNameProps =
  | {
      /** Dialog title — also the dialog's accessible name. One of `title` or `aria-label` is required. */
      title: NonNullable<ReactNode>;
      /** Accessible name for a titleless modal. */
      'aria-label'?: string;
    }
  | {
      /** Dialog title — also the dialog's accessible name. One of `title` or `aria-label` is required. */
      title?: ReactNode;
      /** Accessible name for a titleless modal. */
      'aria-label': string;
    };
