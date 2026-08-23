import { type HTMLAttributes, type ReactNode } from 'react';
import { bdsClass, resolveRetiredValue } from '../../utils';
import './Field.css';

export type FieldOrientation = 'vertical' | 'horizontal';

/** @deprecated Renamed `FieldOrientation`; values `stacked`/`inline` → `vertical`/`horizontal` (ADR-033 § 2). */
export type FieldLayout = FieldOrientation;

export type FieldTier = 'standard' | 'compact';
export type FieldHelperTone = 'neutral' | 'negative';

const RETIRED_TONES: Record<string, FieldHelperTone> = { error: 'negative' };

/** Retired orientation spellings, honoured for one minor version (ADR-033 § 2). */
const RETIRED_ORIENTATIONS: Record<string, FieldOrientation> = {
  stacked: 'vertical',
  inline: 'horizontal',
};

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Field label — rendered above (vertical) or beside (horizontal) the value. */
  label: string;
  /** Value content — text, <TagGroup>, <BulletList>, <a>, or any ReactNode. */
  children?: ReactNode;
  /** `vertical` = label above value (default). `horizontal` = label / value on one row. */
  orientation?: FieldOrientation;
  /**
   * @deprecated Use `orientation` instead; `stacked`→`vertical`, `inline`→`horizontal`
   * (ADR-033 § 2). Honoured for one minor version; `orientation` wins when both are passed.
   */
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
  orientation,
  layout,
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
  // `orientation` wins; `layout` accepts the retired `stacked`/`inline` spellings.
  const resolvedOrientation =
    resolveRetiredValue(
      'Field',
      orientation !== undefined ? 'orientation' : 'layout',
      (orientation ?? layout) as FieldOrientation,
      RETIRED_ORIENTATIONS,
    ) ?? 'vertical';
  const showEmpty = isEmpty(children);

  return (
    <div
      className={bdsClass(
        'bds-field',
        `bds-field--${resolvedOrientation}`,
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
