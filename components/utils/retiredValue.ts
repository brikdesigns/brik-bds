/**
 * ADR-033 § Retired vocabulary — runtime migration for renamed prop values.
 *
 * The compiler catches a retired value in a typed call site, but six repos
 * consume `@brikdesigns/bds` and a value that arrives from a database column,
 * a CMS field, or a `as string` cast is invisible to it. So the retired
 * spellings keep working for one minor, and say so once per value.
 *
 * Warns once per component + prop + value, matching AddableTextList's
 * `warnedValues` pattern — a list rendering 200 rows should log once, not 200
 * times.
 */

const warned = new Set<string>();

/**
 * Map a possibly-retired prop value onto its canonical spelling.
 *
 * @param component  Component name, for the warning prefix.
 * @param prop       Prop name, for the warning body.
 * @param value      The incoming value — canonical, retired, or undefined.
 * @param retired    Retired spelling → canonical spelling.
 * @returns The canonical value; `value` unchanged when it is not retired.
 */
export function resolveRetiredValue<T extends string>(
  component: string,
  prop: string,
  value: T | undefined,
  retired: Record<string, T>,
): T | undefined {
  if (value === undefined) return undefined;
  const canonical = retired[value];
  if (canonical === undefined) return value;

  const key = `${component}.${prop}.${value}`;
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(
      `[BDS ${component}] \`${prop}="${value}"\` is retired (ADR-033) — ` +
        `use \`${prop}="${canonical}"\`. The old spelling is honoured for one ` +
        `minor version and then removed.`,
    );
  }
  return canonical;
}

/**
 * Pick between a retired prop NAME and its canonical replacement, warning once
 * when the retired one is used.
 *
 * `resolveRetiredValue` above covers a renamed *value*; this covers a renamed
 * *prop*, which it cannot see. `tone="brand"` on a component whose hue-source
 * prop is now `emphasis` carries a perfectly canonical value, so nothing in the
 * value path fires — and ADR-033 § 2 retires the word `tone` on that axis, not
 * the value under it (#1925).
 *
 * The canonical prop wins when both are passed, matching Badge's `tone ?? status`
 * precedent (`components/ui/Badge/Badge.tsx:100`).
 *
 * @param component  Component name, for the warning prefix.
 * @param retiredProp     The deprecated prop name.
 * @param canonicalProp   The prop name that replaces it.
 * @param retiredValue    Value passed to the deprecated prop, if any.
 * @param canonicalValue  Value passed to the canonical prop, if any.
 * @returns `canonicalValue` when present, else `retiredValue`.
 */
export function resolveRetiredProp<T>(
  component: string,
  retiredProp: string,
  canonicalProp: string,
  retiredValue: T | undefined,
  canonicalValue: T | undefined,
): T | undefined {
  if (retiredValue !== undefined) {
    const key = `${component}.${retiredProp}→${canonicalProp}`;
    if (!warned.has(key)) {
      warned.add(key);
      console.warn(
        `[BDS ${component}] the \`${retiredProp}\` prop is retired (ADR-033 § 2) — ` +
          `use \`${canonicalProp}\`. The old prop is honoured for one minor ` +
          `version and then removed.`,
      );
    }
  }
  return canonicalValue ?? retiredValue;
}
