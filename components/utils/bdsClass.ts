/**
 * BDS class name builder
 *
 * Concatenates a base class name with optional modifiers.
 * Filters out falsy values (false, null, undefined, empty string).
 *
 * @example
 * bdsClass('bds-button', `bds-button-${variant}`, loading && 'bds-button-loading', className)
 * // => "bds-button bds-button-primary"
 */
export function bdsClass(
  base: string,
  ...modifiers: (string | false | null | undefined)[]
): string {
  return [base, ...modifiers].filter(Boolean).join(' ');
}
