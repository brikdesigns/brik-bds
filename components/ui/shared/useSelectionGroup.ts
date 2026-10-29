'use client';

import { createContext, useContext } from 'react';

/** Selection cardinality of the surrounding group — `radio` picks one, `checkbox` picks many. */
export type SelectionGroupKind = 'radio' | 'checkbox';

/**
 * What a `RadioGroup` / `CheckboxGroup` tells the selectable items rendered as
 * its children (ADR-045 § 2). An item reads this through `useSelectionGroup`
 * and renders a native `<input>` of `kind` instead of an `aria-pressed` button.
 */
export interface SelectionGroupContextValue {
  /** Native input type the item renders. */
  kind: SelectionGroupKind;
  /**
   * Shared native `name`. Always set for `radio` (the browser needs it for
   * exclusivity + roving arrow keys); for `checkbox` only when the group was
   * given one, so an unnamed group adds no key to a surrounding `<form>`.
   */
  name: string | undefined;
  /** Whether the option with this `value` is currently selected. */
  isSelected: (value: string) => boolean;
  /** Select (radio) or toggle (checkbox) the option with this `value`. */
  onChange: (value: string) => void;
  /** The whole group is disabled. */
  disabled: boolean;
}

export const SelectionGroupContext = createContext<SelectionGroupContextValue | null>(null);

/** The surrounding selection group's state, or `null` outside one. */
export function useSelectionGroup(): SelectionGroupContextValue | null {
  return useContext(SelectionGroupContext);
}
