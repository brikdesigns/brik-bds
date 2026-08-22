import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Field.css';

export type FieldLayout = 'stacked' | 'inline';
export type FieldTier = 'standard' | 'compact';
export type FieldHelperTone = 'neutral' | 'negative';

const RETIRED_TONES: Record<string, FieldHelperTone> = { error: 'negative' };

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Field label — rendered above (stacked) or beside (inline) the value. */
  label: string;
  /** Value content — text, <TagGroup>, <BulletList>, <a>, or any ReactNode. */
  children?: ReactNode;
  /** Stacked = label above value (default). Inline = label / value on one row. */
  layout?: FieldLayout;
  /**
   * Typography tier override. **Omit it** — the tier is derived from the
   * container, so a Field is page-tier (`--label-md`) by default and sheet-tier
   * (`--label-sm`) inside a `Sheet` body, with no prop passed.
   *
   * Pass a value only to pin against the container: `standard` forces
   * `--label-md` even inside a Sheet body, `compact` forces `--label-sm`
   * anywhere. A dual-context component should not pass this at all.
   */
  tier?: FieldTier;
  /**
   * Rendered when `children` is null / undefined / empty string.
   * Defaults to the inline muted string "Not set".
   * Pass `<EmptyState />` when a whole section is empty and a larger
   * treatment is warranted — prefer inline text for per-row empties.
   */
  empty?: ReactNode;
  /** Helper or validation text rendered below the value. */
  helper?: ReactNode;
  /** Tone for the helper slot. `neutral` = muted gray (default). `negative` = red. */
  helperTone?: FieldHelperTone;
}

function isEmpty(value: ReactNode): boolean {
  return value == null || value === '' || value === false;
}

/**
 * Field — label + value pair for read-mode display on a page or in a Sheet.
 *
 * The single biggest win over ad-hoc markup: one API covers text,
 * tags, URLs, bullet lists, and empty states. Locks label typography,
 * value spacing, and the "Not set" empty treatment.
 *
 * The typography tier is **derived from the container**: page-tier by default,
 * sheet-tier inside a `Sheet` body. Pass `tier` only to pin against that. Use
 * `helper` + `helperTone` for validation or hint text below the value.
 *
 * @summary Read-mode label + value pair, page- or sheet-tier by context
 */
export function Field({
  label,
  children,
  layout = 'stacked',
  tier,
  empty = 'Not set',
  helper,
  helperTone,
  className,
  style,
  ...props
}: FieldProps) {
  const resolvedHelperTone =
    resolveRetiredValue('Field', 'helperTone', helperTone, RETIRED_TONES) ?? 'neutral';
  const showEmpty = isEmpty(children);

  return (
    <div
      className={bdsClass(
        'bds-field',
        `bds-field--${layout}`,
        // Only an explicit tier emits a class. No class = the container's
        // inherited default applies, which is how context adaptivity works.
        tier && `bds-field--${tier}`,
        className,
      )}
      style={style}
      {...props}
    >
      <span className="bds-field__label">{label}</span>
      {showEmpty ? (
        <span className="bds-field__empty">{empty}</span>
      ) : (
        <div className="bds-field__value">{children}</div>
      )}
      {helper != null && (
        <span
          className={bdsClass(
            'bds-field__helper',
            resolvedHelperTone === 'negative' && 'bds-field__helper--tone-negative',
          )}
        >
          {helper}
        </span>
      )}
    </div>
  );
}

export default Field;
