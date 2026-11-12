import { type HTMLAttributes } from 'react';
import { bdsClass } from '../../utils';
import './Eyebrow.css';

/** Never `h*` — an eyebrow is not an outline node (build-standards/html-semantics). */
export type EyebrowAs = 'p' | 'span';

export type EyebrowTone = 'muted' | 'primary';

export interface EyebrowProps extends HTMLAttributes<HTMLElement> {
  /** HTML element. `p` (default) for a kicker on its own line above a heading; `span` inline. Never a heading. */
  as?: EyebrowAs;
  /** Text colour. `muted` (default) is the common case; `primary` for stronger emphasis. Ignored when `onColor` is set. */
  tone?: EyebrowTone;
  /**
   * On-color mode — for an eyebrow on a filled brand/dark surface. Swaps text to
   * `--bds-text-on-color-dark`, same contract as `ContentBlock.onColor`, so the
   * consumer never pushes a `color` or `opacity` override. On
   * `--bds-surface-brand-primary` the pair is 3.78:1 (AA-large, not AA).
   */
  onColor?: boolean;
}

/**
 * Eyebrow — the short uppercase kicker above a heading. Owns the label font
 * family, label-tier size, semibold weight, letter-spacing, and the tight gap
 * to the heading below it. Not a `Tag`/`Badge`: it is a read-only line of
 * text, not a status or category pill. Pair it with a `ContentBlock` title.
 * @summary Uppercase kicker above a heading
 */
export function Eyebrow({
  as: Tag = 'p',
  tone = 'muted',
  onColor = false,
  className,
  ...props
}: EyebrowProps) {
  return (
    <Tag
      className={bdsClass(
        'bds-eyebrow',
        `bds-eyebrow--tone-${tone}`,
        onColor ? 'bds-eyebrow--on-color' : '',
        className,
      )}
      {...props}
    />
  );
}

export default Eyebrow;
